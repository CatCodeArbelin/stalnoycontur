import logging
from typing import Any

import httpx

from app.core.config import Settings
from app.schemas.lead import LeadCreate

logger = logging.getLogger(__name__)


def build_lead_message(lead: LeadCreate) -> str:
    """Build the Telegram notification message in the project brief format."""
    lines = [
        "🛠 Новая заявка с сайта Стальной Контур",
        f"Имя: {lead.name}",
        f"Телефон: {lead.phone}",
    ]
    if lead.city:
        lines.append(f"Город: {lead.city}")
    if lead.canopy_type:
        lines.append(f"Тип навеса: {lead.canopy_type}")
    if lead.material:
        lines.append(f"Материал: {lead.material}")
    if lead.comment:
        lines.append(f"Комментарий: {lead.comment}")
    if lead.image:
        lines.append(f"Изображение: {lead.image}")
    if lead.source_page:
        lines.append(f"Страница: {lead.source_page}")
    if lead.utm:
        utm = ", ".join(f"{key}={value}" for key, value in lead.utm.items())
        lines.append(f"UTM: {utm}")
    return "\n".join(lines)


async def send_lead_to_telegram(lead: LeadCreate, settings: Settings) -> bool:
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        logger.info("Telegram credentials are not configured; lead notification skipped")
        return False

    url = f"{str(settings.telegram_api_base_url).rstrip('/')}/bot{settings.telegram_bot_token}/sendMessage"
    payload: dict[str, Any] = {
        "chat_id": settings.telegram_chat_id,
        "text": build_lead_message(lead),
        "disable_web_page_preview": True,
    }

    async with httpx.AsyncClient(timeout=settings.telegram_timeout_seconds) as client:
        response = await client.post(url, json=payload)
        response.raise_for_status()
    return True
