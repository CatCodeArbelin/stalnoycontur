from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.core.admin_auth import create_admin_token
from app.core.config import Settings
from app.core.rate_limit import InMemoryRateLimitMiddleware


def _client(**middleware_kwargs):
    settings = middleware_kwargs.pop("settings", Settings(admin_jwt_secret="test-secret"))
    app = FastAPI()
    app.add_middleware(
        InMemoryRateLimitMiddleware,
        settings=settings,
        requests=100,
        window_seconds=60,
        **middleware_kwargs,
    )

    @app.post("/api/admin/auth/login")
    async def login(payload: dict[str, str]) -> dict[str, str]:
        return {"username": payload["username"]}

    @app.post("/api/lead")
    async def lead() -> dict[str, bool]:
        return {"ok": True}

    @app.get("/api/admin/leads")
    async def admin_leads() -> dict[str, bool]:
        return {"ok": True}

    return TestClient(app), settings


def test_admin_login_limit_uses_ip_and_username() -> None:
    client, _settings = _client(admin_login_requests=2, admin_login_window_seconds=300)

    for _ in range(2):
        response = client.post("/api/admin/auth/login", json={"username": "admin", "password": "bad"})
        assert response.status_code == 200

    limited = client.post("/api/admin/auth/login", json={"username": "admin", "password": "bad"})
    assert limited.status_code == 429

    other_user = client.post("/api/admin/auth/login", json={"username": "other", "password": "bad"})
    assert other_user.status_code == 200


def test_public_lead_has_separate_anti_spam_limit() -> None:
    client, _settings = _client(lead_requests=1, lead_window_seconds=300)

    first = client.post("/api/lead")
    second = client.post("/api/lead")

    assert first.status_code == 200
    assert second.status_code == 429


def test_valid_admin_token_exempts_admin_routes() -> None:
    client, settings = _client(
        admin_requests=1,
        admin_window_seconds=300,
        admin_authenticated_exempt=True,
    )
    token = create_admin_token(settings)

    for _ in range(3):
        response = client.get("/api/admin/leads", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 200
