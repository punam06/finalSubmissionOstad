# Blood Management System - Project Summary

## Overview
A full-stack blood donation management system built with Django REST Framework (backend) and React (frontend) with CI/CD pipeline and Docker containerization.

## Backend Architecture
- **Framework**: Django 4.2 + Django REST Framework
- **Authentication**: JWT (SimpleJWT)
- **Database**: SQLite (development), PostgreSQL (production via Docker)
- **Key Models**:
  - `User`: Custom user model with roles (admin, donor, hospital)
  - `DonorProfile`: Donor information with blood group and photo
  - `BloodBank`: Tracks blood units by type
  - `BloodRequest`: Request for blood donations
  - `Donation`: Track blood donations by donors

## Backend Features
- ✅ JWT authentication with token refresh
- ✅ Donor profile creation and management
- ✅ Blood bank inventory tracking (8 blood types)
- ✅ Blood request workflow (pending → approved/rejected)
- ✅ Donation approval workflow with email notifications
- ✅ Atomic database operations for concurrent safety (F expressions)
- ✅ Email utilities for notifications
- ✅ API versioning with DRF viewsets

## Frontend Architecture
- **Framework**: React 18 + Vite
- **Styling**: Bootstrap 5
- **HTTP Client**: Axios with token refresh interceptor
- **State Management**: React Context (Toast, Auth)
- **Testing**: Vitest + React Testing Library

## Frontend Features
- ✅ Authentication (Register/Login) with role-based redirect
- ✅ Donor profile creation with image upload
- ✅ Blood donation submission
- ✅ Blood request system
- ✅ Admin dashboard for approving requests/donations
- ✅ Global toast notification system
- ✅ Modal confirmation dialogs
- ✅ Client-side form validation
- ✅ Loading states and error handling

## CI/CD Pipeline
- **Platform**: GitHub Actions
- **Triggers**: Push to `main`, Pull Requests
- **Jobs**:
  - **backend-tests**: Python 3.11 testing with Django test suite
  - **frontend-tests**: Node.js 18 with Vitest + build
  - **publish-image**: Docker image build and push to GHCR

## DevOps
- **Docker**: Multi-stage build for production
- **docker-compose**: Local development with Postgres
- **Deployment**: GitHub Container Registry (GHCR)
- **Dependency Management**: Dependabot configured for pip & npm

## Testing
### Backend Tests
- User registration and login flow
- Duplicate donor profile prevention
- Donation approval with bank unit increment and email
- Blood request approval with bank unit decrement

### Frontend Tests
- Register form validation
- Admin request approval modal flow
- Admin donation approval modal flow

## Environment Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (optional)

### Backend
```bash
cd blood_management
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Docker
```bash
docker-compose up
```

## API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/user/me/` - Current user info

### Donor Profiles
- `POST /api/donor-profiles/` - Create profile
- `GET /api/donor-profiles/` - List profiles
- `GET/PUT/DELETE /api/donor-profiles/{id}/` - Detail operations

### Blood Requests
- `POST /api/blood-requests/` - Create request
- `GET /api/blood-requests/` - List requests
- `POST /api/blood-requests/{id}/approve/` - Admin approval
- `POST /api/blood-requests/{id}/reject/` - Admin rejection

### Donations
- `POST /api/donations/` - Submit donation
- `GET /api/donations/` - List donations
- `POST /api/donations/{id}/approve/` - Admin approval
- `POST /api/donations/{id}/reject/` - Admin rejection

### Blood Bank
- `GET /api/blood-banks/` - List all banks
- `GET /api/blood-banks/{id}/` - Bank details

## Key Technical Decisions

### Backend
1. **Atomic Transactions**: Used `transaction.atomic()` with `F()` expressions for concurrent-safe unit updates
2. **Custom User Model**: Allows role-based access control
3. **Email Notifications**: Locmem backend for tests, SMTP for production
4. **JWT Tokens**: Stateless auth with token blacklisting support

### Frontend
1. **Context API**: Lightweight state management for auth & toasts
2. **Axios Interceptors**: Automatic token refresh on 401
3. **Vitest**: Fast unit testing with ES modules
4. **Bootstrap**: Responsive UI without overhead

## Deployment Checklist
- [ ] Set environment variables in `.env`
- [ ] Configure database (Postgres recommended)
- [ ] Run migrations
- [ ] Collect static files
- [ ] Configure email backend
- [ ] Set SECRET_KEY in production
- [ ] Enable HTTPS
- [ ] Configure CORS for frontend domain
- [ ] Test Docker image locally

## Future Enhancements
- [ ] Blood compatibility checking algorithm
- [ ] Advanced inventory analytics
- [ ] SMS notifications
- [ ] Mobile app (React Native)
- [ ] Real-time updates (WebSockets)
- [ ] Kafka-based event streaming for critical operations
- [ ] Multi-language support
- [ ] Production logging & monitoring
- [ ] API rate limiting and throttling

## Support & Maintenance
- All tests must pass before merging to `main`
- Dependabot PRs should be reviewed weekly
- Docker images published automatically on successful CI
- Logs available in GitHub Actions artifacts

---

**Last Updated**: 2025-11-01
**Status**: Production Ready ✅
