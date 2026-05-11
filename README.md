# Стальной Контур

Веб-приложение для сайта компании «Стальной Контур»: публичный лендинг по изготовлению навесов, страницы услуг и городов, формы заявок, загрузка изображений, административная панель и уведомления о новых заявках в Telegram.

Проект полностью запускается в Docker. Для локального старта **не требуется устанавливать Python, Node.js или PostgreSQL**: backend, frontend, PostgreSQL и nginx поднимаются контейнерами через Docker Compose.

## Описание проекта

Состав приложения:

- **Frontend** — Next.js 15 с App Router, TypeScript и Tailwind CSS. Отвечает за публичные страницы, SEO через Next.js App Router Metadata API, формы и админ-интерфейс.
- **Backend** — FastAPI API для заявок, контента, загрузок, админ-аутентификации, rate limit и Telegram-уведомлений.
- **Database** — PostgreSQL 16 в отдельном контейнере.
- **Reverse proxy** — nginx, который принимает HTTP-трафик, проксирует `/api/*` в backend, остальные запросы — во frontend, а также отдает healthcheck.
- **Persistent volumes** — Docker volumes для данных PostgreSQL, загруженных изображений и логов.

## Структура директорий

```text
.
├── backend/                 # FastAPI-приложение
│   ├── app/
│   │   ├── api/routes/      # API routes: health, lead, upload, content, admin
│   │   ├── core/            # Config, database, auth, security, rate limit
│   │   ├── models/          # SQLAlchemy-модели
│   │   ├── schemas/         # Pydantic-схемы
│   │   └── services/        # Content, upload, Telegram services
│   ├── alembic/             # Alembic migration scaffold
│   ├── Dockerfile
│   ├── requirements.txt
│   └── .env.example         # Пример переменных backend для standalone-запуска
├── frontend/                # Next.js-приложение
│   ├── src/app/             # App Router pages, sitemap, robots
│   ├── src/components/      # UI, layout, sections, admin shell
│   ├── src/data/            # Статические данные сайта
│   ├── src/lib/             # Утилиты
│   └── Dockerfile
├── nginx/
│   └── default.conf         # Reverse proxy конфигурация
├── docker-compose.yml       # Production Docker Compose стек
├── docker-compose.dev.yml   # Dev override: hot reload и bind mounts
├── README.md
└── LICENSE
```

## Требования

### Обязательные

- Docker Engine или Docker Desktop с Docker Compose v2.
- Свободный порт `80` на машине, либо другой порт через `NGINX_PORT`.
- Доступ к интернету при первой сборке образов, чтобы Docker скачал базовые образы и зависимости.

### Не требуются локально

- Python — backend запускается внутри контейнера `backend`.
- Node.js / npm — frontend собирается и запускается внутри контейнера `frontend`.
- PostgreSQL — база данных запускается внутри контейнера `postgres`.

## Быстрый запуск через Docker Compose

1. Соберите и запустите весь стек из чистого checkout без предварительного копирования `.env`:

   ```bash
   docker compose up --build
   ```

   Базовый `docker-compose.yml` содержит development-safe значения по умолчанию для локального запуска: PostgreSQL, backend, frontend build/runtime-переменные и nginx стартуют без корневого `.env`. `NEXT_PUBLIC_SITE_URL` по умолчанию равен `http://localhost`, browser-facing `NEXT_PUBLIC_API_URL` — относительному `/api`, а server-only `INTERNAL_API_URL` для SSR-запросов — `http://backend:8000/api`; при необходимости их можно переопределить через shell, корневой `.env` или `--env-file`. При старте backend-контейнер автоматически выполняет `alembic upgrade head`, поэтому актуальные миграции базы данных применяются без ручных команд.

2. Откройте приложение:

   - сайт: <http://localhost>
   - API healthcheck через nginx: <http://localhost/api/health>
   - nginx healthcheck: <http://localhost/nginx-health>

3. Остановите стек клавишами `Ctrl+C` или командой из другого терминала:

   ```bash
   docker compose down
   ```

## Как войти в админку

- UI админ-панели: `/admin`.
- API login: `/api/admin/auth/login`.
- Default dev credentials: `admin / change-me`.

## Development mode

Рекомендуемый режим разработки — через базовый `docker-compose.yml` и dev override `docker-compose.dev.yml`. Dev override включает hot reload, монтирует исходники в контейнеры и публикует сервисы напрямую на портах `3000` и `8000`.

### Запуск с логами в терминале

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

После запуска доступны:

- frontend dev server: <http://localhost:3000>
- backend API напрямую: <http://localhost:8000/api/health>
- полный стек через nginx: <http://localhost>

### Запуск в фоне

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

После запуска смотрите логи нужного сервиса:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f backend
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f frontend
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f nginx
docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f postgres
```

### Остановка dev-стека

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

### Пересборка отдельного сервиса

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml build backend
docker compose -f docker-compose.yml -f docker-compose.dev.yml build frontend
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d backend frontend nginx
```

### Выполнение команд внутри контейнеров

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python -m alembic current
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec backend python -m alembic upgrade head
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec frontend npm run typecheck
docker compose -f docker-compose.yml -f docker-compose.dev.yml exec frontend npm run lint
```

Dev override запускает frontend командой `npm run dev` с bind mount `./frontend:/app`. Чтобы bind mount не перетирал установленные зависимости внутри Linux-контейнера, `node_modules` вынесен в named volume `frontend_node_modules`; это особенно важно для стабильной работы Docker Desktop на Windows. Backend запускается командой `uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload` с bind mount `./backend:/app`; перед запуском этой команды entrypoint backend-контейнера также автоматически выполняет `alembic upgrade head`.

## Production mode

Production запуск по-прежнему использует только базовый `docker-compose.yml`; dev override подключать не нужно. Backend-контейнер перед стартом uvicorn применяет миграции командой `alembic upgrade head`. Для VPS или сервера используйте фоновый запуск и задавайте реальные значения переменных окружения через `--env-file .env.production`, корневой `.env` или переменные shell; эти значения переопределят development-safe defaults из `docker-compose.yml`, включая `frontend.build.args`.

1. Настройте production-переменные в `.env.production`:

   ```bash
   nano .env.production
   ```

   Обязательно замените `POSTGRES_PASSWORD`, `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`, `FRONTEND_URL`, `API_URL`, `NEXT_PUBLIC_SITE_URL` и, при необходимости, `TG_BOT_TOKEN` / `TG_GROUP_ID`. `NEXT_PUBLIC_API_URL` на VPS оставьте относительным `/api` либо задайте публичный домен вида `https://example.com/api`; не используйте `http://localhost/api`, потому что это значение попадает в браузерный bundle. `INTERNAL_API_URL` обычно оставляют `http://backend:8000/api` для SSR-запросов внутри docker-сети. Команда ниже по-прежнему поддерживается и передает production-значения и в сервисы, и в `frontend.build.args`.

2. Запустите стек с production env-файлом:

   ```bash
   docker compose --env-file .env.production up --build -d
   ```

3. Проверьте состояние:

   ```bash
   docker compose --env-file .env.production ps
   docker compose --env-file .env.production logs --tail=100 backend
   curl -f http://127.0.0.1/nginx-health
   curl -f http://127.0.0.1/api/health
   ```

4. После изменения env-файла примените конфигурацию перезапуском:

   ```bash
   docker compose --env-file .env.production up -d --force-recreate
   ```

### Production security headers

Nginx в `nginx/default.conf` добавляет базовые защитные заголовки для production-трафика:

- `X-Frame-Options: SAMEORIGIN` — разрешает встраивание сайта только страницами того же origin.
- `X-Content-Type-Options: nosniff` — запрещает браузеру угадывать MIME-типы.
- `Referrer-Policy: strict-origin-when-cross-origin` — ограничивает передачу полного referrer на внешние сайты.
- `Permissions-Policy` — запрещает неиспользуемые browser API вроде камеры, микрофона, геолокации, USB, Bluetooth, payment, sensors и прочих возможностей.
- `Content-Security-Policy-Report-Only` — стартовый CSP в режиме наблюдения: он совместим с Next.js, JSON-LD/inline scripts, текущими inline styles, локальными и внешними изображениями, а также ссылками/интеграциями Telegram и MAX. Нарушения только логируются браузером и не блокируют страницу.

После правок `nginx/default.conf` пересоздайте nginx и проверьте заголовки:

```bash
docker compose --env-file .env.production up -d --force-recreate nginx
curl -I http://127.0.0.1/
```

Если в браузерной консоли нет CSP-нарушений для критичных сценариев, можно перейти от `Content-Security-Policy-Report-Only` к принудительному `Content-Security-Policy`. Перед ужесточением уберите разрешения вроде `'unsafe-inline'` только после перевода inline script/style на nonce, hash или внешние файлы.

## Env variables

В репозитории есть `.env.example`, `.env.development` и `.env.production`. Базовый `docker-compose.yml` больше не подключает обязательный `env_file`, поэтому чистый checkout запускается сразу с безопасными локальными defaults:

- для development можно запускать обычный `docker compose ...` без `.env`; если нужны свои значения, создайте корневой `.env` на основе `.env.example`, экспортируйте переменные в shell или явно передайте `--env-file .env.development`;
- для production запускайте `docker compose --env-file .env.production up --build -d` или создайте корневой `.env` с production-значениями;
- `NEXT_PUBLIC_SITE_URL` имеет fallback `http://localhost`, а `NEXT_PUBLIC_API_URL` имеет browser-safe fallback `/api`. Для VPS браузерный API должен быть `/api` (через nginx reverse proxy) или публичным доменом вида `https://example.com/api`; `http://localhost/api` в production использовать нельзя, потому что это значение встраивается во frontend bundle и для посетителя указывает на его локальный компьютер.
- `INTERNAL_API_URL` — server-only URL для SSR-запросов frontend-контейнера к backend внутри docker-сети; значение по умолчанию `http://backend:8000/api` не попадает в browser bundle.

| Переменная | Значение по умолчанию | Назначение |
| --- | --- | --- |
| `FRONTEND_URL` | `http://localhost` | Публичный URL frontend-приложения. |
| `API_URL` | `http://localhost/api` | Публичный URL API. |
| `POSTGRES_DB` | `stalnoycontur` | Имя базы PostgreSQL. |
| `POSTGRES_USER` | `stalnoycontur` | Пользователь PostgreSQL. |
| `POSTGRES_PASSWORD` | `stalnoycontur` | Пароль PostgreSQL. В production обязательно заменить. |
| `NGINX_PORT` | `80` | Порт хоста, на который публикуется nginx. |
| `APP_NAME` | `Stalnoy Contur API` | Название FastAPI-приложения. |
| `API_PREFIX` | `/api` | Префикс backend routes за nginx. |
| `DATABASE_URL` | PostgreSQL DSN | URL подключения backend к базе данных; этот же env используется Alembic для автоматического `alembic upgrade head` при старте контейнера. |
| `CORS_ORIGINS` | `http://localhost,http://localhost:3000` | Разрешенные origins через запятую. |
| `RATE_LIMIT_REQUESTS` | `60` | Количество запросов в базовом окне rate limit для routes без специальных правил. |
| `RATE_LIMIT_WINDOW_SECONDS` | `60` | Длительность базового окна rate limit в секундах. |
| `RATE_LIMIT_ADMIN_LOGIN_REQUESTS` | `5` | Лимит попыток входа на `/api/admin/auth/login` в окне; ключ считается по IP + username. |
| `RATE_LIMIT_ADMIN_LOGIN_WINDOW_SECONDS` | `300` | Окно лимита входа администратора в секундах. |
| `RATE_LIMIT_LEAD_REQUESTS` | `5` | Anti-spam лимит для публичной отправки заявки `/api/lead` по IP. |
| `RATE_LIMIT_LEAD_WINDOW_SECONDS` | `300` | Окно anti-spam лимита для `/api/lead` в секундах. |
| `RATE_LIMIT_UPLOAD_REQUESTS` | `10` | Anti-spam лимит для публичной загрузки `/api/upload` по IP. |
| `RATE_LIMIT_UPLOAD_WINDOW_SECONDS` | `300` | Окно anti-spam лимита для `/api/upload` в секундах. |
| `RATE_LIMIT_ADMIN_REQUESTS` | `120` | Мягкий лимит для `/api/admin/*` без валидной trusted admin session. |
| `RATE_LIMIT_ADMIN_WINDOW_SECONDS` | `60` | Окно мягкого лимита для `/api/admin/*` в секундах. |
| `RATE_LIMIT_ADMIN_AUTHENTICATED_EXEMPT` | `true` | Если `true`, запросы `/api/admin/*` с валидной admin cookie или bearer token не ограничиваются middleware. |
| `UPLOAD_MAX_SIZE_BYTES` | `10485760` | Максимальный размер исходного загружаемого изображения: 10 МБ. |
| `UPLOAD_MAX_WIDTH` | `1920` | Максимальная ширина оптимизированного изображения в пикселях. |
| `UPLOAD_MAX_HEIGHT` | `1920` | Максимальная высота оптимизированного изображения в пикселях. |
| `UPLOAD_WEBP_QUALITY` | `82` | Качество WEBP при сохранении оптимизированного изображения. |
| `IMAGES_ROOT` | `/images` | Общий корень persistent volume с изображениями внутри backend и nginx. |
| `UPLOAD_DIR` / `UPLOAD_PATH` | `/images/uploads` | Директория для общих public uploads внутри `IMAGES_ROOT`. |
| `CASES_DIR` | `/images/cases` | Директория для обложек кейсов, загружаемых из админки. |
| `GALLERY_DIR` | `/images/gallery` | Директория для галерей кейсов, загружаемых из админки. |
| `REVIEWS_DIR` | `/images/reviews` | Директория для изображений отзывов, загружаемых из админки. |
| `PRODUCTION_DIR` | `/images/production` | Директория для изображений из публичных multipart-заявок. |
| `UPLOAD_URL_PREFIX` | `/images/uploads` | URL-префикс для общей категории uploads; категорийные URL формируются как `/images/<category>/...`. |
| `ADMIN_USERNAME` | `admin` | Логин админ-панели. |
| `ADMIN_PASSWORD` | `change-me` | Пароль админ-панели. В production обязательно заменить. |
| `ADMIN_TOKEN` | пусто | Опциональный постоянный bearer token для админки. |
| `ADMIN_JWT_SECRET` | пусто | Секрет подписи JWT. В production рекомендуется задать. |
| `ADMIN_TOKEN_TTL_SECONDS` | `43200` | Время жизни выданного админ-токена. |
| `TG_BOT_TOKEN` | пусто | Токен Telegram-бота для уведомлений. |
| `TG_GROUP_ID` | пусто | ID группы/чата, куда отправляются заявки. |
| `TELEGRAM_API_BASE_URL` | `https://api.telegram.org` | Базовый URL Telegram Bot API. |
| `TELEGRAM_TIMEOUT_SECONDS` | `8` | Timeout запросов к Telegram API. |
| `NEXT_PUBLIC_SITE_URL` | `http://localhost` | Публичный URL сайта, доступный в frontend bundle. |
| `NEXT_PUBLIC_API_URL` | `/api` | Browser-facing URL API, доступный в frontend bundle; на VPS используйте `/api` или публичный домен, но не `http://localhost/api`. |
| `INTERNAL_API_URL` | `http://backend:8000/api` | Server-only URL API для SSR-запросов frontend-контейнера внутри docker-сети. |

## Docker commands

### Основные команды

```bash
# Production: собрать и запустить все сервисы с логами
docker compose --env-file .env.production up --build

# Production: собрать и запустить в фоне
docker compose --env-file .env.production up --build -d

# Посмотреть статус production-контейнеров при запуске через .env.production
docker compose --env-file .env.production ps

# Посмотреть логи всех production-сервисов при запуске через .env.production
docker compose --env-file .env.production logs -f

# Посмотреть логи конкретного production-сервиса при запуске через .env.production
docker compose --env-file .env.production logs -f backend

# Остановить и удалить production-контейнеры, сохранив volumes
docker compose --env-file .env.production down

# Остановить и удалить production-контейнеры вместе с volumes: удалит БД и images
docker compose --env-file .env.production down -v
```

### Обслуживание

```bash
# Пересобрать без cache
docker compose build --no-cache

# Перезапустить сервис
docker compose restart backend

# Открыть shell в backend-контейнере
docker compose exec backend sh

# Открыть psql в postgres-контейнере
docker compose exec postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"

# Удалить неиспользуемые Docker-ресурсы
docker system prune
```

Если переменные `POSTGRES_USER` и `POSTGRES_DB` не экспортированы в shell, используйте значения по умолчанию:

```bash
docker compose exec postgres psql -U stalnoycontur -d stalnoycontur
```

## Backup и restore PostgreSQL

Данные PostgreSQL хранятся в Docker volume `postgres_data`. Перед destructive-операциями (`docker compose down -v`, перенос сервера, обновления) делайте backup.

### Backup

```bash
mkdir -p backups
docker compose exec -T postgres pg_dump \
  -U "${POSTGRES_USER:-stalnoycontur}" \
  -d "${POSTGRES_DB:-stalnoycontur}" \
  --format=custom \
  --file=/tmp/stalnoycontur.dump

docker compose cp postgres:/tmp/stalnoycontur.dump ./backups/stalnoycontur-$(date +%Y%m%d-%H%M%S).dump
docker compose exec -T postgres rm /tmp/stalnoycontur.dump
```

Альтернативный plain SQL backup:

```bash
mkdir -p backups
docker compose exec -T postgres pg_dump \
  -U "${POSTGRES_USER:-stalnoycontur}" \
  -d "${POSTGRES_DB:-stalnoycontur}" \
  > ./backups/stalnoycontur-$(date +%Y%m%d-%H%M%S).sql
```

### Restore из custom dump

```bash
# Внимание: команда пересоздает схему public в текущей базе.
docker compose cp ./backups/stalnoycontur.dump postgres:/tmp/stalnoycontur.dump

docker compose exec -T postgres psql \
  -U "${POSTGRES_USER:-stalnoycontur}" \
  -d "${POSTGRES_DB:-stalnoycontur}" \
  -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

docker compose exec -T postgres pg_restore \
  -U "${POSTGRES_USER:-stalnoycontur}" \
  -d "${POSTGRES_DB:-stalnoycontur}" \
  --clean --if-exists \
  /tmp/stalnoycontur.dump

docker compose exec -T postgres rm /tmp/stalnoycontur.dump
```

### Restore из plain SQL

```bash
docker compose exec -T postgres psql \
  -U "${POSTGRES_USER:-stalnoycontur}" \
  -d "${POSTGRES_DB:-stalnoycontur}" \
  < ./backups/stalnoycontur.sql
```

## Хранение изображений

- Backend принимает изображения через public upload API, admin upload API и multipart-заявки, валидирует тип и размер файла единым сервисом.
- Разрешенные исходные типы по умолчанию: JPEG (`image/jpeg`), PNG (`image/png`) и WEBP (`image/webp`).
- Максимальный размер исходного файла по умолчанию: `10485760` байт (10 МБ), настраивается через `UPLOAD_MAX_SIZE_BYTES`; frontend также показывает понятную ошибку до отправки файла.
- После загрузки backend открывает изображение через Pillow, применяет EXIF-ориентацию, уменьшает до `UPLOAD_MAX_WIDTH` × `UPLOAD_MAX_HEIGHT` (по умолчанию 1920 × 1920 px), сжимает с `UPLOAD_WEBP_QUALITY` (по умолчанию 82) и сохраняет только оптимизированный `.webp`.
- В Docker оптимизированные изображения хранятся в общем volume `uploaded_images`, который смонтирован в backend и nginx как `/images`. Nginx отдает `/images/` напрямую с cache headers, поэтому backend нужен только для записи файлов и dev-режима без nginx.
- Категория загрузки выбирает поддиректорию: `uploads` → `/images/uploads`, `cases` → `/images/cases`, `gallery` → `/images/gallery`, `reviews` → `/images/reviews`, `production` → `/images/production`. Public upload API и admin upload API принимают multipart-поле `category`; файлы из multipart-заявок сохраняются в `production`.
- URL оптимизированного изображения формируется как `/images/<category>/<filename>.webp` (для общей категории — `UPLOAD_URL_PREFIX`, по умолчанию `/images/uploads`), а записи uploads получают `content_type=image/webp` и filename с расширением `.webp`.
- `docker compose down` сохраняет volume с изображениями; `docker compose down -v` удаляет его вместе с БД и логами.

### Backup images

```bash
mkdir -p backups
docker run --rm \
  -v stalnoycontur_uploaded_images:/data:ro \
  -v "$(pwd)/backups:/backup" \
  alpine tar -czf /backup/images-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .
```

### Restore images

```bash
docker run --rm \
  -v stalnoycontur_uploaded_images:/data \
  -v "$(pwd)/backups:/backup" \
  alpine sh -c 'cd /data && tar -xzf /backup/images.tar.gz'
```

> Имя volume может отличаться, если проект запущен с другим `COMPOSE_PROJECT_NAME`. Проверьте фактические имена командой `docker volume ls`.

## Telegram integration

Telegram-уведомления отправляются при создании заявки, если заданы `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`.

1. Создайте бота через BotFather и получите token.
2. Добавьте бота в нужный чат или канал.
3. Узнайте `chat_id` удобным для вас способом, например через `getUpdates` после отправки сообщения в чат.
4. Добавьте значения в корневой `.env`:

   ```dotenv
   TELEGRAM_BOT_TOKEN=123456789:replace-me
   TELEGRAM_CHAT_ID=-1001234567890
   ```

5. Пересоздайте backend-контейнер:

   ```bash
   docker compose up -d --force-recreate backend
   ```

Если Telegram-переменные пустые, заявки продолжают сохраняться, но уведомления в Telegram пропускаются.

## Windows Docker Desktop

1. Установите Docker Desktop for Windows и включите WSL 2 backend.
2. Перезагрузите Windows, если установщик попросит.
3. Откройте проект в WSL, PowerShell или терминале VS Code.
4. Убедитесь, что Docker работает:

   ```powershell
   docker version
   docker compose version
   ```

5. Запустите проект:

   ```powershell
   docker compose up --build
   ```

6. Откройте <http://localhost>.

Советы для Windows:

- Храните репозиторий внутри файловой системы WSL (`/home/<user>/...`), если используете WSL: сборка обычно быстрее, чем из `/mnt/c/...`.
- Если порт `80` занят, задайте другой порт в `.env`:

  ```dotenv
  NGINX_PORT=8080
  ```

  Затем откройте <http://localhost:8080>.

- Команды backup с `$(date ...)` рассчитаны на bash/WSL. В PowerShell используйте явное имя файла или запускайте backup-команды из WSL/Git Bash.

## Ubuntu VPS

1. Обновите систему:

   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. Установите Docker по официальной инструкции Docker для Ubuntu или через пакетный менеджер вашей инфраструктуры.

3. Проверьте Docker Compose v2:

   ```bash
   docker compose version
   ```

4. Склонируйте проект и перейдите в директорию:

   ```bash
   git clone <repo-url> stalnoycontur
   cd stalnoycontur
   ```

5. Создайте `.env` с production-значениями или используйте `.env.production` через `--env-file`. Если копируете шаблон, замените все секреты и публичные URL на реальные значения домена:

   ```bash
   cp .env.production .env
   nano .env
   ```

6. Откройте firewall-порты:

   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

7. Запустите стек:

   ```bash
   docker compose up --build -d
   ```

8. Проверьте healthchecks:

   ```bash
   docker compose ps
   curl -f http://127.0.0.1/nginx-health
   curl -f http://127.0.0.1/api/health
   ```

9. Для HTTPS установите внешний reverse proxy / TLS-терминатор на сервере или расширьте nginx-конфигурацию сертификатами Let's Encrypt. Текущий compose публикует HTTP-порт.

## Troubleshooting

### Порт 80 уже занят

Симптом: nginx не стартует или Docker сообщает, что port is already allocated.

Решение:

```dotenv
NGINX_PORT=8080
```

Затем:

```bash
docker compose up -d --force-recreate nginx
```

Открывайте сайт на <http://localhost:8080>.

### Backend не проходит healthcheck

```bash
docker compose ps
docker compose logs --tail=200 backend
docker compose logs --tail=200 postgres
```

Проверьте `DATABASE_URL`, `POSTGRES_*` переменные и состояние контейнера `postgres`.

### Frontend не собирается

```bash
docker compose build --no-cache frontend
docker compose logs --tail=200 frontend
```

Чаще всего причина в ошибке TypeScript, ESLint или недоступности npm registry при сборке.

### Проверка и диагностика security headers / CSP

Проверьте, что nginx вернул production-заголовки:

```bash
curl -I http://127.0.0.1/
curl -I http://127.0.0.1/_next/static/
```

Ожидаемые заголовки: `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` и `Content-Security-Policy-Report-Only`. Если заголовков нет, пересоздайте nginx после изменения конфигурации:

```bash
docker compose up -d --force-recreate nginx
```

Если браузер показывает CSP report-only warnings, сначала убедитесь, что сценарий действительно нужен приложению. Для новых внешних CDN/API добавьте минимально необходимый origin в соответствующую директиву `script-src`, `style-src`, `img-src` или `connect-src`; не расширяйте `default-src` без необходимости.

### CORS ошибки в браузере

Добавьте реальные origins в `CORS_ORIGINS` через запятую:

```dotenv
CORS_ORIGINS=https://example.com,https://www.example.com,http://localhost
```

После изменения:

```bash
docker compose up -d --force-recreate backend
```

### Не приходят Telegram-уведомления

Проверьте:

- заполнены `TELEGRAM_BOT_TOKEN` и `TELEGRAM_CHAT_ID`;
- бот добавлен в чат;
- backend-контейнер пересоздан после изменения `.env`;
- в логах backend нет ошибок Telegram API.

Команды диагностики:

```bash
docker compose logs --tail=200 backend
```

### Пропали данные после остановки

`docker compose down` не удаляет volumes. `docker compose down -v` удаляет volumes, включая PostgreSQL и images. Если была выполнена команда с `-v`, восстановите данные из backup.

### Посмотреть имена volumes

```bash
docker volume ls | grep stalnoycontur
```

Если проект запускался с другим именем директории или `COMPOSE_PROJECT_NAME`, префикс volume будет отличаться.
