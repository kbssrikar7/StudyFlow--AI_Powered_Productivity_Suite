from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models.user import User
from ..repositories.session_repository import SessionRepository
from ..repositories.snippet_repository import SnippetRepository
from ..schemas.analytics import AnalyticsResponse
from ..services.analytics_service import AnalyticsService

router = APIRouter()


@router.get("/", response_model=AnalyticsResponse)
async def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> AnalyticsResponse:
    snippet_repo = SnippetRepository(db)
    session_repo = SessionRepository(db)
    service = AnalyticsService(snippet_repo, session_repo)
    return service.get_dashboard_stats(user_id=current_user.id)
