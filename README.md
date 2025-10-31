# Blood Management System (Django + DRF)

This repository contains a minimal Django + Django REST Framework implementation for a Blood Management System final assignment. It includes models for users, donor profiles, blood banks, requests, and donations, plus DRF viewsets and JWT authentication.

Quick start (macOS / zsh)

1) Create and activate a virtual environment

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2) Install dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

3) Run migrations and create a superuser

```bash
python manage.py migrate
python manage.py createsuperuser
```

4) Run development server

```bash
python manage.py runserver
```
## Running tests

Local (recommended in a virtualenv):

1. Create and activate a virtualenv (if not already active)

```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies and run migrations

```bash
pip install -r requirements.txt
python manage.py migrate
```

3. Run the test suite (backend)

```bash
python manage.py test core -v2
```

CI: A GitHub Actions workflow is included at `.github/workflows/ci.yml` which runs the core test suite on push and pull requests to `main`. The workflow now uploads a `backend-test-logs` artifact when backend tests run so you can download the raw test output from the Actions run if something fails.

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

## Frontend (development)

The repository includes a Vite React frontend under `frontend/`. To run the frontend locally:

```bash
cd frontend
npm ci
npm run dev
```

The frontend expects the API to be available at the same host or configured via the `VITE_API_URL` environment variable in development.

## CI logs & artifacts

If CI fails on GitHub Actions, you can download the backend test log artifact (uploaded by the workflow) from the run page:

- Actions → choose the failing run → Jobs → click the job → Artifacts → download `backend-test-logs`.

If you prefer the CLI and have `gh` installed:

```bash
gh run list --repo <owner>/<repo>
gh run download <run-id> --name backend-test-logs --repo <owner>/<repo>
```

Open the downloaded `backend-tests.log` and paste the failing traceback here if you want me to debug further.

## Dependabot

Dependabot is enabled (weekly) for both Python and the frontend `npm` dependencies and will open PRs to keep pinned packages up to date. Review and run CI on Dependabot PRs before merging.

## Notes / next steps
- Consider keeping `requirements.txt` pinned for CI stability and using Dependabot to open upgrade PRs.
- For production: set `DEBUG=False`, provide `DJANGO_SECRET_KEY` and proper `ALLOWED_HOSTS`, use managed database and object storage for static/media, and configure an SMTP provider for email delivery.

If you want, I can:
- Add `README` examples showing Docker image build & push to GitHub Container Registry.
- Add linting checks to CI (flake8 / eslint) and a coverage badge.

