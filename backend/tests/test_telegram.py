from app.core.config import Settings
from app.schemas.lead import LeadCreate
from app.services.telegram import build_absolute_image_url, build_lead_message


def test_build_absolute_image_url_keeps_external_url():
    settings = Settings(frontend_url="https://domain.ru")

    assert (
        build_absolute_image_url("https://cdn.domain.ru/uploads/file.webp", settings)
        == "https://cdn.domain.ru/uploads/file.webp"
    )


def test_build_absolute_image_url_adds_public_origin_for_images_path():
    settings = Settings(frontend_url="https://domain.ru")

    assert (
        build_absolute_image_url("/images/uploads/file.webp", settings)
        == "https://domain.ru/images/uploads/file.webp"
    )


def test_build_absolute_image_url_uses_api_origin_without_frontend_url():
    settings = Settings(api_url="https://domain.ru/api")

    assert (
        build_absolute_image_url("/images/uploads/file.webp", settings)
        == "https://domain.ru/images/uploads/file.webp"
    )


def test_build_absolute_image_url_strips_api_path_when_frontend_has_path():
    settings = Settings(
        frontend_url="https://domain.ru/site", api_url="https://domain.ru/api"
    )

    assert (
        build_absolute_image_url("/images/uploads/file.webp", settings)
        == "https://domain.ru/images/uploads/file.webp"
    )


def test_build_lead_message_contains_absolute_image_url():
    settings = Settings(frontend_url="https://domain.ru")
    lead = LeadCreate(
        name="Иван Иванов",
        phone="+7 (999) 123-45-67",
        image="/images/uploads/file.webp",
    )

    message = build_lead_message(lead, settings)

    assert "Изображение: https://domain.ru/images/uploads/file.webp" in message
