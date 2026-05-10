import html
import re
from typing import Any

_PHONE_RE = re.compile(r"^\+?7\d{10}$")


def sanitize_text(value: str | None) -> str | None:
    if value is None:
        return None
    compact = " ".join(value.strip().split())
    return html.escape(compact, quote=False)


def sanitize_payload(value: Any) -> Any:
    if isinstance(value, str):
        return sanitize_text(value)
    if isinstance(value, list):
        return [sanitize_payload(item) for item in value]
    if isinstance(value, dict):
        return {key: sanitize_payload(item) for key, item in value.items()}
    return value


def normalize_phone(value: str) -> str:
    digits = re.sub(r"\D", "", value)
    if len(digits) == 11 and digits.startswith("8"):
        digits = "7" + digits[1:]
    if len(digits) == 10:
        digits = "7" + digits
    normalized = f"+{digits}"
    if not _PHONE_RE.fullmatch(normalized):
        raise ValueError("Введите корректный российский номер телефона")
    return normalized
