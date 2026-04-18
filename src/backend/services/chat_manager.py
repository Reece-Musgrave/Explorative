from __future__ import annotations
from collections import defaultdict, deque
from datetime import datetime, timedelta, timezone
from fastapi import WebSocket


RATE_LIMIT_MAX_MESSAGES = 5
RATE_LIMIT_WINDOW_SECONDS = 30


class ConnectionManager:
   
    def __init__(self) -> None:
        self._rooms: dict[str, list[tuple[WebSocket, str | None]]] = defaultdict(list)
        self._rate_buckets: dict[str, deque[datetime]] = defaultdict(deque)

    @staticmethod
    def room_key(show_name: str, season: int, episode: int) -> str:
        return f"{show_name}::s{season}::e{episode}"

    async def connect(self, websocket: WebSocket, key: str, username: str | None) -> None:
        await websocket.accept()
        self._rooms[key].append((websocket, username))

    def disconnect(self, websocket: WebSocket, key: str) -> None:
        self._rooms[key] = [
            (ws, u) for ws, u in self._rooms[key] if ws is not websocket
        ]
        if not self._rooms[key]:
            del self._rooms[key]  

    def viewer_count(self, key: str) -> int:
        return len(self._rooms.get(key, []))

    async def broadcast(self, key: str, payload: dict) -> None:
        dead: list[tuple[WebSocket, str | None]] = []
        for ws, u in list(self._rooms.get(key, [])):
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append((ws, u))
        for item in dead:
            try:
                self._rooms[key].remove(item)
            except ValueError:
                pass

    def is_rate_limited(self, username: str) -> bool:
        now = datetime.now(tz=timezone.utc)
        cutoff = now - timedelta(seconds=RATE_LIMIT_WINDOW_SECONDS)
        bucket = self._rate_buckets[username]

        while bucket and bucket[0] < cutoff:
            bucket.popleft()

        if len(bucket) >= RATE_LIMIT_MAX_MESSAGES:
            return True

        bucket.append(now)
        return False

manager = ConnectionManager()