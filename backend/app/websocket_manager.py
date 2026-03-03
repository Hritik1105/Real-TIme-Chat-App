
from fastapi import WebSocket
from typing import Dict, List

class ConnectionManager:
    def __init__(self):
        # Maps user_id to specific websocket
        self.active_connections: Dict[int, WebSocket] = {}
        # Maps room_id to list of current online sockets
        self.room_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections[user_id] = websocket

    def disconnect(self, user_id: int):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
            
        # Optional: remove from all rooms
        for room_id, connections in self.room_connections.items():
            # In a real scenario we'd track which socket belongs to which user inside rooms
            pass

    async def send_personal_message(self, message: str, user_id: int):
        if user_id in self.active_connections:
            websocket = self.active_connections[user_id]
            try:
                await websocket.send_text(message)
            except:
                self.disconnect(user_id)

    async def broadcast(self, message: str):
        for user_id, connection in list(self.active_connections.items()):
            try:
                await connection.send_text(message)
            except:
                self.disconnect(user_id)

manager = ConnectionManager()
