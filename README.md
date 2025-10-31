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

