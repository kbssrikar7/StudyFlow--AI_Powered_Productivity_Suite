import sys
from pathlib import Path

# Add backend directory to Python path for Vercel
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.main import app

# Vercel expects a handler function for ASGI apps
def handler(request):
    """
    Vercel serverless function handler for FastAPI.
    This function is called by Vercel for each request.
    """
    from mangum import Mangum
    asgi_handler = Mangum(app)
    return asgi_handler(request)

