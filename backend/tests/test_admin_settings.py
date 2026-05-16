from collections.abc import Iterator
from contextlib import contextmanager
from typing import Any

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.admin_auth import create_admin_token
from app.core.config import Settings, get_settings
from app.core.database import Base, get_db
from app.main import app
from app.models.setting import Setting


@contextmanager
def _admin_client(tmp_path) -> Iterator[tuple[TestClient, sessionmaker, dict[str, str]]]:
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
        admin_jwt_secret="test-secret",
        telegram_bot_token=None,
        telegram_chat_id=None,
    )
    token = create_admin_token(settings)
    headers = {"Authorization": f"Bearer {token}"}

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
            yield client, testing_session_local, headers
    finally:
        app.dependency_overrides.clear()


@pytest.mark.parametrize(
    ("key", "value"),
    [
        ("company_name", "Стальной Контур"),
        ("phone", "+7 978 000-44-88"),
        ("phones", [{"label": "+7 978 000-44-88", "href": "tel:+79780004488"}]),
        ("telegram", "https://t.me/stalnoycontur"),
        ("max", "https://max.ru/stalnoycontur"),
        ("personal_data_consent_text", "Согласие на обработку персональных данных."),
        ("calculator_config", {
            "canopyOptions": [{"label": "Для авто", "value": "Навес для авто", "multiplier": 1}],
            "sizeOptions": [{"label": "3×4 м", "value": "3×4 м", "area": 12}],
            "materialOptions": [{"label": "Поликарбонат", "value": "Поликарбонат", "pricePerMeter": 7600}],
        }),
    ],
)
def test_create_public_setting_accepts_valid_value(tmp_path, key: str, value: Any) -> None:
    with _admin_client(tmp_path) as (client, _testing_session_local, headers):
        response = client.post(
            "/admin/settings",
            headers=headers,
            json={"key": key, "value": value},
        )

    assert response.status_code == 201
    body = response.json()
    assert body["key"] == key
    assert body["value"] == value


@pytest.mark.parametrize(
    ("key", "value", "detail"),
    [
        ("company_name", 123, "Настройка company_name должна быть строкой"),
        ("phone", ["+7 978 000-44-88"], "Настройка phone должна быть строкой"),
        ("phones", {"label": "+7 978 000-44-88", "href": "tel:+79780004488"}, "Настройка phones должна быть списком телефонов с label и href"),
        ("phones", [{"label": "+7 978 000-44-88"}], "Настройка phones должна быть списком телефонов с label и href"),
        ("personal_data_consent_text", False, "Настройка personal_data_consent_text должна быть строкой"),
        ("calculator_config", {
            "canopyOptions": [],
            "sizeOptions": [{"label": "3×4 м", "value": "3×4 м", "area": 12}],
            "materialOptions": [{"label": "Поликарбонат", "value": "Поликарбонат", "pricePerMeter": 7600}],
        }, "Настройка calculator_config должна содержать непустые массивы canopyOptions, sizeOptions и materialOptions с корректными label, value, коэффициентами и ценами"),
        ("calculator_config", {
            "canopyOptions": [{"label": "Для авто", "value": "Навес для авто", "multiplier": 0}],
            "sizeOptions": [{"label": "3×4 м", "value": "3×4 м", "area": 12}],
            "materialOptions": [{"label": "Поликарбонат", "value": "Поликарбонат", "pricePerMeter": 7600}],
        }, "Настройка calculator_config должна содержать непустые массивы canopyOptions, sizeOptions и materialOptions с корректными label, value, коэффициентами и ценами"),
    ],
)
def test_create_public_setting_rejects_invalid_value(
    tmp_path,
    key: str,
    value: Any,
    detail: str,
) -> None:
    with _admin_client(tmp_path) as (client, _testing_session_local, headers):
        response = client.post(
            "/admin/settings",
            headers=headers,
            json={"key": key, "value": value},
        )

    assert response.status_code == 422
    assert response.json()["detail"] == detail


def test_update_public_setting_rejects_invalid_value(tmp_path) -> None:
    with _admin_client(tmp_path) as (client, testing_session_local, headers):
        with testing_session_local() as db:
            setting = Setting(key="phone", value="+7 978 000-44-88", description=None)
            db.add(setting)
            db.commit()
            db.refresh(setting)
            setting_id = setting.id

        response = client.patch(
            f"/admin/settings/{setting_id}",
            headers=headers,
            json={"value": ["+7 978 000-44-88"]},
        )

    assert response.status_code == 422
    assert response.json()["detail"] == "Настройка phone должна быть строкой"


def test_update_setting_to_public_key_validates_existing_value(tmp_path) -> None:
    with _admin_client(tmp_path) as (client, testing_session_local, headers):
        with testing_session_local() as db:
            setting = Setting(key="custom", value={"label": "bad"}, description=None)
            db.add(setting)
            db.commit()
            db.refresh(setting)
            setting_id = setting.id

        response = client.patch(
            f"/admin/settings/{setting_id}",
            headers=headers,
            json={"key": "phones"},
        )

    assert response.status_code == 422
    assert response.json()["detail"] == "Настройка phones должна быть списком телефонов с label и href"
