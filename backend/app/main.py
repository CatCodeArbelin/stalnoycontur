from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import content_router, health_router, lead_router, upload_router
from app.core.config import get_settings
from app.core.database import Base, engine
from app.core.rate_limit import InMemoryRateLimitMiddleware

settings = get_settings()

Base.metadata.create_all(bind=engine)

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
    requests=settings.rate_limit_requests,
    window_seconds=settings.rate_limit_window_seconds,
)

app.include_router(health_router, prefix=settings.api_prefix)
app.include_router(lead_router, prefix=settings.api_prefix)
app.include_router(upload_router, prefix=settings.api_prefix)
app.include_router(content_router, prefix=settings.api_prefix)
