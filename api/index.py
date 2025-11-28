import sys
from pathlib import Path

# Add backend directory to Python path for Vercel
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Import the FastAPI app
from app.main import app

# Vercel automatically detects FastAPI when 'app' is defined
# No handler wrapper needed - Vercel handles ASGI apps natively

