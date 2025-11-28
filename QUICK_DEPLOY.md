# Quick Deployment Options (No Render/Railway)

## Option 1: Fly.io (EASIEST - Recommended) 🚀

### Steps:
1. **Install Fly CLI**:
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login to Fly.io**:
   ```bash
   fly auth login
   ```

3. **Deploy from backend directory**:
   ```bash
   cd backend
   fly launch
   ```
   - When asked, say "yes" to deploy now
   - Choose a name for your app (or press enter for auto-generated)
   - Choose a region (pick closest to you)
   - Say "no" to PostgreSQL (we'll use SQLite for now)

4. **Set environment variables**:
   ```bash
   fly secrets set SECRET_KEY=$(openssl rand -hex 32)
   fly secrets set FLY_APP_NAME=your-app-name
   ```

5. **Get your URL**:
   ```bash
   fly status
   ```
   Your app will be at: `https://your-app-name.fly.dev`

6. **Update Vercel**:
   - Go to Vercel → Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-app-name.fly.dev`

---

## Option 2: Koyeb (Super Simple) ⚡

1. Go to https://koyeb.com and sign up
2. Click "Create App" → "GitHub"
3. Select your repo: `kbssrikar7/StudyFlow--AI_Powered_Productivity_Suite`
4. Configure:
   - **Type**: Web Service
   - **Name**: `studyflow-backend`
   - **Build Command**: `cd backend && pip install -r requirements.txt`
   - **Run Command**: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend`
5. Add Environment Variables:
   - `SECRET_KEY` = (generate random string)
6. Deploy!
7. Get your URL and update Vercel with `VITE_API_URL`

---

## Option 3: Replit (Easiest but less reliable) 🎨

1. Go to https://replit.com
2. Create new Repl → Import from GitHub
3. Select your repo
4. In Shell, run:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --host 0.0.0.0 --port 8000
   ```
5. Click "Deploy" button
6. Get your URL and update Vercel

---

## Option 4: PythonAnywhere (Simple but slower) 🐍

1. Go to https://www.pythonanywhere.com
2. Sign up (free tier available)
3. Upload your backend code
4. Configure web app
5. Get your URL and update Vercel

---

## RECOMMENDED: Fly.io

**Why Fly.io?**
- ✅ Free tier (3 shared-cpu VMs)
- ✅ Super fast deployment
- ✅ Great for Python/FastAPI
- ✅ Easy CLI commands
- ✅ Automatic HTTPS

**Quick Start:**
```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Deploy
cd backend
fly launch
```

That's it! Your backend will be live in 2 minutes! 🎉

