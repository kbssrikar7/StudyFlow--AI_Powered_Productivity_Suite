from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..repositories.session_repository import SessionRepository
from ..repositories.snippet_repository import SnippetRepository
from ..schemas.analytics import AnalyticsResponse
from ..services.analytics_service import AnalyticsService

router = APIRouter()


def get_service(db: Session = Depends(get_db)) -> AnalyticsService:
    snippet_repo = SnippetRepository(db)
    session_repo = SessionRepository(db)
    return AnalyticsService(snippet_repo, session_repo)


@router.get("/", response_model=AnalyticsResponse)
async def get_analytics(
    service: AnalyticsService = Depends(get_service),
) -> AnalyticsResponse:
    return service.get_dashboard_stats()
