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

`POST /lead` requires `name`, `phone` and `consent: true`. Telegram notifications are sent when `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are configured.
