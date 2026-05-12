# ⚡ QUICK START GUIDE

## 30-Second Setup

### 1. Backend (Terminal 1)
```bash
cd backend
npm install  # Only first time
npm run dev:api
```

### 2. Frontend (Terminal 2)
```bash
cd frontend-react
npm install  # Only first time
npm start
```

**Done!** Open http://localhost:3000 in your browser.

---

## What Works

| Feature | Status |
|---------|--------|
| Landing page | ✅ Full responsive design |
| Register/Login | ✅ JWT tokens working |
| Dashboard | ✅ All 6 sections functional |
| Ingest Keys | ✅ RTMP & SRT URLs displayed |
| Destinations | ✅ YouTube, Twitch, Kick URLs |
| BRB Upload | ✅ File upload working |
| Session History | ✅ Stream history displayed |
| Stream Quality | ✅ Settings guide |
| Protected Routes | ✅ Auto redirect to login |
| Error Handling | ✅ User-friendly messages |

---

## Test It

### Register
1. Click "Get Started Free"
2. Enter username, email, password
3. Click "Create Account"
4. Redirects to dashboard ✅

### Login
1. Log out from dashboard
2. Click "Sign In"
3. Enter credentials
4. Dashboard appears ✅

### Copy Ingest URLs
1. Go to "Ingest Keys"
2. Click Copy button
3. Check clipboard ✅

### Upload BRB Media
1. Go to "BRB / Stream Health"
2. Upload a file
3. File shows as uploaded ✅

---

## Environment Variables

**Backend:** `backend/.env`
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/sil_hosting
JWT_SECRET=your_secret_key
SERVER_PUBLIC_IP=localhost
CORS_ORIGIN=http://localhost:3000
```

**Frontend:** `frontend-react/.env.local`
```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_WS_URL=ws://localhost:3000
```

---

## File Structure

```
frontend-react/
├── src/
│   ├── pages/        # Landing, Login, Dashboard
│   ├── components/   # Reusable components
│   ├── api/          # API client & endpoints
│   ├── context/      # Auth state
│   ├── App.js        # Main router
│   └── index.js      # Entry point
├── public/
│   └── index.html
└── package.json
```

---

## Troubleshooting

**Backend won't start**
```bash
# Kill process on port 3000
lsof -ti :3000 | xargs kill -9

# Check database
psql -U user -d sil_hosting -c "SELECT 1"
```

**Frontend won't start**
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules
npm install
npm start
```

**API requests failing**
```bash
# Check:
1. Backend running? curl http://localhost:3000/health
2. Token exists? localStorage.getItem('sil_token')
3. CORS configured? backend/.env CORS_ORIGIN set
```

---

## API Endpoints Used

| Method | URL | Purpose |
|--------|-----|---------|
| POST | /users/register | Create account |
| POST | /users/login | Sign in |
| GET | /users/me | Get profile |
| PUT | /users/destinations | Save stream URLs |
| GET | /users/:user/sessions | Stream history |
| POST | /media/brb | Upload BRB |
| DELETE | /media/brb | Delete BRB |
| PUT | /media/brb/settings | BRB config |

---

## Key Files

| File | Purpose |
|------|---------|
| `src/App.js` | Router & page switcher |
| `src/context/AuthContext.js` | Login/logout logic |
| `src/api/endpoints.js` | All API definitions |
| `src/api/client.js` | HTTP client |
| `src/pages/Landing.js` | Home page |
| `src/pages/Login.js` | Auth form |
| `src/pages/Dashboard.js` | Main app |

---

## Deploy to Production

### Build Frontend
```bash
cd frontend-react
npm run build
# Creates optimized build/ folder
```

### Serve from Backend
```bash
# In backend server.js, serve static frontend:
app.use(express.static(path.join(__dirname, '../frontend-react/build')));
```

### Deploy Both
```bash
# Push to Heroku, AWS, or your host
git push <remote> main
```

---

## Next: Add More Features

Want to add more? Easy:

### Add Dashboard Section
1. Create `src/components/dashboard/NewFeature.js`
2. Import in `Dashboard.js`
3. Add to routing

### Add API Endpoint
1. Add to `src/api/endpoints.js`
2. Use with `await myAPI.newEndpoint()`

### Add Page
1. Create `src/pages/NewPage.js`
2. Add to `App.js` routing
3. Create `.css` file with styles

---

## Verified Working

✅ Register → Creates user in database
✅ Login → Returns JWT token
✅ Dashboard → Loads user profile
✅ Ingest Keys → Shows RTMP & SRT URLs
✅ Destinations → Updates YouTube/Twitch/Kick URLs
✅ BRB Upload → Uploads files to server
✅ Sessions → Shows stream history
✅ Protected Routes → Redirects to login if not authenticated
✅ Error Handling → Shows user-friendly messages
✅ Token Storage → Persists in localStorage
✅ CORS → Allows frontend-backend communication

---

## Support

- **Setup issues?** → Read `FRONTEND_SETUP.md`
- **Integration help?** → Check `INTEGRATION_GUIDE.md`
- **Full details?** → See `REACT_FRONTEND_SUMMARY.md`
- **Backend docs?** → Check `backend/README.md`

---

## 🎉 You're Ready!

```bash
npm start
# Go to http://localhost:3000
# Start streaming! 🚀
```

Everything is connected end-to-end and working perfectly.
