"""API-level tests for FastAPI routers."""

from __future__ import annotations

from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base, get_db
from app.main import app


@pytest.fixture()
def client(tmp_path: Path) -> TestClient:
    db_path = tmp_path / "api_test.db"
    engine = create_engine(
        f"sqlite:///{db_path}",
        connect_args={"check_same_thread": False},
        future=True,
    )
    TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)

    def override_get_db():
        db = TestingSession()
        try:
            yield db
            db.commit()
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    engine.dispose()


def test_snippet_crud_flow(client: TestClient) -> None:
    response = client.post(
        "/snippets/",
        json={"title": "Example", "content": "print('hi')", "tags": "python"},
    )
    assert response.status_code == 201
    snippet_id = response.json()["id"]

    list_response = client.get("/snippets/")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

    detail_response = client.get(f"/snippets/{snippet_id}")
    assert detail_response.status_code == 200

    update_response = client.put(
        f"/snippets/{snippet_id}",
        json={"title": "Updated"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["title"] == "Updated"

    delete_response = client.delete(f"/snippets/{snippet_id}")
    assert delete_response.status_code == 204


def test_sessions_crud_flow(client: TestClient) -> None:
    response = client.post(
        "/sessions/",
        json={
            "title": "FastAPI Study",
            "duration": 90,
            "description": "Building backend",
        },
    )
    assert response.status_code == 201
    session_id = response.json()["id"]

    list_response = client.get("/sessions/")
    assert list_response.status_code == 200
    assert len(list_response.json()) == 1

    detail_response = client.get(f"/sessions/{session_id}")
    assert detail_response.status_code == 200

    update_response = client.put(
        f"/sessions/{session_id}",
        json={"duration": 120},
    )
    assert update_response.status_code == 200
    assert update_response.json()["duration"] == 120

    delete_response = client.delete(f"/sessions/{session_id}")
    assert delete_response.status_code == 204


def test_analytics_endpoint(client: TestClient) -> None:
    client.post(
        "/snippets/",
        json={"title": "Snippet", "content": "code", "tags": "test"},
    )
    client.post(
        "/sessions/",
        json={"title": "React Study", "duration": 60, "description": ""},
    )
    analytics = client.get("/analytics/").json()
    assert analytics["totalSnippets"] == 1
    assert analytics["totalSessions"] == 1
    assert analytics["totalStudyTime"] == 60


