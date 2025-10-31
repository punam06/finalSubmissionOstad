# Blood Management System (Django + DRF)

This repository contains a minimal Django + Django REST Framework implementation for a Blood Management System final assignment. It includes models for users, donor profiles, blood banks, requests, and donations, plus DRF viewsets and JWT authentication.

Quick start (macOS / zsh):

1. Create and activate virtualenv

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies

```bash
pip install -r requirements.txt
```

3. Run migrations and create a superuser

```bash
python manage.py migrate
python manage.py createsuperuser
```

4. Run development server

```bash
python manage.py runserver
```

## Running tests

Local (recommended in a virtualenv):

- python3 -m venv .venv
- source .venv/bin/activate
- pip install -r requirements.txt
- python manage.py migrate
- python manage.py test core -v 2

CI: A GitHub Actions workflow is included at `.github/workflows/ci.yml` which runs the core test suite on push and pull requests to `main`.

<!-- ci-trigger: small non-functional update to trigger CI -->

## Docker / quick local deploy

You can run the app locally with Docker and Postgres using the provided docker-compose. Copy `.env.example` to `.env` and update values (especially `SECRET_KEY` and DB passwords) before running.

Start the app:

```bash
cp .env.example .env
# edit .env to set SECRET_KEY and passwords
docker-compose up --build
```

The Django app will be available on http://localhost:8000. The compose setup runs Postgres and the Django app; the entrypoint runs migrations and collects static files on container start.

For production you'd want to set `DEBUG=0`, use a managed Postgres, configure a proper `ALLOWED_HOSTS` value, secure the `SECRET_KEY`, and configure static/media hosting (S3) and an SMTP provider for emails.

5. API endpoints (example):

- POST /api/auth/register/  -> register (username, email, password, role)
- POST /api/auth/login/     -> obtain JWT (username & password)
- POST /api/auth/token/refresh/ -> refresh token
- /api/users/               -> list users (auth required)
- /api/donor-profiles/      -> donor profile CRUD
- /api/blood-requests/      -> make blood requests
- /api/donations/           -> donation requests

Notes / next steps:
- This is a minimal starting point. You should add frontend (React or Django templates), thorough validation, tests, and optional features like email notifications, analytics, and deployment.
- To persist blacklisted JWTs on logout, install and configure the token blacklist app from SimpleJWT (not included by default here).

