#!/bin/sh
set -e

case "${ADMIN_PASSWORD:-}" in
  change-me|replace-with-*)
    echo "WARNING: ADMIN_PASSWORD is using an unsafe development placeholder. Set a strong admin password before production use."
    ;;
esac

echo "Applying database migrations..."
python -m alembic upgrade head

echo "Starting application..."
exec "$@"
