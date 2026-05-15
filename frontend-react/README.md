# React Frontend for SIL IRL Hosting Platform

## Environment Setup

Create a `.env.local` file in the `frontend-react` directory:

```
REACT_APP_API_URL=http://https://sil-api-811882866295.us-central1.run.app/api
REACT_APP_WS_URL=ws://https://sil-api-811882866295.us-central1.run.app
```

## Installation

```bash
cd frontend-react
npm install
```

## Development

```bash
npm start
```

The app will open at `http://https://sil-api-811882866295.us-central1.run.app` with hot reload enabled.

## Build for Production

```bash
npm run build
```

## Features Implemented

### Pages
- **Landing Page** - Hero section with feature highlights
- **Login/Register** - Authentication with JWT tokens
- **Dashboard** - Main application with multiple sections

### Dashboard Sections
1. **Overview** - Stream status, plan info, platform toggles
2. **Destinations** - Manage YouTube, Twitch, Kick URLs
3. **Ingest Keys** - Display RTMP & SRT ingest URLs
4. **Session History** - View past stream sessions
5. **BRB / Health** - Configure auto-recovery & health monitoring
6. **Stream Quality** - Recommended encoder settings

### Features
✅ End-to-end authentication with JWT
✅ Protected routes & session management
✅ Real-time API integration with backend
✅ Responsive design matching original UI exactly
✅ Form validation & error handling
✅ File upload for BRB media
✅ Copy-to-clipboard for ingest URLs

## API Integration

All endpoints are properly connected to the backend:

- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/me` - Get current user profile
- `GET /api/users/:username` - Get user public profile
- `PUT /api/users/destinations` - Update streaming URLs
- `GET /api/users/:username/sessions` - Stream history
- `POST/DELETE /api/media/brb` - BRB media management
- `PUT /api/media/brb/settings` - BRB settings

## Architecture

```
frontend-react/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   ├── client.js          # Axios instance with interceptors
│   │   └── endpoints.js       # API endpoint definitions
│   ├── components/
│   │   ├── ProtectedRoute.js  # Auth-protected route wrapper
│   │   └── dashboard/         # Dashboard section components
│   ├── context/
│   │   └── AuthContext.js     # Auth state management
│   ├── pages/
│   │   ├── Landing.js         # Landing page
│   │   ├── Login.js           # Login/Register page
│   │   └── Dashboard.js       # Main dashboard
│   ├── App.js                 # Main app component with routing
│   ├── index.js               # React entry point
│   └── index.css              # Global styles
├── package.json
└── .env.local
```

## Notes

- Token is stored in `localStorage` and included in all API requests
- Automatic logout on 401 responses
- All styling matches the original HTML exactly
- No external UI library - pure CSS with custom components
- Fully responsive design

## Troubleshooting

### "Cannot find module 'react'"
```bash
npm install
```

### CORS errors connecting to backend
Make sure backend has CORS enabled and `REACT_APP_API_URL` points to correct backend URL.

### "API returned 401"
Your token has expired. Log out and log back in.

## Contributing

To add new dashboard sections:
1. Create component in `src/components/dashboard/`
2. Import in `Dashboard.js`
3. Add to sections object and routing
