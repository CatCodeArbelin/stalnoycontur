# Стальной Контур

Веб-приложение для сайта компании «Стальной Контур»: публичный лендинг по изготовлению навесов, страницы услуг и городов, формы заявок, загрузка изображений, административная панель и уведомления о новых заявках в Telegram.

Проект полностью запускается в Docker. Для локального старта **не требуется устанавливать Python, Node.js или PostgreSQL**: backend, frontend, PostgreSQL и nginx поднимаются контейнерами через Docker Compose.

## Описание проекта

Состав приложения:

- **Frontend** — Next.js 15 с App Router, TypeScript и Tailwind CSS. Отвечает за публичные страницы, SEO, формы и админ-интерфейс.
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
├── docker-compose.yml       # Production-like Docker Compose стек
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

1. При необходимости создайте `.env` в корне проекта:

   ```bash
   cp backend/.env.example .env
   ```

   Корневой `.env` используется Docker Compose для подстановки переменных. Для быстрого локального запуска файл можно не создавать: в `docker-compose.yml` заданы безопасные значения по умолчанию для разработки.

2. Соберите и запустите весь стек:

   ```bash
   docker compose up --build
   ```

3. Откройте приложение:

   - сайт: <http://localhost>
   - API healthcheck через nginx: <http://localhost/api/health>
   - nginx healthcheck: <http://localhost/nginx-health>

4. Остановите стек клавишами `Ctrl+C` или командой из другого терминала:

   ```bash
   docker compose down
   ```

## Development mode

Рекомендуемый режим разработки — также через Docker, без локальных Python, Node.js и PostgreSQL.

### Запуск с логами в терминале

```bash
docker compose up --build
```

Полезно при активной разработке: все логи сервисов выводятся в текущий терминал.

### Запуск в фоне

```bash
docker compose up --build -d
```

После запуска смотрите логи нужного сервиса:

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
docker compose logs -f postgres
```

### Пересборка отдельного сервиса

```bash
docker compose build backend
docker compose build frontend
docker compose up -d backend frontend nginx
```

### Выполнение команд внутри контейнеров

```bash
docker compose exec backend python -m alembic current
docker compose exec backend python -m alembic upgrade head
docker compose exec frontend npm run typecheck
docker compose exec frontend npm run lint
```

> Примечание: текущий compose-файл настроен как production-like стек. Для hot reload можно добавить отдельный `docker-compose.override.yml` с bind mount исходников и dev-командами (`uvicorn --reload`, `npm run dev`), но базовый запуск проекта не требует этого файла.

## Production mode

Для VPS или сервера используйте фоновый запуск и задавайте реальные значения переменных окружения.

1. Скопируйте шаблон и настройте production-переменные:

   ```bash
   cp .env.example .env.production
   nano .env.production
   ```

   Обязательно замените `POSTGRES_PASSWORD`, `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_JWT_SECRET`, `FRONTEND_URL`, `API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_API_URL` и, при необходимости, `TG_BOT_TOKEN` / `TG_GROUP_ID`.

2. Запустите стек с production env-файлом:

   ```bash
   docker compose --env-file .env.production up --build -d
   ```

3. Проверьте состояние:

   ```bash
   docker compose ps
   docker compose logs --tail=100 backend
   curl -f http://127.0.0.1/nginx-health
   curl -f http://127.0.0.1/api/health
   ```

4. После изменения env-файла примените конфигурацию перезапуском:

   ```bash
   docker compose --env-file .env.production up -d --force-recreate
   ```

## Env variables

В репозитории есть корневые `.env.example`, `.env.development` и `.env.production`. По умолчанию сервисы в `docker-compose.yml` подключают `.env.development` через `env_file`; для production запускайте Compose с `--env-file .env.production`, чтобы эти же значения использовались и для build args фронтенда.

| Переменная | Значение по умолчанию | Назначение |
| --- | --- | --- |
| `ENV_FILE` | `.env.development` | Env-файл, который подключается к сервисам через `env_file`. |
| `FRONTEND_URL` | `http://localhost` | Публичный URL frontend-приложения. |
| `API_URL` | `http://localhost/api` | Публичный URL API. |
| `POSTGRES_DB` | `stalnoycontur` | Имя базы PostgreSQL. |
| `POSTGRES_USER` | `stalnoycontur` | Пользователь PostgreSQL. |
| `POSTGRES_PASSWORD` | `stalnoycontur` | Пароль PostgreSQL. В production обязательно заменить. |
| `NGINX_PORT` | `80` | Порт хоста, на который публикуется nginx. |
| `APP_NAME` | `Stalnoy Contur API` | Название FastAPI-приложения. |
| `API_PREFIX` | `/api` | Префикс backend routes за nginx. |
| `DATABASE_URL` | PostgreSQL DSN | URL подключения backend к базе данных. |
| `CORS_ORIGINS` | `http://localhost,http://localhost:3000` | Разрешенные origins через запятую. |
| `RATE_LIMIT_REQUESTS` | `60` | Количество запросов в окне rate limit. |
| `RATE_LIMIT_WINDOW_SECONDS` | `60` | Длительность окна rate limit в секундах. |
| `UPLOAD_MAX_SIZE_BYTES` | `10485760` | Максимальный размер загружаемого файла. |
| `UPLOAD_DIR` / `UPLOAD_PATH` | `/app/uploads` | Директория uploads внутри backend-контейнера. |
| `UPLOAD_URL_PREFIX` | `/uploads` | URL-префикс для отдачи загруженных файлов backend-ом. |
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
| `NEXT_PUBLIC_API_URL` | `http://localhost/api` | Публичный URL API, доступный в frontend bundle. |

## Docker commands

### Основные команды

```bash
# Собрать и запустить все сервисы с логами
docker compose up --build

# Собрать и запустить в фоне
docker compose up --build -d

# Посмотреть статус контейнеров
docker compose ps

# Посмотреть логи всех сервисов
docker compose logs -f

# Посмотреть логи конкретного сервиса
docker compose logs -f backend

# Остановить и удалить контейнеры, сохранив volumes
docker compose down

# Остановить и удалить контейнеры вместе с volumes: удалит БД и uploads
docker compose down -v
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

- Backend принимает изображения через upload API, валидирует тип и размер файла.
- Разрешенные типы по умолчанию: JPEG, PNG и WEBP.
- Максимальный размер по умолчанию: `10485760` байт, настраивается через `UPLOAD_MAX_SIZE_BYTES`.
- В Docker изображения хранятся в volume `uploaded_images`, который смонтирован в backend как `/app/uploads`.
- URL загруженного изображения формируется с префиксом `UPLOAD_URL_PREFIX`, по умолчанию `/uploads`.
- `docker compose down` сохраняет volume с изображениями; `docker compose down -v` удаляет его вместе с БД и логами.

### Backup uploads

```bash
mkdir -p backups
docker run --rm \
  -v stalnoycontur_uploaded_images:/data:ro \
  -v "$(pwd)/backups:/backup" \
  alpine tar -czf /backup/uploads-$(date +%Y%m%d-%H%M%S).tar.gz -C /data .
```

### Restore uploads

```bash
docker run --rm \
  -v stalnoycontur_uploaded_images:/data \
  -v "$(pwd)/backups:/backup" \
  alpine sh -c 'cd /data && tar -xzf /backup/uploads.tar.gz'
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

5. Создайте `.env` с production-значениями:

   ```bash
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

`docker compose down` не удаляет volumes. `docker compose down -v` удаляет volumes, включая PostgreSQL и uploads. Если была выполнена команда с `-v`, восстановите данные из backup.

### Посмотреть имена volumes

```bash
docker volume ls | grep stalnoycontur
```

Если проект запускался с другим именем директории или `COMPOSE_PROJECT_NAME`, префикс volume будет отличаться.
