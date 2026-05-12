# Complete Setup & Integration Guide

## Overview

This document explains how to run the complete SIL IRL Hosting Platform with the React frontend and Node.js backend.

---

## Prerequisites

- **Node.js**: v16+ ([Download](https://nodejs.org))
- **Docker**: (Optional, for MediaMTX & nginx-rtmp)
- **PostgreSQL**: For the database

---

## Backend Setup

### 1. Install Backend Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

Create `backend/.env`:

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/sil_hosting
JWT_SECRET=your_jwt_secret_key_here_change_this
SERVER_PUBLIC_IP=localhost
CORS_ORIGIN=http://localhost:3000
```

### 3. Initialize Database

```bash
# Run migrations
npm run db:migrate

# Check migration status
npm run db:migrate:status
```

### 4. Start Backend

```bash
# Development (with auto-reload)
npm run dev:api

# Production
npm start
```

Backend will run on `http://localhost:3000`

---

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend-react
npm install
```

### 2. Configure Environment

Create `frontend-react/.env.local`:

```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_WS_URL=ws://localhost:3000
```

### 3. Start React Development Server

```bash
npm start
```

Frontend will open at `http://localhost:3000` in your browser with hot reload.

---

## Running Everything Together

### Option 1: Two Terminal Windows (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev:api
```

**Terminal 2 - Frontend:**
```bash
cd frontend-react
npm start
```

### Option 2: Using Docker Compose

```bash
# From project root
docker-compose up
```

This will start:
- PostgreSQL database
- Node.js backend API
- React frontend dev server
- MediaMTX (streaming server)
- nginx-rtmp (fallback RTMP)

---

## Testing End-to-End Integration

### 1. Test Registration

1. Navigate to `http://localhost:3000`
2. Click "Get Started Free"
3. Fill in username, email, password
4. Click "Create Account"
5. You'll be redirected to `/dashboard`

**What happens:**
- ✅ React sends `POST /api/users/register` to backend
- ✅ Backend creates user in PostgreSQL
- ✅ Backend returns JWT token
- ✅ React stores token in localStorage
- ✅ React redirects to protected dashboard route
- ✅ Dashboard loads user profile automatically

### 2. Test Login

1. Log out (click "Sign Out" in dashboard)
2. Click "Sign In"
3. Enter username and password
4. Click "Sign In"

**What happens:**
- ✅ React sends `POST /api/users/login` to backend
- ✅ Backend validates credentials
- ✅ Backend issues JWT token
- ✅ React stores token and redirects to dashboard

### 3. Test Dashboard Sections

**Overview:**
- View stream status (live/offline)
- See plan type
- Total stream hours
- Toggle platforms

**Ingest Keys:**
- Copy stream key
- Copy RTMP URL
- Copy SRT URL

**Destinations:**
- Enter YouTube URL
- Enter Twitch URL
- Enter Kick URL
- Save and backend updates user

**Sessions:**
- View stream history
- See session duration
- View ingest type (SRT/RTMP)

**BRB / Health:**
- Upload BRB media file
- Toggle BRB enabled
- Set timeout
- View health metrics

**Stream Quality:**
- View recommended settings
- See network requirements

### 4. Test Protected Routes

1. In browser devtools, run: `localStorage.clear()`
2. Go to `http://localhost:3000/dashboard`
3. You should be redirected to `/login`

**What happens:**
- ✅ ProtectedRoute component checks `isAuthenticated`
- ✅ No token found in localStorage
- ✅ User redirected to login page

### 5. Test API Error Handling

1. Stop the backend server
2. Try to navigate in the dashboard or register/login
3. You should see error messages

**What happens:**
- ✅ React catches API errors
- ✅ Error messages displayed to user
- ✅ 401 responses trigger logout and redirect to login

---

## API Endpoints Tested

### Authentication
- ✅ `POST /api/users/register` - Create account
- ✅ `POST /api/users/login` - Login
- ✅ `GET /api/users/me` - Get current user
- ✅ `GET /api/users/:username` - Get public profile

### User Data
- ✅ `PUT /api/users/destinations` - Update streaming URLs
- ✅ `POST /api/users/regenerate-key` - Roll stream key
- ✅ `GET /api/users/:username/sessions` - Stream history

### Media
- ✅ `POST /api/media/brb` - Upload BRB file
- ✅ `DELETE /api/media/brb` - Delete BRB file
- ✅ `GET /api/media/brb/info` - Get BRB info
- ✅ `PUT /api/media/brb/settings` - Update BRB settings

---

## Project Structure

```
Stream-Hosting-Platform/
├── backend/                    # Node.js / Express API
│   ├── routes/                # API endpoints
│   ├── services/              # Business logic
│   ├── middleware/            # Auth, validation
│   ├── db/                    # Database & migrations
│   ├── server.js              # Main app entry
│   ├── package.json
│   └── .env
│
├── frontend-react/             # React SPA
│   ├── src/
│   │   ├── api/               # API client & endpoints
│   │   ├── context/           # Auth state management
│   │   ├── pages/             # Page components
│   │   ├── components/        # Reusable components
│   │   ├── App.js             # Main app
│   │   └── index.js           # Entry point
│   ├── public/
│   ├── package.json
│   └── .env.local
│
├── configs/                    # MediaMTX, nginx configs
├── docker-compose.yml          # Docker setup
└── README.md
```

---

## Troubleshooting

### "Cannot connect to backend"

1. Check backend is running: `http://localhost:3000/health`
2. Verify `REACT_APP_API_URL` in `.env.local`
3. Check CORS is enabled in backend `.env`

```bash
# Backend .env
CORS_ORIGIN=http://localhost:3000
```

### "Database connection failed"

1. Check PostgreSQL is running
2. Verify `DATABASE_URL` in backend `.env`
3. Run migrations: `npm run db:migrate`

### "Token not being sent in requests"

Token is automatically included if:
1. ✅ Token is in localStorage under key `sil_token`
2. ✅ API client includes Authorization header (it does)
3. ✅ Backend validates JWT with `requireAuth` middleware

### "Redirect loop on login"

1. Check token is being stored: `localStorage.getItem('sil_token')`
2. Check backend is issuing valid JWT
3. Check token not expired: `JWT_SECRET` matches between frontend and backend

### React showing "Loading..." forever

1. Check browser console for errors
2. Check if backend API is responding
3. Try logging out: `localStorage.clear()`

---

## Production Deployment

### Frontend Build

```bash
cd frontend-react
npm run build
```

This creates optimized build in `build/` directory.

### Serve React from Backend

```bash
# In backend, serve built React app
const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(path.join(__dirname, '../frontend-react/build')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend-react/build/index.html'));
});
```

### Docker Production Setup

```bash
docker-compose -f docker-compose.prod.yml up
```

---

## Performance Optimization

### Frontend
- ✅ Code splitting with React Router
- ✅ Lazy loading of dashboard sections
- ✅ Production build minification
- ✅ Gzip compression enabled

### Backend
- ✅ Connection pooling for database
- ✅ Rate limiting on API endpoints
- ✅ JWT token caching
- ✅ WebSocket for real-time updates

---

## Next Steps

1. **Add WebSocket Support** for real-time stream status
2. **Implement Admin Panel** for user management
3. **Add Webhook Integration** for platform callbacks
4. **Setup CI/CD Pipeline** with GitHub Actions
5. **Configure CDN** for media delivery

---

## Support

For issues or questions:
1. Check backend logs: `backend/logs/`
2. Check browser console: DevTools → Console
3. Check API responses: DevTools → Network
4. Check React devtools extension

Happy streaming! 🚀
