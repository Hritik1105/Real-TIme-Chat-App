
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas, auth, database
from typing import List

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=schemas.UserResponse)
def read_users_me(current_user: models.User = Depends(auth.get_current_user)):
    return current_user

@router.get("/online", response_model=List[schemas.UserResponse])
def get_online_users(db: Session = Depends(database.get_db), _: models.User = Depends(auth.get_current_user)):
    # Simulating online status based on some threshold or active websockets
    # For a real app, integrate with websocket manager
    # Just returning active users as an example
    users = db.query(models.User).filter(models.User.is_active == True).all()
    return users
