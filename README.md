# StudyFlow - AI-Powered Productivity Suite

A full-stack productivity application for focused study sessions, task management, and AI-assisted learning. Built with React and FastAPI, featuring a dark-themed UI inspired by productivity tools.

**Live Demo**: https://studyflow-nctjszjb5-kbssrikar7s-projects.vercel.app

**Login Credentials**: `admin@admin.com` / `admin`

---

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Setup Instructions](#setup-instructions)
5. [API Documentation](#api-documentation)
6. [Screenshots](#screenshots)
7. [Assumptions and Design Decisions](#assumptions-and-design-decisions)
8. [Bonus Features](#bonus-features)

---

## Features

### Core Features

- **Focus Timer (Pomodoro)**: Customizable work/break intervals with ambient soundscapes
- **Task Management**: Kanban-style board with drag-and-drop functionality (To Do, In Progress, Done)
- **Study Sessions**: Track and log study sessions with duration and completion status
- **Code Snippets Manager**: Save, organize, and practice code snippets with spaced repetition tracking
- **Analytics Dashboard**: Visual statistics with activity heatmap and streak tracking

### AI Features (Powered by Groq)

- **AI Chat Assistant**: Get study help and answers to questions
- **Code Explanation**: Paste code and receive detailed explanations
- **Study Plan Generator**: Create personalized study plans based on goals
- **Task Breakdown**: Break complex tasks into actionable subtasks
- **Study Pattern Analysis**: AI-powered insights on study habits

### Authentication

- JWT-based authentication system
- Secure password hashing with bcrypt
- Protected routes and API endpoints

---

## Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| Vite | Build Tool |
| Tailwind CSS 4 | Styling |
| Framer Motion | Animations |
| Zustand | State Management |
| React Router | Navigation |
| Monaco Editor | Code Editor Component |
| Lucide React | Icons |

### Backend

| Technology | Purpose |
|------------|---------|
| FastAPI | API Framework |
| SQLAlchemy | ORM |
| PostgreSQL (Neon) | Production Database |
| SQLite | Development Database |
| Pydantic | Data Validation |
| JWT (python-jose) | Authentication |
| Passlib + bcrypt | Password Hashing |
| Groq API | AI/LLM Integration |

### Deployment

| Service | Purpose |
|---------|---------|
| Vercel | Frontend + Serverless Backend |
| Neon | PostgreSQL Database |

---

## Project Structure

```
StudyFlow/
├── api/                    # Vercel serverless entry point
│   ├── index.py
│   └── requirements.txt
├── backend/
│   ├── app/
│   │   ├── config.py       # Application configuration
│   │   ├── database.py     # Database connection
│   │   ├── dependencies.py # FastAPI dependencies
│   │   ├── main.py         # FastAPI application entry
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routers/        # API route handlers
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   └── repositories/   # Data access layer
│   ├── tests/              # Backend tests
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # React context (Auth)
│   │   ├── pages/          # Page components
│   │   ├── store/          # Zustand stores
│   │   ├── utils/          # API client utilities
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── public/             # Static assets
│   └── package.json
├── vercel.json             # Vercel deployment config
└── README.md
```

---

## Setup Instructions

### Prerequisites

- Node.js v18 or higher
- Python 3.10 or higher
- Git

### Local Development

#### 1. Clone the Repository

```bash
git clone https://github.com/kbssrikar7/StudyFlow--AI_Powered_Productivity_Suite.git
cd StudyFlow--AI_Powered_Productivity_Suite
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate
# On Windows:
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (optional - for AI features)
echo "GROQ_API_KEY=your_groq_api_key" > .env
echo "SECRET_KEY=your_secret_key" >> .env

# Run the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will be available at `http://localhost:5173`

#### 4. Access the Application

Open `http://localhost:5173` in your browser and login with:
- Email: `admin@admin.com`
- Password: `admin`

---

## API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get JWT token |
| GET | `/api/auth/me` | Get current user info |

### Session Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions` | List all sessions |
| POST | `/api/sessions` | Create a new session |
| GET | `/api/sessions/stats` | Get session statistics |

### Task Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/{id}` | Update a task |
| DELETE | `/api/tasks/{id}` | Delete a task |

### Snippet Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/snippets` | List all snippets |
| POST | `/api/snippets` | Create a new snippet |
| PUT | `/api/snippets/{id}` | Update a snippet |
| DELETE | `/api/snippets/{id}` | Delete a snippet |

### AI Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ai/chat` | Chat with AI assistant |
| POST | `/api/ai/explain-code` | Get code explanation |
| POST | `/api/ai/generate-study-plan` | Generate study plan |
| POST | `/api/ai/break-down-task` | Break down a task |
| POST | `/api/ai/analyze-patterns` | Analyze study patterns |

### Analytics Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/dashboard` | Get dashboard data |
| GET | `/api/analytics/heatmap` | Get activity heatmap data |

---

## Screenshots

### Login Page
The login page features a dark theme with the application branding.

### Dashboard (Mission Control)
The main dashboard displays:
- Focus Timer with ambient sound controls
- Session statistics with activity heatmap
- Quick access to all features

### Task Board (Objectives)
Kanban-style task management with three columns:
- To Do
- In Progress
- Done

Tasks can be dragged between columns and include priority indicators.

### Code Snippets (Intel)
Code snippet manager with:
- Monaco Editor for syntax highlighting
- Spaced repetition tracking
- Tag-based organization

### AI Assistant (Alfred)
AI-powered assistant featuring:
- Chat interface for study questions
- Code explanation tool
- Study plan generator
- Task breakdown utility

---

## Assumptions and Design Decisions

### Architecture Decisions

1. **Monorepo Structure**: Frontend and backend in the same repository for easier development and deployment.

2. **Serverless Backend**: FastAPI deployed as Vercel serverless functions for cost-effective hosting.

3. **PostgreSQL for Production**: Using Neon's free PostgreSQL tier for persistent data storage in production, SQLite for local development.

4. **JWT Authentication**: Stateless authentication suitable for serverless architecture.

### UI/UX Decisions

1. **Dark Theme**: Chosen for reduced eye strain during extended study sessions.

2. **Minimal Navigation**: Sidebar navigation with keyboard shortcuts for quick access.

3. **Real-time Feedback**: Toast notifications and loading states for all user actions.

### Data Model

1. **User**: Stores authentication credentials and profile information.

2. **Session**: Tracks study sessions with duration, title, and completion status.

3. **Task**: Kanban tasks with status, priority, and due dates.

4. **Snippet**: Code snippets with spaced repetition metadata for learning.

---

## Bonus Features

1. **Live Deployment**: Application is deployed and accessible at the demo URL.

2. **AI Integration**: Full integration with Groq's LLM API for intelligent features.

3. **Authentication**: Complete JWT-based authentication system.

4. **Advanced UI Features**:
   - Drag-and-drop task management
   - Activity heatmap visualization
   - Ambient sound player
   - Code editor with syntax highlighting
   - Keyboard shortcuts

5. **Responsive Design**: Works on desktop and tablet devices.

6. **API Documentation**: Comprehensive API endpoint documentation.

---

## Running Tests

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Tests

```bash
cd frontend
npm run test        # Unit tests
npm run test:e2e    # End-to-end tests
```

---

## Environment Variables

### Backend

| Variable | Description | Required |
|----------|-------------|----------|
| SECRET_KEY | JWT signing key | Yes |
| DATABASE_URL | PostgreSQL connection string | Production only |
| GROQ_API_KEY | Groq API key for AI features | No |

### Frontend

| Variable | Description | Required |
|----------|-------------|----------|
| VITE_API_URL | Backend API URL | Production only |

---

## License

MIT License - See LICENSE file for details.

---

## Author

**Kasilanka Bhoopesh Siva Srikar**

Submitted for: ProU Technology - Track 3 Full-stack Development Assessment
