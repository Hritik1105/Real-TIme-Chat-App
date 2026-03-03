
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models, database
from .routes import auth_routes, user_routes, chat_routes

# Create DB tables
models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="Real-time Chat App")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(user_routes.router)
app.include_router(chat_routes.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to Chat App API"}
