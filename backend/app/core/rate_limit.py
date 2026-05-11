import json
from json import JSONDecodeError
import time
from collections import defaultdict, deque
from collections.abc import Callable
from dataclasses import dataclass
from typing import Deque

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

from app.core.admin_auth import ADMIN_SESSION_COOKIE, verify_admin_token
from app.core.config import Settings


@dataclass(frozen=True)
class RateLimitRule:
    """A route-aware fixed-window rate limit rule."""

    name: str
    requests: int
    window_seconds: int


class InMemoryRateLimitMiddleware(BaseHTTPMiddleware):
    """Simple route-aware rate limiter for a single-process deployment."""

    def __init__(
        self,
        app,
        *,
        requests: int,
        window_seconds: int,
        settings: Settings | None = None,
        admin_login_requests: int | None = None,
        admin_login_window_seconds: int | None = None,
        lead_requests: int | None = None,
        lead_window_seconds: int | None = None,
        upload_requests: int | None = None,
        upload_window_seconds: int | None = None,
        admin_requests: int | None = None,
        admin_window_seconds: int | None = None,
        admin_authenticated_exempt: bool | None = None,
    ) -> None:
        super().__init__(app)
        self.settings = settings
        self.api_prefix = self._normalize_prefix(settings.api_prefix if settings else "")
        self.default_rule = RateLimitRule("default", requests, window_seconds)
        self.admin_login_rule = RateLimitRule(
            "admin_login",
            admin_login_requests if admin_login_requests is not None else 5,
            admin_login_window_seconds if admin_login_window_seconds is not None else 5 * 60,
        )
        self.lead_rule = RateLimitRule(
            "lead",
            lead_requests if lead_requests is not None else requests,
            lead_window_seconds if lead_window_seconds is not None else window_seconds,
        )
        self.upload_rule = RateLimitRule(
            "upload",
            upload_requests if upload_requests is not None else requests,
            upload_window_seconds if upload_window_seconds is not None else window_seconds,
        )
        self.admin_rule = RateLimitRule(
            "admin",
            admin_requests if admin_requests is not None else requests,
            admin_window_seconds if admin_window_seconds is not None else window_seconds,
        )
        self.admin_authenticated_exempt = (
            admin_authenticated_exempt if admin_authenticated_exempt is not None else True
        )
        self._hits: dict[str, Deque[float]] = defaultdict(deque)

    async def dispatch(self, request: Request, call_next: Callable[[Request], Response]) -> Response:
        route_path = self._route_path(request.url.path)
        client = self._client_key(request)

        if route_path == "/admin/auth/login":
            username = await self._login_username(request)
            key = f"{self.admin_login_rule.name}:{client}:{username}"
            return await self._limit_or_call(request, call_next, self.admin_login_rule, key)

        if route_path == "/lead":
            key = f"{self.lead_rule.name}:{client}"
            return await self._limit_or_call(request, call_next, self.lead_rule, key)

        if route_path == "/upload":
            key = f"{self.upload_rule.name}:{client}"
            return await self._limit_or_call(request, call_next, self.upload_rule, key)

        if route_path.startswith("/admin/") or route_path == "/admin":
            if self.admin_authenticated_exempt and self._has_valid_admin_session(request):
                return await call_next(request)
            key = f"{self.admin_rule.name}:{client}"
            return await self._limit_or_call(request, call_next, self.admin_rule, key)

        key = f"{self.default_rule.name}:{client}"
        return await self._limit_or_call(request, call_next, self.default_rule, key)

    async def _limit_or_call(
        self,
        request: Request,
        call_next: Callable[[Request], Response],
        rule: RateLimitRule,
        key: str,
    ) -> Response:
        now = time.monotonic()
        hits = self._hits[key]
        while hits and now - hits[0] > rule.window_seconds:
            hits.popleft()

        if len(hits) >= rule.requests:
            retry_after = max(1, int(rule.window_seconds - (now - hits[0])))
            return JSONResponse(
                status_code=429,
                content={"detail": "Слишком много запросов. Попробуйте позже."},
                headers={"Retry-After": str(retry_after)},
            )

        hits.append(now)
        return await call_next(request)

    def _client_key(self, request: Request) -> str:
        client = request.client.host if request.client else "unknown"
        forwarded_for = request.headers.get("x-forwarded-for")
        if forwarded_for:
            client = forwarded_for.split(",", 1)[0].strip()
        return client

    def _route_path(self, path: str) -> str:
        normalized_path = path.rstrip("/") or "/"
        if self.api_prefix and normalized_path.startswith(f"{self.api_prefix}/"):
            return normalized_path.removeprefix(self.api_prefix) or "/"
        if normalized_path == self.api_prefix:
            return "/"
        if normalized_path.startswith("/api/"):
            return normalized_path.removeprefix("/api") or "/"
        if normalized_path == "/api":
            return "/"
        return normalized_path

    def _normalize_prefix(self, prefix: str) -> str:
        if not prefix or prefix == "/":
            return ""
        return f"/{prefix.strip('/')}"

    async def _login_username(self, request: Request) -> str:
        body = await request.body()
        if not body:
            return "unknown"
        content_type = request.headers.get("content-type", "")
        if "application/json" in content_type:
            try:
                data = json.loads(body)
            except JSONDecodeError:
                return "unknown"
            username = data.get("username") if isinstance(data, dict) else None
            return str(username or "unknown").strip().lower() or "unknown"
        return "unknown"

    def _has_valid_admin_session(self, request: Request) -> bool:
        if self.settings is None:
            return False

        session_token = request.cookies.get(ADMIN_SESSION_COOKIE)
        if session_token and self._is_valid_admin_token(session_token):
            return True

        authorization = request.headers.get("authorization", "")
        scheme, _, token = authorization.partition(" ")
        return bool(scheme.lower() == "bearer" and token and self._is_valid_admin_token(token))

    def _is_valid_admin_token(self, token: str) -> bool:
        if self.settings is None:
            return False
        try:
            verify_admin_token(token, self.settings)
        except Exception:
            return False
        return True
