from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ..database import get_db
from ..dependencies import get_current_user
from ..models.user import User
from ..repositories.snippet_repository import SnippetRepository
from ..schemas.snippet import SnippetCreate, SnippetResponse, SnippetUpdate
from ..services.snippet_service import SnippetService

router = APIRouter()


def _get_service(db: Session) -> SnippetService:
    return SnippetService(SnippetRepository(db))


@router.post("/", response_model=SnippetResponse, status_code=status.HTTP_201_CREATED)
async def create_snippet(
    payload: SnippetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SnippetResponse:
    return _get_service(db).create_snippet(payload, user_id=current_user.id)


@router.get("/", response_model=list[SnippetResponse])
async def list_snippets(
    tag: str | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[SnippetResponse]:
    svc = _get_service(db)
    if tag:
        return svc.find_by_tag(tag, user_id=current_user.id)
    return svc.get_all_snippets(user_id=current_user.id)


@router.get("/{snippet_id}", response_model=SnippetResponse)
async def get_snippet(
    snippet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SnippetResponse:
    try:
        return _get_service(db).get_snippet_by_id(snippet_id, user_id=current_user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.put("/{snippet_id}", response_model=SnippetResponse)
async def update_snippet(
    snippet_id: int,
    payload: SnippetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> SnippetResponse:
    try:
        svc = _get_service(db)
        if payload.last_practiced_at:
            current_snippet = svc.get_snippet_by_id(snippet_id, user_id=current_user.id)
            current_level = current_snippet.repetition_level or 0
            new_level = current_level + 1
            days_to_add = 1
            if new_level == 2:
                days_to_add = 7
            elif new_level >= 3:
                days_to_add = 14
            from datetime import timedelta
            payload.repetition_level = new_level
            payload.next_review_at = payload.last_practiced_at + timedelta(days=days_to_add)
        return svc.update_snippet(snippet_id, payload, user_id=current_user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.delete("/{snippet_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_snippet(
    snippet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    try:
        _get_service(db).delete_snippet(snippet_id, user_id=current_user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
