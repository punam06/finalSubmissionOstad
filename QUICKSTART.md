# Quick Start Guide

## One-Command Local Setup

### Backend
```bash
python manage.py migrate && python manage.py runserver
```

### Frontend  
```bash
cd frontend && npm install && npm run dev
```

### Docker
```bash
docker-compose up
```

## Running Tests

### Backend
```bash
python manage.py test core -v 2
```

### Frontend
```bash
cd frontend && npm test
```

### All (CI)
```bash
# Backend
python -m pip freeze
python manage.py migrate --noinput
python manage.py test core -v 2

# Frontend
npm ci
npm run test
npm run build
```

## Key Files
- `blood_management/settings.py` - Django configuration
- `core/models.py` - Database models
- `core/views.py` - REST API viewsets
- `frontend/src/pages/` - React pages
- `frontend/package.json` - Frontend dependencies
- `.github/workflows/ci.yml` - CI/CD pipeline

## Default Credentials (Dev Only)
- Admin: `admin` / `adminpass`
- Donor: `donor1` / `donorpass`

## Troubleshooting

### Backend tests fail
1. Run migrations: `python manage.py migrate`
2. Clear cache: `find . -type d -name __pycache__ -exec rm -r {} +`
3. Reinstall: `pip install -r requirements.txt`

### Frontend won't start
1. Clear node_modules: `rm -rf frontend/node_modules`
2. Reinstall: `cd frontend && npm ci`

### Docker issues
1. Clean up: `docker-compose down -v`
2. Rebuild: `docker-compose up --build`

## Useful Commands

```bash
# Create superuser
python manage.py createsuperuser

# Django shell
python manage.py shell

# Make migrations
python manage.py makemigrations

# View migrations
python manage.py showmigrations

# Frontend linting
cd frontend && npm run lint

# Frontend build
cd frontend && npm run build
```

## Environment Variables
See `.env.example` for required variables.

---
For more details, see `PROJECT_SUMMARY.md`
