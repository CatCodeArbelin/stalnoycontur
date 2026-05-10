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
        f"Согласие на обработку ПД: {'да' if lead.consent else 'нет'}",
    ]
    if lead.city:
        lines.append(f"Город: {lead.city}")
    if lead.source:
        lines.append(f"Источник: {lead.source}")
    if lead.message:
        lines.append(f"Комментарий: {lead.message}")
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
