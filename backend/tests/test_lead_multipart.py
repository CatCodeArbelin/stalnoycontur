import base64

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


def test_create_lead_multipart_file_uses_uploads_url(tmp_path, monkeypatch):
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    Base.metadata.create_all(bind=engine)

    settings = Settings(
        database_url="sqlite://",
        images_root=str(tmp_path / "images"),
        telegram_bot_token=None,
        telegram_chat_id=None,
    )

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    async def fake_send_lead_to_telegram(*args, **kwargs):
        return False

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_settings] = lambda: settings
    monkeypatch.setattr(lead_route, "send_lead_to_telegram", fake_send_lead_to_telegram)

    try:
        with TestClient(app) as client:
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
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 201
    lead_image_url = response.json()["image"]
    assert lead_image_url.startswith("/images/uploads/")
    assert lead_image_url.endswith(".webp")

    with TestingSessionLocal() as db:
        lead = db.scalars(select(Lead)).one()
        upload = db.scalars(select(Upload)).one()

        assert lead.image == lead_image_url
        assert upload.url == lead_image_url
        assert upload.filename == lead_image_url.removeprefix("/images/uploads/")
        assert (tmp_path / "images" / "uploads" / upload.filename).is_file()
