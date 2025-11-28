# StudyFlow: AI-Powered Productivity Suite

## Project Overview
StudyFlow (Gotham Study Dashboard) is a full-stack productivity application with a Batman/Gotham aesthetic. It helps users manage tasks, track study sessions, and maintain focus with AI assistance.

**Tech Stack:**
- Frontend: React 19 + Vite + Tailwind CSS
- Backend: FastAPI (Python 3.11)
- Database: SQLite (development) / PostgreSQL (production ready)
- AI: Groq API integration

## Project Structure
```
├── frontend/          # React + Vite frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Login, Register pages
│   │   ├── utils/        # API client
│   │   └── App.jsx
│   └── package.json
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── models/       # SQLAlchemy models
│   │   ├── routers/      # API endpoints
│   │   ├── services/     # Business logic
│   │   └── main.py
│   └── requirements.txt
└── start.sh          # Development startup script
```

## Recent Changes (GitHub Import Setup)
- **2025-11-28**: Initial Replit setup
  - Installed Python 3.11 and Node.js 20
  - Fixed bcrypt compatibility (pinned to 4.0.1)
  - Configured Vite to run on port 5000 with host 0.0.0.0
  - Set up workflow for concurrent backend/frontend development
  - Configured deployment for autoscale with static file serving
  - Created default admin user (admin@admin.com / admin)

## Development

### Running the Application
The application runs automatically via the "Start application" workflow:
- Backend: http://0.0.0.0:8000 (FastAPI)
- Frontend: http://0.0.0.0:5000 (Vite dev server)
- Frontend proxies `/api` requests to backend

### Default Credentials
- Email: admin@admin.com
- Password: admin

### Key Features
- **Focus Timer (Pomodoro)**: Customizable work/break intervals
- **Task Management**: Kanban-style board with drag-and-drop
- **Study Analytics**: GitHub-style contribution heatmap
- **Intel (Snippets)**: Code snippet manager with syntax highlighting
- **Alfred (AI Assistant)**: Integrated AI chat powered by Groq

## Deployment
The application is configured for Replit autoscale deployment:
- Build step: Builds the frontend React app
- Run step: Serves built frontend from FastAPI backend
- Frontend static files served from `/frontend/dist`
- Backend API available at `/api/*` endpoints

## Configuration
- Frontend dev server: Port 5000, host 0.0.0.0
- Backend API: Port 8000, host 0.0.0.0
- Vite proxy configuration routes `/api` to `http://localhost:8000`
- Production: Backend serves built frontend files when `REPL_ID` is set

## User Preferences
- Batman/Gotham themed UI with glassmorphism design
- Dark mode aesthetic throughout
- Ambient soundscapes (Rain, Forest, Gotham City)

## Notes
- Database: SQLite file at `backend/database/app_v2.db`
- For AI features: Set `GROQ_API_KEY` environment variable
- For JWT auth: Set `SECRET_KEY` environment variable (optional, defaults to placeholder)
