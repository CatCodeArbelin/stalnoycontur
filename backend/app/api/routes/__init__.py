from app.api.routes.admin import router as admin_router
from app.api.routes.content import router as content_router
from app.api.routes.health import router as health_router
from app.api.routes.lead import router as lead_router
from app.api.routes.upload import router as upload_router

__all__ = ["admin_router", "content_router", "health_router", "lead_router", "upload_router"]
