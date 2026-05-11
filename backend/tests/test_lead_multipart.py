import base64
from contextlib import contextmanager

from fastapi.testclient import TestClient
from sqlalchemy import create_engine, select
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.api.routes import lead as lead_route
from app.core.config import Settings, get_settings
from app.core.database import Base, get_db
from app.main import app
from app.models.lead import Lead
from app.models.upload import Upload


def _png_bytes() -> bytes:
    return base64.b64decode(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAADElEQVR4nGJxMgcAAQMB"
        "AFrJxYkAAAAASUVORK5CYII="
    )


@contextmanager
def _test_client(tmp_path):
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    testing_session_local = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    Base.metadata.create_all(bind=engine)

    settings = Settings(
        database_url="sqlite://",
        images_root=str(tmp_path / "images"),
        telegram_bot_token=None,
        telegram_chat_id=None,
    )

    def override_get_db():
        db = testing_session_local()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_settings] = lambda: settings

    try:
        with TestClient(app) as client:
            yield client, testing_session_local, settings
    finally:
        app.dependency_overrides.clear()


def test_create_lead_multipart_file_uses_uploads_url(tmp_path, monkeypatch):
    async def fake_send_lead_to_telegram(*args, **kwargs):
        return False

    monkeypatch.setattr(lead_route, "send_lead_to_telegram", fake_send_lead_to_telegram)

    with _test_client(tmp_path) as (client, testing_session_local, _settings):
        response = client.post(
            "/lead",
            data={
                "name": "Иван Иванов",
                "phone": "+7 (999) 123-45-67",
                "city": "Москва",
                "comment": "Нужен навес",
                "utm": '{"source":"test"}',
            },
            files={"file": ("canopy.png", _png_bytes(), "image/png")},
        )

    assert response.status_code == 201
    lead_image_url = response.json()["image"]
    assert lead_image_url.startswith("/images/uploads/")
    assert lead_image_url.endswith(".webp")

    with testing_session_local() as db:
        lead = db.scalars(select(Lead)).one()
        upload = db.scalars(select(Upload)).one()

        assert lead.image == lead_image_url
        assert upload.url == lead_image_url
        assert upload.filename == lead_image_url.removeprefix("/images/uploads/")
        assert (tmp_path / "images" / "uploads" / upload.filename).is_file()


def test_public_upload_always_returns_uploads_url(tmp_path):
    with _test_client(tmp_path) as (client, _testing_session_local, _settings):
        response = client.post(
            "/upload",
            files={"file": ("public.png", _png_bytes(), "image/png")},
        )

    assert response.status_code == 201
    image_url = response.json()["url"]
    assert image_url.startswith("/images/uploads/")
    assert image_url.endswith(".webp")


def test_public_upload_ignores_cases_category(tmp_path):
    with _test_client(tmp_path) as (client, testing_session_local, _settings):
        response = client.post(
            "/upload",
            data={"category": "cases"},
            files={"file": ("case.png", _png_bytes(), "image/png")},
        )

    assert response.status_code == 201
    image_url = response.json()["url"]
    assert image_url.startswith("/images/uploads/")
    assert not image_url.startswith("/images/cases/")

    with testing_session_local() as db:
        upload = db.scalars(select(Upload)).one()

    assert upload.url == image_url
    assert (tmp_path / "images" / "uploads" / upload.filename).is_file()
    assert not (tmp_path / "images" / "cases" / upload.filename).exists()
