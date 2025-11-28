import sys
from pathlib import Path

# Add backend directory to Python path for Vercel
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.main import app

# Vercel supports FastAPI natively - just export the app
# The 'app' variable name is what Vercel looks for

