
from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from .. import models, schemas, auth, database
from typing import List
from ..websocket_manager import manager
import json

router = APIRouter(prefix="/chat", tags=["chat"])

@router.get("/rooms", response_model=List[schemas.RoomResponse])
def get_rooms(db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    return db.query(models.Room).all()

@router.post("/rooms", response_model=schemas.RoomResponse)
def create_room(room: schemas.RoomCreate, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    db_room = models.Room(**room.dict())
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room

@router.get("/rooms/{room_id}/messages", response_model=List[schemas.MessageResponse])
def read_messages(room_id: int, skip: int = 0, limit: int = 50, db: Session = Depends(database.get_db), current_user: models.User = Depends(auth.get_current_user)):
    messages = db.query(models.Message).filter(models.Message.room_id == room_id).order_by(models.Message.created_at.desc()).offset(skip).limit(limit).all()
    return list(reversed(messages)) # Chronological

@router.websocket("/ws/{token}")
async def websocket_endpoint(websocket: WebSocket, token: str, db: Session = Depends(database.get_db)):
    try:
        user = auth.get_current_user(token, db)
    except Exception:
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, user.id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Simple handling of incoming events
            if message_data.get("type") == "chat_message":
                # Save to DB
                new_msg = models.Message(
                    content=message_data["content"],
                    room_id=message_data["room_id"],
                    sender_id=user.id
                )
                db.add(new_msg)
                db.commit()
                db.refresh(new_msg)
                
                # Broadcast
                await manager.broadcast(json.dumps({
                    "type": "chat_message",
                    "id": new_msg.id,
                    "content": new_msg.content,
                    "sender_id": user.id,
                    "room_id": message_data["room_id"],
                    "created_at": new_msg.created_at.isoformat()
                }))
            elif message_data.get("type") == "typing":
                await manager.broadcast(json.dumps({
                    "type": "typing",
                    "user_id": user.id,
                    "room_id": message_data["room_id"]
                }))
    except WebSocketDisconnect:
        manager.disconnect(user.id)
        await manager.broadcast(json.dumps({
            "type": "status",
            "message": f"{user.username} went offline"
        }))
