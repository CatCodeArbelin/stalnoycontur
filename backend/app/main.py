from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import admin_router, content_router, health_router, lead_router, upload_router
from app.core.config import get_settings
from app.core.rate_limit import InMemoryRateLimitMiddleware

settings = get_settings()

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(
    InMemoryRateLimitMiddleware,
    settings=settings,
    requests=settings.rate_limit_requests,
    window_seconds=settings.rate_limit_window_seconds,
    admin_login_requests=settings.rate_limit_admin_login_requests,
    admin_login_window_seconds=settings.rate_limit_admin_login_window_seconds,
    lead_requests=settings.rate_limit_lead_requests,
    lead_window_seconds=settings.rate_limit_lead_window_seconds,
    upload_requests=settings.rate_limit_upload_requests,
    upload_window_seconds=settings.rate_limit_upload_window_seconds,
    admin_requests=settings.rate_limit_admin_requests,
    admin_window_seconds=settings.rate_limit_admin_window_seconds,
    admin_authenticated_exempt=settings.rate_limit_admin_authenticated_exempt,
)

app.include_router(health_router, prefix=settings.api_prefix)
app.include_router(lead_router, prefix=settings.api_prefix)
app.include_router(upload_router, prefix=settings.api_prefix)
app.include_router(content_router, prefix=settings.api_prefix)
app.include_router(admin_router, prefix=settings.api_prefix)

Path(settings.images_root).mkdir(parents=True, exist_ok=True)
app.mount("/images", StaticFiles(directory=settings.images_root), name="images")
