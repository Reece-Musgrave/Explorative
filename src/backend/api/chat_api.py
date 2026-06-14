from __future__ import annotations
from collections import defaultdict
from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect
from sqlalchemy import func
from sqlalchemy.orm import Session
from backend.core.config import settings
from backend.db.session import get_db
from backend.models.chat import ChatMessage, ChatReaction
from backend.services.chat_manager import manager
import jwt


router = APIRouter(tags=["chat"])
HISTORY_LIMIT = 50
ALLOWED_EMOJIS = {"👍", "😂", "❤️", "😮", "😢"}


def _reactions_for_messages(db: Session, message_ids: list[int]) -> dict[int, dict[str, int]]:
    if not message_ids:
        return {}
    rows = (
        db.query(ChatReaction.message_id, ChatReaction.emoji, func.count(ChatReaction.id))
        .filter(ChatReaction.message_id.in_(message_ids))
        .group_by(ChatReaction.message_id, ChatReaction.emoji)
        .all()
    )
    result: dict[int, dict[str, int]] = defaultdict(dict)
    for msg_id, emoji, count in rows:
        result[msg_id][emoji] = count
    return result

def _user_reactions_for_messages(db: Session, message_ids: list[int], username: str) -> dict[int, list[str]]:
    if not message_ids:
        return {}
    rows = (
        db.query(ChatReaction.message_id, ChatReaction.emoji)
        .filter(ChatReaction.message_id.in_(message_ids), ChatReaction.username == username)
        .all()
    )
    result: dict[int, list[str]] = defaultdict(list)
    for msg_id, emoji in rows:
        result[msg_id].append(emoji)
    return result

@router.websocket("/ws/chat/{show_name}/{season}/{episode}")
async def chat_websocket(
    websocket: WebSocket,
    show_name: str,
    season: int,
    episode: int,
    token: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> None:
    username: str | None = None
    if token:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            username = payload.get("sub")
        except (jwt.PyJWTError, Exception):
            pass

    key = manager.room_key(show_name, season, episode)
    await manager.connect(websocket, key, username)

    try:
        history = (
            db.query(ChatMessage)
            .filter_by(
                show_name=show_name,
                season_number=season,
                episode_number=episode,
            )
            .order_by(ChatMessage.created_at.desc())
            .limit(HISTORY_LIMIT)
            .all()
        )
        history = list(reversed(history))

        history_ids = [m.id for m in history]
        reactions_map = _reactions_for_messages(db, history_ids)
        user_reactions_map = _user_reactions_for_messages(db, history_ids, username) if username else {}

        for msg in history:
            await websocket.send_json({
                "type": "history",
                "id": msg.id,
                "username": msg.username,
                "message": msg.message,
                "created_at": msg.created_at.isoformat(),
                "reactions": reactions_map.get(msg.id, {}),
                "user_reactions": user_reactions_map.get(msg.id, []),
                "reply_to_id": msg.reply_to_id,
                "reply_to_username": msg.reply_to_username,
                "reply_to_message": msg.reply_to_message,
            })

        await manager.broadcast(
            key, {"type": "viewer_count", "count": manager.viewer_count(key)}
        )

        while True:
            data: dict = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "message":
                if not username:
                    await websocket.send_json({
                        "type": "error", "code": "AUTH_REQUIRED",
                        "message": "You must be logged in to send messages.",
                    })
                    continue

                text = data.get("message", "").strip()[:500]
                if not text:
                    continue

                if manager.is_rate_limited(username):
                    await websocket.send_json({
                        "type": "error", "code": "RATE_LIMITED",
                        "message": f"Slow down — max {5} messages per {30} s.",
                    })
                    continue

                reply_to_id = data.get("reply_to_id")
                reply_msg = None
                if isinstance(reply_to_id, int):
                    reply_msg = db.query(ChatMessage).filter_by(id=reply_to_id).first()

                chat_msg = ChatMessage(
                    show_name=show_name,
                    season_number=season,
                    episode_number=episode,
                    username=username,
                    message=text,
                    reply_to_id=reply_msg.id if reply_msg else None,
                    reply_to_username=reply_msg.username if reply_msg else None,
                    reply_to_message=reply_msg.message if reply_msg else None,
                )
                db.add(chat_msg)
                db.commit()
                db.refresh(chat_msg)

                await manager.broadcast(key, {
                    "type": "message",
                    "id": chat_msg.id,
                    "username": chat_msg.username,
                    "message": chat_msg.message,
                    "created_at": chat_msg.created_at.isoformat(),
                    "reactions": {},
                    "user_reactions": [],
                    "reply_to_id": chat_msg.reply_to_id,
                    "reply_to_username": chat_msg.reply_to_username,
                    "reply_to_message": chat_msg.reply_to_message,
                })

            elif msg_type == "react":
                if not username:
                    await websocket.send_json({
                        "type": "error", "code": "AUTH_REQUIRED",
                        "message": "You must be logged in to react.",
                    })
                    continue

                react_msg_id = data.get("message_id")
                emoji = data.get("emoji", "")

                if not isinstance(react_msg_id, int) or emoji not in ALLOWED_EMOJIS:
                    continue

                target = db.query(ChatMessage).filter_by(id=react_msg_id).first()
                if not target:
                    continue

                existing = (
                    db.query(ChatReaction)
                    .filter_by(message_id=react_msg_id, username=username, emoji=emoji)
                    .first()
                )
                if existing:
                    db.delete(existing)
                    added = False
                else:
                    db.add(ChatReaction(message_id=react_msg_id, username=username, emoji=emoji))
                    added = True
                db.commit()

                updated_reactions = _reactions_for_messages(db, [react_msg_id]).get(react_msg_id, {})

                await manager.broadcast(key, {
                    "type": "reaction_update",
                    "message_id": react_msg_id,
                    "reactions": updated_reactions,
                    "reactor": username,
                    "emoji": emoji,
                    "added": added,
                })

    except WebSocketDisconnect:
        manager.disconnect(websocket, key)
        if manager.viewer_count(key) > 0:
            await manager.broadcast(
                key, {"type": "viewer_count", "count": manager.viewer_count(key)}
            )