import base64
import hashlib
import hmac
import json
import time
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import Settings, get_settings

bearer_scheme = HTTPBearer(auto_error=False)


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(value + padding)


def _token_secret(settings: Settings) -> bytes:
    secret = settings.admin_jwt_secret or settings.admin_password or settings.admin_token
    return secret.encode("utf-8")


def create_admin_token(settings: Settings) -> str:
    now = int(time.time())
    payload: dict[str, Any] = {
        "sub": settings.admin_username,
        "role": "admin",
        "iat": now,
        "exp": now + settings.admin_token_ttl_seconds,
    }
    payload_part = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signature = hmac.new(_token_secret(settings), payload_part.encode("ascii"), hashlib.sha256).digest()
    return f"{payload_part}.{_b64url_encode(signature)}"


def verify_admin_token(token: str, settings: Settings) -> None:
    if settings.admin_token and hmac.compare_digest(token, settings.admin_token):
        return

    try:
        payload_part, signature_part = token.split(".", 1)
        expected = hmac.new(_token_secret(settings), payload_part.encode("ascii"), hashlib.sha256).digest()
        signature = _b64url_decode(signature_part)
        payload = json.loads(_b64url_decode(payload_part))
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Недействительный admin token") from exc

    if not hmac.compare_digest(signature, expected):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Недействительный admin token")
    if payload.get("role") != "admin" or payload.get("sub") != settings.admin_username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Недостаточно прав")
    if int(payload.get("exp", 0)) < int(time.time()):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Срок действия token истёк")


def require_admin(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    settings: Settings = Depends(get_settings),
) -> None:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Требуется Bearer token")
    verify_admin_token(credentials.credentials, settings)
