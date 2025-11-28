import sys
import os
from pathlib import Path

# Add backend directory to Python path for Vercel
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Set environment to indicate we're on Vercel
os.environ["VERCEL"] = "1"

# Import the FastAPI app
from app.main import app

# Export as 'app' for Vercel's FastAPI detection
# Vercel looks for 'app' variable for FastAPI apps

