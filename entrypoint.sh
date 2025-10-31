#!/bin/sh
set -e

echo "Starting entrypoint..."

if [ -n "$DATABASE_HOST" ]; then
  echo "Waiting for database at $DATABASE_HOST:$DATABASE_PORT..."
  # wait for the db to be ready
  while ! nc -z "$DATABASE_HOST" "${DATABASE_PORT:-5432}"; do
    sleep 1
  done
fi

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput || true

exec "$@"
