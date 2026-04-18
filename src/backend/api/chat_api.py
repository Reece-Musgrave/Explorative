from __future__ import annotations
from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from backend.core.config import settings      
from backend.db.session import get_db
from backend.models.chat import ChatMessage
from backend.services.chat_manager import manager
import jwt


router = APIRouter(tags=["chat"])
HISTORY_LIMIT = 50


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
        for msg in reversed(history):
            await websocket.send_json(
                {
                    "type": "history",
                    "id": msg.id,
                    "username": msg.username,
                    "message": msg.message,
                    "created_at": msg.created_at.isoformat(),
                }
            )

        await manager.broadcast(
            key, {"type": "viewer_count", "count": manager.viewer_count(key)}
        )

        while True:
            data: dict = await websocket.receive_json()

            if data.get("type") != "message":
                continue

            if not username:
                await websocket.send_json(
                    {"type": "error", "code": "AUTH_REQUIRED",
                     "message": "You must be logged in to send messages."}
                )
                continue

            text = data.get("message", "").strip()[:500]
            if not text:
                continue

            if manager.is_rate_limited(username):
                await websocket.send_json(
                    {"type": "error", "code": "RATE_LIMITED",
                     "message": f"Slow down — max {5} messages per {30} s."}
                )
                continue

            chat_msg = ChatMessage(
                show_name=show_name,
                season_number=season,
                episode_number=episode,
                username=username,
                message=text,
            )
            db.add(chat_msg)
            db.commit()
            db.refresh(chat_msg)

            await manager.broadcast(
                key,
                {
                    "type": "message",
                    "id": chat_msg.id,
                    "username": chat_msg.username,
                    "message": chat_msg.message,
                    "created_at": chat_msg.created_at.isoformat(),
                },
            )

    except WebSocketDisconnect:
        manager.disconnect(websocket, key)
        if manager.viewer_count(key) > 0:
            await manager.broadcast(
                key, {"type": "viewer_count", "count": manager.viewer_count(key)}
            )