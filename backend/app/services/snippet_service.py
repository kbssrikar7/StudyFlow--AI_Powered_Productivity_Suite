"""Business logic for snippet workflows."""

from __future__ import annotations

from ..models.snippet import Snippet
from ..repositories.snippet_repository import SnippetRepository
from ..schemas.snippet import SnippetCreate, SnippetUpdate


class SnippetService:
    """Coordinate snippet validation and repository calls."""

    def __init__(self, repository: SnippetRepository) -> None:
        self.repository = repository

    def create_snippet(self, data: SnippetCreate, user_id: int) -> Snippet:
        snippet = Snippet(**data.model_dump(), user_id=user_id)
        return self.repository.create(snippet)

    def get_all_snippets(self, user_id: int) -> list[Snippet]:
        return self.repository.find_all(user_id)

    def get_snippet_by_id(self, snippet_id: int, user_id: int) -> Snippet:
        snippet = self.repository.find_by_id(snippet_id, user_id)
        if snippet is None:
            raise ValueError("Snippet not found")
        return snippet

    def update_snippet(self, snippet_id: int, data: SnippetUpdate, user_id: int) -> Snippet:
        snippet = self.get_snippet_by_id(snippet_id, user_id)
        update_data = data.model_dump(exclude_unset=True)
        if not update_data:
            return snippet
        return self.repository.update(snippet, update_data)

    def delete_snippet(self, snippet_id: int, user_id: int) -> None:
        snippet = self.get_snippet_by_id(snippet_id, user_id)
        self.repository.delete(snippet)

    def find_by_tag(self, tag: str, user_id: int) -> list[Snippet]:
        return self.repository.find_by_tag(tag, user_id)
