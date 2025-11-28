"""Property-based tests validating core requirements."""

from __future__ import annotations

import string
import tempfile
from collections import Counter
from contextlib import contextmanager
from pathlib import Path

from hypothesis import HealthCheck, given, settings
from hypothesis import strategies as st
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.repositories.session_repository import SessionRepository
from app.repositories.snippet_repository import SnippetRepository
from app.schemas.session import SessionCreate, SessionUpdate
from app.schemas.snippet import SnippetCreate, SnippetUpdate
from app.services.analytics_service import AnalyticsService
from app.services.session_service import SessionService
from app.services.snippet_service import SnippetService


@contextmanager
def in_memory_session():
    engine = create_engine("sqlite+pysqlite:///:memory:", future=True)
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    session = TestingSession()
    try:
        yield session
    finally:
        session.close()
        engine.dispose()


def get_persistent_session_factory():
    temp_dir = tempfile.TemporaryDirectory()
    db_path = Path(temp_dir.name) / "test.db"
    engine = create_engine(f"sqlite:///{db_path}", future=True)
    Base.metadata.create_all(bind=engine)
    TestingSession = sessionmaker(bind=engine, autoflush=False, autocommit=False)

    @contextmanager
    def session_scope():
        session = TestingSession()
        try:
            yield session
        finally:
            session.close()

    session_scope.temp_dir = temp_dir  # type: ignore[attr-defined]
    session_scope.engine = engine  # type: ignore[attr-defined]
    return session_scope

TEXT_ALPHABET = string.ascii_letters + string.digits + " ,-_'"

snippet_strategy = st.builds(
    SnippetCreate,
    title=st.text(alphabet=TEXT_ALPHABET, min_size=1, max_size=40),
    content=st.text(alphabet=TEXT_ALPHABET, min_size=1, max_size=200),
    tags=st.text(alphabet=TEXT_ALPHABET, max_size=40),
)

session_strategy = st.builds(
    SessionCreate,
    date=st.dates().map(lambda d: d.isoformat()),
    duration=st.integers(min_value=1, max_value=240),
    topic=st.text(alphabet=TEXT_ALPHABET, min_size=1, max_size=40),
    notes=st.text(alphabet=TEXT_ALPHABET, max_size=100),
)


@settings(max_examples=25, suppress_health_check=[HealthCheck.too_slow])
@given(data=snippet_strategy)
def test_property_entity_creation_persistence_snippet(data: SnippetCreate) -> None:
    with in_memory_session() as db:
        repo = SnippetRepository(db)
        service = SnippetService(repo)
        created = service.create_snippet(data)
        fetched = service.get_snippet_by_id(created.id)
        assert fetched.title == data.title
        assert fetched.content == data.content


@settings(max_examples=25, suppress_health_check=[HealthCheck.too_slow])
@given(data=session_strategy)
def test_property_entity_creation_persistence_session(data: SessionCreate) -> None:
    with in_memory_session() as db:
        repo = SessionRepository(db)
        service = SessionService(repo)
        created = service.create_session(data)
        fetched = service.get_session_by_id(created.id)
        assert fetched.topic == data.topic
        assert fetched.duration == data.duration


@settings(max_examples=10, suppress_health_check=[HealthCheck.too_slow])
@given(entries=st.lists(snippet_strategy, min_size=1, max_size=5))
def test_property_complete_entity_retrieval_snippets(entries) -> None:
    with in_memory_session() as db:
        repo = SnippetRepository(db)
        service = SnippetService(repo)
        for entry in entries:
            service.create_snippet(entry)
        result = service.get_all_snippets()
        assert len(result) == len(entries)


@settings(max_examples=10, suppress_health_check=[HealthCheck.too_slow])
@given(entries=st.lists(session_strategy, min_size=1, max_size=5))
def test_property_complete_entity_retrieval_sessions(entries) -> None:
    with in_memory_session() as db:
        repo = SessionRepository(db)
        service = SessionService(repo)
        for entry in entries:
            service.create_session(entry)
        result = service.get_all_sessions()
        assert len(result) == len(entries)


@settings(max_examples=25, suppress_health_check=[HealthCheck.too_slow])
@given(
    create_data=snippet_strategy,
    new_title=st.text(alphabet=TEXT_ALPHABET, min_size=1, max_size=40),
)
def test_property_entity_update_persistence_snippet(create_data, new_title) -> None:
    with in_memory_session() as db:
        repo = SnippetRepository(db)
        service = SnippetService(repo)
        created = service.create_snippet(create_data)
        updated = service.update_snippet(created.id, SnippetUpdate(title=new_title))
        assert updated.title == new_title
        fetched = service.get_snippet_by_id(created.id)
        assert fetched.title == new_title


@settings(max_examples=25)
@given(
    create_data=session_strategy,
    new_duration=st.integers(min_value=1, max_value=240),
)
def test_property_entity_update_persistence_session(create_data, new_duration) -> None:
    with in_memory_session() as db:
        repo = SessionRepository(db)
        service = SessionService(repo)
        created = service.create_session(create_data)
        updated = service.update_session(created.id, SessionUpdate(duration=new_duration))
        assert updated.duration == new_duration


@settings(max_examples=25)
@given(data=snippet_strategy)
def test_property_entity_deletion_completeness_snippet(data) -> None:
    with in_memory_session() as db:
        repo = SnippetRepository(db)
        service = SnippetService(repo)
        created = service.create_snippet(data)
        service.delete_snippet(created.id)
        assert repo.find_by_id(created.id) is None


@settings(max_examples=25)
@given(data=session_strategy)
def test_property_entity_deletion_completeness_session(data) -> None:
    with in_memory_session() as db:
        repo = SessionRepository(db)
        service = SessionService(repo)
        created = service.create_session(data)
        service.delete_session(created.id)
        assert repo.find_by_id(created.id) is None


@settings(max_examples=10)
@given(
    snippets=st.lists(snippet_strategy, min_size=1, max_size=3),
    sessions=st.lists(session_strategy, min_size=1, max_size=3),
)
def test_property_cross_restart_persistence(snippets, sessions) -> None:
    SessionFactory = get_persistent_session_factory()
    try:
        with SessionFactory() as db1:
            snippet_service = SnippetService(SnippetRepository(db1))
            session_service = SessionService(SessionRepository(db1))
            for snippet in snippets:
                snippet_service.create_snippet(snippet)
            for session in sessions:
                session_service.create_session(session)
            db1.commit()

        with SessionFactory() as db2:
            snippet_service = SnippetService(SnippetRepository(db2))
            session_service = SessionService(SessionRepository(db2))
            assert len(snippet_service.get_all_snippets()) == len(snippets)
            assert len(session_service.get_all_sessions()) == len(sessions)
    finally:
        SessionFactory.engine.dispose()  # type: ignore[attr-defined]
        SessionFactory.temp_dir.cleanup()  # type: ignore[attr-defined]


@settings(max_examples=15)
@given(
    snippets=st.lists(snippet_strategy, min_size=1, max_size=5),
    sessions=st.lists(session_strategy, min_size=1, max_size=5),
)
def test_property_analytics_counts(snippets, sessions) -> None:
    with in_memory_session() as db:
        snippet_repo = SnippetRepository(db)
        session_repo = SessionRepository(db)
        snippet_service = SnippetService(snippet_repo)
        session_service = SessionService(session_repo)
        for snippet in snippets:
            snippet_service.create_snippet(snippet)
        for session in sessions:
            session_service.create_session(session)
        analytics_service = AnalyticsService(snippet_repo, session_repo)
        stats = analytics_service.get_dashboard_stats()
        assert stats["totalSnippets"] == len(snippets)
        assert stats["totalSessions"] == len(sessions)


@settings(max_examples=15)
@given(sessions=st.lists(session_strategy, min_size=1, max_size=6))
def test_property_study_time_aggregation(sessions) -> None:
    with in_memory_session() as db:
        session_repo = SessionRepository(db)
        service = SessionService(session_repo)
        for session in sessions:
            service.create_session(session)
        analytics = AnalyticsService(SnippetRepository(db), session_repo)
        stats = analytics.get_dashboard_stats()
        expected_duration = sum(s.duration for s in sessions)
        assert stats["totalStudyTime"] == expected_duration


@settings(max_examples=15)
@given(sessions=st.lists(session_strategy, min_size=1, max_size=6))
def test_property_topic_aggregation_correctness(sessions) -> None:
    with in_memory_session() as db:
        session_repo = SessionRepository(db)
        service = SessionService(session_repo)
        for session in sessions:
            service.create_session(session)
        analytics = AnalyticsService(SnippetRepository(db), session_repo)
        stats = analytics.get_dashboard_stats()
        counter = Counter()
        duration_map = Counter()
        for session in sessions:
            counter[session.topic] += 1
            duration_map[session.topic] += session.duration
        result = {entry["topic"]: entry for entry in stats["sessionsByTopic"]}
        for topic, count in counter.items():
            assert result[topic]["count"] == count
            assert result[topic]["totalDuration"] == duration_map[topic]

