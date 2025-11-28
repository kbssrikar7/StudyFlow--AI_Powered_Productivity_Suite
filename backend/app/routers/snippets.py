from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..repositories.snippet_repository import SnippetRepository
from ..schemas.snippet import SnippetCreate, SnippetResponse, SnippetUpdate
from ..services.snippet_service import SnippetService

router = APIRouter()


def get_service(db: Session = Depends(get_db)) -> SnippetService:
    repository = SnippetRepository(db)
    return SnippetService(repository)


@router.post(
    "/",
    response_model=SnippetResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_snippet(
    payload: SnippetCreate,
    service: SnippetService = Depends(get_service),
) -> SnippetResponse:
    return service.create_snippet(payload)


@router.get("/", response_model=list[SnippetResponse])
async def list_snippets(
    tag: str | None = None,
    service: SnippetService = Depends(get_service),
) -> list[SnippetResponse]:
    if tag:
        return service.find_by_tag(tag)
    return service.get_all_snippets()


@router.get("/{snippet_id}", response_model=SnippetResponse)
async def get_snippet(
    snippet_id: int,
    service: SnippetService = Depends(get_service),
) -> SnippetResponse:
    try:
        return service.get_snippet_by_id(snippet_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.put("/{snippet_id}", response_model=SnippetResponse)
async def update_snippet(
    snippet_id: int,
    payload: SnippetUpdate,
    service: SnippetService = Depends(get_service),
) -> SnippetResponse:
    try:
        # Check if this is a practice update (contains last_practiced_at)
        if payload.last_practiced_at:
            # Get current snippet to check level
            current_snippet = service.get_snippet_by_id(snippet_id)
            
            # Calculate new level and next review date
            current_level = current_snippet.repetition_level or 0
            new_level = current_level + 1
            
            # SRS Logic: 0->1 (+1d), 1->2 (+7d), 2->3+ (+14d)
            days_to_add = 1
            if new_level == 2:
                days_to_add = 7
            elif new_level >= 3:
                days_to_add = 14
                
            from datetime import timedelta
            next_review = payload.last_practiced_at + timedelta(days=days_to_add)
            
            payload.repetition_level = new_level
            payload.next_review_at = next_review

        return service.update_snippet(snippet_id, payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete(
    "/{snippet_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_snippet(
    snippet_id: int,
    service: SnippetService = Depends(get_service),
) -> None:
    try:
        service.delete_snippet(snippet_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
