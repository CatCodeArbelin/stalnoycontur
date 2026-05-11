import base64
import hashlib
import hmac
import json
import secrets
import time
from typing import Any

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import Settings, get_settings

bearer_scheme = HTTPBearer(auto_error=False)

ADMIN_SESSION_COOKIE = "admin_session"
ADMIN_CSRF_COOKIE = "admin_csrf"
ADMIN_CSRF_HEADER = "x-csrf-token"
_MUTATING_METHODS = {"POST", "PATCH", "DELETE"}


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(value: str) -> bytes:
    padding = "=" * (-len(value) % 4)
    return base64.urlsafe_b64decode(value + padding)


def _token_secret(settings: Settings) -> bytes:
    secret = settings.admin_jwt_secret or settings.admin_password or settings.admin_token
    return secret.encode("utf-8")


def create_csrf_token() -> str:
    return secrets.token_urlsafe(32)


def create_admin_token(
    settings: Settings,
    *,
    ttl_seconds: int | None = None,
    csrf_token: str | None = None,
) -> str:
    now = int(time.time())
    payload: dict[str, Any] = {
        "sub": settings.admin_username,
        "role": "admin",
        "iat": now,
        "exp": now + (ttl_seconds or settings.admin_token_ttl_seconds),
    }
    if csrf_token:
        payload["csrf"] = csrf_token
    payload_part = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signature = hmac.new(_token_secret(settings), payload_part.encode("ascii"), hashlib.sha256).digest()
    return f"{payload_part}.{_b64url_encode(signature)}"


def verify_admin_token(token: str, settings: Settings) -> dict[str, Any]:
    if settings.admin_token and hmac.compare_digest(token, settings.admin_token):
        return {"sub": settings.admin_username, "role": "admin", "static": True}

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
    return payload


def _verify_csrf(request: Request, payload: dict[str, Any]) -> None:
    if request.method.upper() not in _MUTATING_METHODS:
        return

    expected = payload.get("csrf")
    header_token = request.headers.get(ADMIN_CSRF_HEADER)
    cookie_token = request.cookies.get(ADMIN_CSRF_COOKIE)
    if not expected or not header_token or not cookie_token:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Требуется CSRF token")
    if not hmac.compare_digest(header_token, expected) or not hmac.compare_digest(cookie_token, expected):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Недействительный CSRF token")


def require_admin(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    settings: Settings = Depends(get_settings),
) -> dict[str, Any]:
    session_token = request.cookies.get(ADMIN_SESSION_COOKIE)
    if session_token:
        payload = verify_admin_token(session_token, settings)
        _verify_csrf(request, payload)
        return payload

    if credentials and credentials.scheme.lower() == "bearer":
        return verify_admin_token(credentials.credentials, settings)

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Требуется admin session")
