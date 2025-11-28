# Deployment Guide

## Current Issue
Vercel's Python runtime is having trouble with FastAPI/ASGI apps. The error `TypeError: issubclass() arg 1 must be a class` suggests Vercel's handler detection is failing.

## Recommended Solution: Deploy Backend Separately

### Option 1: Railway (Recommended)

1. **Sign up at Railway**: https://railway.app
2. **Create New Project** → "Deploy from GitHub repo"
3. **Select repository**: `kbssrikar7/StudyFlow--AI_Powered_Productivity_Suite`
4. **Configure**:
   - Root Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Add Environment Variables**:
   - `SECRET_KEY` = (generate random string)
   - `GROQ_API_KEY` = (if using AI features)
6. **Get your Railway URL**: e.g., `https://your-app.railway.app`

### Update Vercel Frontend

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `VITE_API_URL` = `https://your-app.railway.app`
3. Redeploy

### Option 2: Render

1. Go to https://render.com
2. Create new "Web Service"
3. Connect GitHub repo
4. Configure:
   - Environment: Python 3
   - Build Command: `cd backend && pip install -r requirements.txt`
   - Start Command: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables
6. Update Vercel with the Render URL

## Login Credentials

After deployment, use:
- **Email**: `admin@admin.com`
- **Password**: `admin`

