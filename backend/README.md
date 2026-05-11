# Backend

FastAPI backend for the Stalnoy Contur landing site.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
alembic upgrade head
uvicorn app.main:app --reload
```

## Endpoints

- `GET /health`
- `POST /lead`
- `POST /upload`
- `GET /cases`
- `GET /reviews`
- `GET /faq`
- `GET /settings`

`POST /lead` requires `name` and `phone`; optional payload fields include `city`, `canopy_type`, `material`, `size`, `comment`, `image`, `source_page`, and `utm`. Telegram notifications are sent when `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are configured.

## Image storage

Uploads are optimized to WEBP and stored under `IMAGES_ROOT`. In Docker the shared image volume is mounted at `/images`; local backend-only runs can use relative paths from `backend/.env.example`.

- Public `/upload` and admin `/admin/upload` accept an optional multipart `category` field: `uploads`, `cases`, `gallery`, `reviews`, or `production`.
- Multipart lead attachments are stored in the `production` category.
- Category directories are configured by `UPLOAD_DIR`/`UPLOAD_PATH`, `CASES_DIR`, `GALLERY_DIR`, `REVIEWS_DIR`, and `PRODUCTION_DIR`.
