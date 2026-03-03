# Real-time Chat App

This is an intermediate-level real-time chat application built with FastAPI, WebSockets, PostgreSQL, and React (Vite).

## Tech Stack
- **Backend:** Python, FastAPI, SQLAlchemy, PostgreSQL, Passlib (JWT Auth), WebSockets
- **Frontend:** React (Vite), TailwindCSS, Axios, Context API

## Features
- User Authentication (Register/Login via JWT)
- Real-time chatting in rooms via WebSockets
- Chat history stored in DB
- Online user display and typing simulation hooks

## How to run locally

### Using Docker Compose (Recommended)

1. Make sure Docker is installed and running.
2. In the root directory, run:
   ```bash
   docker-compose up --build
   ```
3. Open your browser:
   - Frontend: http://localhost:5173
   - Backend API Docs: http://localhost:8000/docs

### Running Without Docker

**Backend:**
1. cd `backend`
2. Create virtual environment `python -m venv venv` and activate it.
3. `pip install -r requirements.txt`
4. Setup a local Postgres db and update `.env`
5. `uvicorn app.main:app --reload`

**Frontend:**
1. cd `frontend`
2. `npm install`
3. `npm run dev`
