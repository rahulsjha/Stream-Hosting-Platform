# Complete Setup Instructions for React Frontend

## Quick Start (5 minutes)

### 1. Install Backend
```bash
cd backend
npm install
```

### 2. Create Backend .env
```bash
cat > backend/.env << 'EOF'
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/sil_hosting
JWT_SECRET=your_secret_key_here
SERVER_PUBLIC_IP=localhost
CORS_ORIGIN=http://https://sil-api-811882866295.us-central1.run.app
EOF
```

### 3. Install Frontend
```bash
cd frontend-react
npm install
```

### 4. Create Frontend .env
```bash
cat > frontend-react/.env.local << 'EOF'
REACT_APP_API_URL=http://https://sil-api-811882866295.us-central1.run.app/api
REACT_APP_WS_URL=ws://https://sil-api-811882866295.us-central1.run.app
EOF
```

### 5. Start Both (in separate terminals)

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

✅ Done! Open http://https://sil-api-811882866295.us-central1.run.app

---

## What's Implemented

### 🎨 UI/UX (100% matching original)
- ✅ Landing page with hero section
- ✅ Login/Register forms with validation
- ✅ Dashboard with sidebar navigation
- ✅ 6 dashboard sections
- ✅ Responsive design
- ✅ Custom cursor effects
- ✅ Animations & transitions

### 🔐 Authentication
- ✅ JWT token-based auth
- ✅ Automatic token refresh
- ✅ Protected routes
- ✅ Session persistence
- ✅ Auto logout on token expiry

### 🔗 Backend Integration
- ✅ User registration & login
- ✅ Profile management
- ✅ Stream destinations (YouTube/Twitch/Kick)
- ✅ Ingest keys & URLs
- ✅ Session history
- ✅ BRB media upload/delete
- ✅ Stream quality settings

### 📊 Real-time Features (Ready for WebSocket)
- ✅ Stream status updates
- ✅ Platform connectivity
- ✅ Health monitoring

---

## File Structure

```
frontend-react/
├── public/
│   └── index.html                 # HTML template
├── src/
│   ├── api/
│   │   ├── client.js              # Axios HTTP client
│   │   └── endpoints.js           # All API definitions
│   ├── components/
│   │   ├── ProtectedRoute.js      # Auth wrapper
│   │   └── dashboard/             # Dashboard sections
│   │       ├── Overview.js
│   │       ├── Destinations.js
│   │       ├── IngestKeys.js
│   │       ├── Sessions.js
│   │       ├── BRBHealth.js
│   │       └── Quality.js
│   ├── context/
│   │   └── AuthContext.js         # Auth state
│   ├── pages/
│   │   ├── Landing.js             # /
│   │   ├── Login.js               # /login
│   │   └── Dashboard.js           # /dashboard
│   ├── App.js                     # Main app
│   ├── App.css                    # App styles
│   ├── index.js                   # Entry point
│   └── index.css                  # Global styles
├── package.json
├── .env.example
├── .env.local                     # (Create this)
├── .gitignore
├── README.md
└── setup.sh
```

---

## Testing Each Section

### Register/Login
```bash
1. Go to http://https://sil-api-811882866295.us-central1.run.app
2. Click "Get Started Free" → Register with email/password
3. OR Click "Sign In" if already registered
4. Redirects to /dashboard
```

### Overview
```bash
1. In dashboard, click "Overview"
2. Shows: Status, Plan, Stream Hours
3. Platform toggles for YouTube/Twitch/Kick
```

### Ingest Keys
```bash
1. Click "Ingest Keys"
2. Shows: Stream Key, RTMP URL, SRT URL
3. Copy buttons for each
```

### Destinations
```bash
1. Click "Stream Destinations"
2. Enter YouTube/Twitch/Kick URLs
3. Click "Save Destinations"
```

### Session History
```bash
1. Click "Session History"
2. Shows past streams with duration & type
3. Status badge (LIVE/Offline)
```

### BRB/Health
```bash
1. Click "BRB / Stream Health"
2. Upload BRB media file
3. Toggle BRB enabled
4. Set timeout
5. View health metrics
```

### Stream Quality
```bash
1. Click "Stream Quality"
2. See recommended settings
3. View network requirements
```

---

## Debugging

### Check if Backend is Running
```bash
curl http://https://sil-api-811882866295.us-central1.run.app/health
# Should return: {"status":"online","version":"4.1.0","uptime":...}
```

### Check if Frontend is Running
```bash
# Open browser: http://https://sil-api-811882866295.us-central1.run.app
# Check DevTools Console for errors
```

### Check API Connection
```bash
# In browser console:
fetch('http://https://sil-api-811882866295.us-central1.run.app/api/users/me', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('sil_token') }
}).then(r => r.json()).then(console.log)
```

### Check Token Storage
```bash
# In browser console:
localStorage.getItem('sil_token')
localStorage.getItem('sil_username')
```

---

## Customization

### Change API URL
Edit `frontend-react/.env.local`:
```env
REACT_APP_API_URL=https://api.example.com
```

### Add New Dashboard Section
1. Create file: `src/components/dashboard/NewSection.js`
2. Edit `src/pages/Dashboard.js`:
```javascript
import NewSection from '../components/dashboard/NewSection';

// Add to sections object:
sections: {
  'new-section': { label: 'New Section', icon: 'fa-icon' },
}

// Add to rendering:
{activeSection === 'new-section' && <NewSection />}
```

### Change Colors/Theme
Edit `src/index.css` - CSS variables at top:
```css
:root {
  --red: #ff1744;
  --violet: #7c3aed;
  /* ... */
}
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "Cannot GET /" | Frontend not running, try `npm start` |
| "API is not responding" | Backend not running, try `npm run dev:api` |
| "401 Unauthorized" | Token expired, log out and log back in |
| "CORS error" | Backend CORS_ORIGIN not set correctly |
| "Page blank" | Check browser console for JS errors |
| "Form submission does nothing" | Check network tab for API errors |

---

## Scripts

### Development
```bash
cd frontend-react
npm start              # Start dev server
npm run build         # Build for production
npm run test          # Run tests (when added)
npm run eject         # Eject from CRA (one-way!)
```

### Backend
```bash
cd backend
npm run dev:api       # Start with auto-reload
npm run db:migrate    # Run migrations
npm start             # Production start
```

---

## Deployment

### Heroku
```bash
# Frontend
npm run build
# Deploy build/ folder

# Backend
git push heroku main
```

### AWS / Azure / DigitalOcean
```bash
# Build both
npm run build

# Create Docker image and deploy
docker build -t sil-frontend .
```

### Self-hosted
```bash
# Build frontend
npm run build

# Serve from backend
cp -r frontend-react/build/* backend/frontend/
```

---

## Support

- Check `INTEGRATION_GUIDE.md` for detailed setup
- Check `README.md` in each folder
- Check browser DevTools Console
- Check backend logs in `backend/logs/`

🚀 You're all set! Happy streaming!
