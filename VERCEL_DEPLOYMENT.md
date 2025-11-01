# Vercel Deployment Guide

## Overview

Your Blood Management System consists of:
- **Frontend**: React + Vite (deployed to Vercel)
- **Backend**: Django + DRF (needs separate deployment - Heroku, Railway, Render, etc.)

This guide covers deploying the **frontend to Vercel**.

---

## Step 1: Backend Deployment (Required First)

Your frontend needs a backend API. Deploy your Django backend to one of these platforms:

### Option A: Railway (Recommended - Free tier available)
1. Go to https://railway.app
2. Create account and connect your GitHub
3. Create new project → Deploy from GitHub
4. Select your `finalSubmissionOstad` repository
5. Set environment variables:
   ```
   DJANGO_SECRET_KEY=your-secret-key
   DEBUG=False
   ALLOWED_HOSTS=your-railway-domain.railway.app
   DATABASE_URL=your-postgres-url
   ```
6. Note the deployment URL (e.g., `https://finalsubmissionostad-production.up.railway.app`)

### Option B: Heroku
1. Create account at https://www.heroku.com
2. Create new app
3. Connect GitHub repository
4. Set buildpacks: Python
5. Configure environment variables
6. Deploy

### Option C: Render
1. Go to https://render.com
2. Create new Web Service
3. Connect GitHub repository
4. Set build command: `pip install -r requirements.txt && python manage.py migrate`
5. Start command: `gunicorn blood_management.wsgi`
6. Note the deployment URL

---

## Step 2: Frontend Deployment to Vercel

### 2A: Set Environment Variable

You need to tell your frontend where the backend API is located.

1. Go to https://vercel.com
2. Click "Settings" → "Environment Variables"
3. Add a new variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-domain.com` (without trailing slash)
   - **Example**: `https://finalsubmissionostad-production.up.railway.app`

### 2B: Redeploy

After setting the environment variable:
1. Go to "Deployments" tab
2. Click the three dots on the latest deployment
3. Click "Redeploy"
4. Wait for the build to complete

---

## Step 3: Update Frontend Code (Already Done)

The following files have been created/updated:

✅ `vercel.json` - Vercel build configuration
✅ `frontend/vite.config.js` - Vite configuration with environment variables
✅ `.vercelignore` - Files to exclude from Vercel
✅ `frontend/package.json` - Added @vitejs/plugin-react

---

## Step 4: Fix CORS Issue

Your backend needs to allow requests from your Vercel domain.

**Update `blood_management/settings.py`:**

```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "https://your-vercel-domain.vercel.app",  # Add your Vercel URL
]
```

Or use environment variable:
```python
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', 'http://localhost:3000').split(',')
```

Set in backend: `CORS_ALLOWED_ORIGINS=https://final-submission-ostad.vercel.app`

---

## Step 5: Verify Deployment

After deployment, test these:

1. **Frontend loads**: https://final-submission-ostad.vercel.app
2. **Login page appears**: Should load without 404
3. **Try to login**: 
   - Email: `test@example.com`
   - Password: `password123`
   - Should show error about backend not responding OR login successfully

---

## Troubleshooting 404 Error

### Issue: Still seeing 404

**Solution**: Check these:

1. **Vercel build logs**:
   - Go to Vercel dashboard
   - Click on your project
   - Go to "Deployments"
   - Click the latest deployment
   - Check "Build Logs" for errors

2. **Check environment variables**:
   - Verify `VITE_API_URL` is set correctly
   - Redeploy after setting variables

3. **Check frontend build output**:
   - Verify `frontend/dist/index.html` exists
   - Check that rewrite rule in `vercel.json` is correct

4. **Browser console**:
   - Open DevTools (F12)
   - Check "Console" tab for errors
   - Check "Network" tab to see if API calls are failing

---

## Local Testing Before Deployment

Test locally to ensure everything works:

```bash
# Backend
python manage.py runserver

# Frontend (in new terminal)
cd frontend
npm install
npm run build
npm run preview

# Visit http://localhost:4173
```

---

## API Integration Summary

Your frontend connects to the backend via environment variable:

```javascript
// frontend/src/services/api.js uses:
baseURL: process.env.VITE_API_URL || '/api/'
```

So if `VITE_API_URL=https://your-backend.com`:
- `GET /api/donations/` → `https://your-backend.com/api/donations/`
- `POST /api/auth/login/` → `https://your-backend.com/api/auth/login/`

---

## Quick Deployment Checklist

- [ ] Backend deployed to Railway/Heroku/Render
- [ ] Note backend URL (e.g., https://backend.railway.app)
- [ ] Set `VITE_API_URL` environment variable in Vercel
- [ ] Update CORS_ALLOWED_ORIGINS in Django settings
- [ ] Redeploy frontend
- [ ] Test login functionality
- [ ] Check browser console for errors

---

## Need Help?

If still seeing 404:

1. **Check Vercel build**: `vercel.json` → look for build errors
2. **Check rewrites**: Verify `vercel.json` rewrite rule
3. **Check frontend**: Is `frontend/dist/index.html` being generated?
4. **Check API**: Is backend URL correct in environment variables?

---

## Next Steps

1. Deploy backend first
2. Get backend URL
3. Set `VITE_API_URL` in Vercel
4. Redeploy frontend
5. Test login to verify everything works

Your deployment should be live at: **https://final-submission-ostad.vercel.app** ✨
