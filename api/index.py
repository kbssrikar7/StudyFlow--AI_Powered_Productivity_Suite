import sys
from pathlib import Path

# Add backend directory to Python path for Vercel
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

from app.main import app
from mangum import Mangum

# Vercel requires a handler variable for serverless functions
# Mangum wraps FastAPI to work with AWS Lambda/Vercel's serverless environment
handler = Mangum(app)

