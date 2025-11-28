#!/bin/bash

# Start backend in background
cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload &

# Start frontend
cd frontend && npm run dev
