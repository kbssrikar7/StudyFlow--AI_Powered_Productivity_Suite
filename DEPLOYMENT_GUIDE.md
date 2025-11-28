# Deployment Guide

## Current Issue
Vercel's Python runtime is having trouble with FastAPI/ASGI apps. The error `TypeError: issubclass() arg 1 must be a class` suggests Vercel's handler detection is failing.

## Solution: Deploy Backend on Render

### Step 1: Deploy Backend on Render

1. **Sign up at Render**: https://render.com
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**: `kbssrikar7/StudyFlow--AI_Powered_Productivity_Suite`
4. **Configure the service**:
   - **Name**: `studyflow-backend` (or any name you like)
   - **Environment**: `Python 3`
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Add Environment Variables** (in Render dashboard):
   - `SECRET_KEY` = (generate a random string, e.g., use a password generator)
   - `GROQ_API_KEY` = (your Groq API key if using AI features - optional)
   - `RENDER` = `true` (this helps the app detect it's running on Render)
6. **Click "Create Web Service"**
7. **Wait for deployment** - Render will build and deploy your backend
8. **Copy your Render URL** - It will be something like: `https://studyflow-backend.onrender.com`

### Step 2: Update Vercel Frontend

1. Go to **Vercel Dashboard** → Your Project → **Settings** → **Environment Variables**
2. **Add new variable**:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-render-url.onrender.com` (use the URL from Step 1)
3. **Save** and **Redeploy** your Vercel project

### Step 3: Test Login

After both deployments complete:
1. Go to your Vercel frontend URL
2. Login with:
   - **Email**: `admin@admin.com`
   - **Password**: `admin`

## Notes

- **Database**: The app uses SQLite by default. For production, consider using Render's PostgreSQL addon for persistent data.
- **CORS**: Already configured to allow all origins when running on Render.
- **Auto-admin**: The admin user is automatically created on first startup.

## Troubleshooting

- If login fails, check Render logs: Render Dashboard → Your Service → Logs
- Make sure `VITE_API_URL` in Vercel matches your Render URL exactly (no trailing slash)
- Check that CORS is working - you should see CORS headers in browser network tab

