# StudyFlow: AI-Powered Productivity Suite

> **Full-Stack Productivity Application**
> *Track 3 – Full-stack Development Assessment Submission*

![Project Banner](https://via.placeholder.com/1200x400/000000/ffffff?text=Gotham+Study+Dashboard)
*(Note: Replace this placeholder with a real screenshot of your dashboard)*

## 📋 Overview
The **Gotham Study Dashboard** is a high-performance, immersive productivity application designed to help users manage tasks, track study sessions, and maintain focus. Built with a **FastAPI** backend and a **React** frontend, it features a unique "Gotham/Batman" aesthetic with glassmorphism UI, real-time data tracking, and AI-powered assistance.

### 🚀 Key Features
-   **Focus Timer (Pomodoro):** Customizable work/break intervals with ambient soundscapes (Rain, Forest, Gotham City).
-   **Task Management:** Kanban-style board (To Do, Doing, Done) with drag-and-drop functionality.
-   **Study Analytics:** GitHub-style contribution heatmap and streak tracking.
-   **Intel (Snippets):** Code snippet manager with syntax highlighting and spaced repetition tracking.
-   **Alfred (AI Assistant):** Integrated AI chat for quick study help and code explanations (powered by Groq).
-   **Authentication:** Secure JWT-based login and registration system.

---

## 🛠️ Tech Stack

### Frontend
-   **Framework:** React 19 (Vite)
-   **Styling:** Tailwind CSS 4, Framer Motion (Animations)
-   **State Management:** Zustand
-   **Components:** Lucide React (Icons), React Beautiful DnD, Monaco Editor
-   **Testing:** Playwright (E2E)

### Backend
-   **Framework:** FastAPI (Python 3.11+)
-   **Database:** PostgreSQL (Production) / SQLite (Development)
-   **ORM:** SQLAlchemy
-   **Authentication:** OAuth2 with JWT (Jose)
-   **AI Integration:** Groq API
-   **Testing:** Pytest

### DevOps
-   **Containerization:** Docker & Docker Compose
-   **Deployment:** Ready for Railway / Render

---

## ⚙️ Setup Instructions

### Prerequisites
-   Node.js (v18+)
-   Python (v3.10+)
-   Git

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/study-dashboard.git
cd study-dashboard
```

### 2. Backend Setup
```bash
cd backend
# Create virtual environment
python -m venv venv
# Activate (Windows)
.\venv\Scripts\activate
# Activate (Mac/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Server
uvicorn app.main:app --reload
```
*The backend runs on `http://localhost:8000`*

### 3. Frontend Setup
```bash
cd frontend
# Install dependencies
npm install

# Run Development Server
npm run dev
```
*The frontend runs on `http://localhost:5173`*

### 4. Environment Configuration
Create a `.env` file in the root directory (or use the provided `.env.example`):
```env
DATABASE_URL=sqlite:///./study_dashboard.db
SECRET_KEY=your_secret_key
GROQ_API_KEY=your_groq_api_key
```

---

## 📸 Screenshots
*(Please add screenshots of the Login Page, Dashboard, and Task Board here)*

## 🧪 Testing
**Backend Tests:**
```bash
cd backend
pytest
```

**Frontend E2E Tests:**
```bash
cd frontend
npx playwright test
```

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).

---
**Submitted by:** Kasilanka Bhoopesh Siva Srikar
