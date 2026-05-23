---
description: "Deployment and feature-log instructions for the SIL frontend and backend"
applyTo:
  - "frontend-react/**"
  - "backend/**"
  - "GOOGLE_CLOUD_RUN_BACKEND.md"
  - "README.md"
---

# SIL Deployment Log and Working Instructions

Use this file as the operating guide for future AI agents working on the frontend, backend, or deployment flow for this workspace.

## 1) Current Environment Identity

- Local machine user: `vishaljha`
- Local machine hostname: `vishals-MacBook-Air`
- Active Google Cloud account: `rahuljha93102@gmail.com`
- Active Google Cloud project: `hosting-484414`
- Project number used by Cloud Run and Secret Manager bindings: `308720634926`

## 2) Deployed Services

### Frontend
- Cloud Run service name: `sil-frontend`
- Current URL: `https://sil-frontend-308720634926.us-central1.run.app`
- Purpose: React dashboard and login experience
- Behavior: Serves the app shell and proxies `/api/*` and `/ws` to the backend

### Backend
- Cloud Run service name: `sil-api`
- Current URL: `https://sil-api-308720634926.us-central1.run.app`
- Purpose: Express API, WebSocket support, auth, dashboard data, ingest control plane
- Important: This service must remain publicly invokable so the frontend proxy can reach it

### Database
- Cloud SQL instance name: `sil-postgres`
- Cloud SQL connection name: `hosting-484414:us-central1:sil-postgres`
- Database name: `sil_hosting`
- Database user: `sil_app`
- Database engine: PostgreSQL 15
- Host access method in production: Cloud Run Cloud SQL attachment, not a local socket

### RTMP Ingest Host
- Compute Engine VM name: `sil-ingest-vm`
- Public IP: `34.46.51.228`
- Purpose: RTMP/SRT ingest endpoint for OBS and encoder clients
- Host behavior: runs `nginx-rtmp` in Docker and exposes the public RTMP ingest port `1935`

## 3) Secrets and Runtime Identity

### Secret Manager entries
- `sil-database-url` stores the database password only
- `sil-database-url-full` stores the full socket-based Postgres URL used by Cloud Run
- `sil-jwt-secret` stores the JWT signing secret
- `sil-admin-secret` stores the admin secret
- `sil-server-public-ip` stores the public ingest host or IP used in RTMP/SRT URLs; it currently points to `34.46.51.228`

### Runtime service account
- Cloud Run revision service account: `308720634926-compute@developer.gserviceaccount.com`
- This service account needs `roles/secretmanager.secretAccessor` on the secrets above

## 4) Current Deployment Rules

- Deploy backend changes first when API, auth, schema, or dashboard data shapes change.
- Deploy frontend changes after backend changes when the UI depends on new API fields or response behavior.
- Do not use Cloud Run for RTMP or SRT ingest listeners.
- Keep ingest services on a separate VM, GKE service, or other non-Cloud-Run host.
- Keep `sil-database-url` as a password secret only; do not repurpose it as a full connection string.
- Keep `sil-database-url-full` as the Cloud Run connection string secret.
- The dashboard no longer includes a BRB / Health section; do not re-add `BRBHealth` or BRB settings cards unless the user explicitly requests the feature back.
- The login and registration routes are intentionally exempt from the API rate limiter so Cloud Run users do not get false `429` responses on `/api/users/login`.
- The profile route `/api/users/me` is also exempt from the API rate limiter; the dashboard should not reintroduce duplicate profile fetches that cause repeated requests.
- The dashboard sidebar should not render a brand image block; do not bring back the old tower icon, the logo image, or the extra "Second Chat" text in the brand block.
- The configured platform tiles in the sidebar should be compact text chips with a small status indicator; do not render large platform logo images in the sidebar.
- The stream keys page should show soft placeholder text for empty ingest fields, and the back button should stay in the top header row instead of duplicating the section title.
 - The Destinations UI accepts either full platform ingest URLs or platform stream keys. If a stream key is provided, the frontend will construct the standard platform ingest URL (YouTube, Twitch, Kick) and save it to the backend.
- Stream key creation is verified during registration; `/api/users/register` returns `stream_key`, `rtmp_server`, `rtmp_stream_key`, `rtmp_ingest`, and `srt_ingest` values that point at the RTMP ingest VM.
- The Stream Keys page should populate from the authenticated profile immediately when available, fall back to the cached registration payload for new users, and show the OBS Studio connection instructions with the RTMP server `rtmp://34.46.51.228:1935/live`.
- Update this file whenever service names, URLs, project IDs, secrets, or runtime service accounts change.

## 5) Backend Deployment Steps

Use this sequence for backend updates:

1. Make the API or schema change in `backend/`.
2. Validate syntax locally before deployment.
   - Typical checks: `node -c backend/server.js`, `node -c backend/routes/users.js`
3. If the schema changed, apply the SQL migration or schema update to Cloud SQL first.
4. Build and deploy the backend from source to Cloud Run.
5. Attach the Cloud SQL instance using `--add-cloudsql-instances hosting-484414:us-central1:sil-postgres`.
6. Set production environment variables:
   - `NODE_ENV=production`
   - `CORS_ORIGIN=*` or the locked-down frontend origin
   - `DATABASE_URL=sil-database-url-full:latest`
   - `JWT_SECRET=sil-jwt-secret:latest`
   - `ADMIN_SECRET=sil-admin-secret:latest`
   - `SERVER_PUBLIC_IP=sil-server-public-ip:latest`
7. Verify `/health` returns `200`.
8. Verify `POST /api/users/login` returns `401` for invalid credentials and `200` for valid credentials.

### Backend deployment command shape

```bash
gcloud run deploy sil-api \
  --project hosting-484414 \
  --source backend \
  --region us-central1 \
  --allow-unauthenticated \
  --add-cloudsql-instances hosting-484414:us-central1:sil-postgres \
  --set-env-vars NODE_ENV=production,CORS_ORIGIN='*' \
  --set-secrets DATABASE_URL=sil-database-url-full:latest,JWT_SECRET=sil-jwt-secret:latest,ADMIN_SECRET=sil-admin-secret:latest,SERVER_PUBLIC_IP=sil-server-public-ip:latest
```

## 6) Frontend Deployment Steps

Use this sequence for frontend updates:

1. Make the UI change in `frontend-react/`.
2. Build the app locally before deployment.
3. Deploy the frontend Cloud Run service after the backend is confirmed healthy.
4. Confirm the frontend still serves the login page and dashboard shell.
5. Confirm the frontend proxy forwards `/api/users/login` to the backend and gets `401` or `200`, not `429` or `500`.

### Frontend deployment expectations
- The React app should call the deployed Cloud Run backend directly in the browser when running in production.
- Local development should continue to use `http://localhost:3000/api`.
- `/api` and `/ws` may still be proxied by the frontend container for compatibility, but the browser-facing API base should point at the backend service.
- `/health` should continue returning a simple service status response.

## 7) Real-Time Change Workflow

When AI agents implement a real-time feature, follow this order:

1. Update backend models, routes, or query shapes first.
2. Update frontend components to consume the new backend shape.
3. Rebuild the frontend.
4. Redeploy backend.
5. Redeploy frontend.
6. Validate the live hosted URLs, not only local dev.

### Required validation routes
- Frontend login page: `/login`
- Frontend health: `/health`
- Backend health: `/health`
- Login test: `POST /api/users/login`
- Dashboard/profile test: authenticated `/api/users/me`

## 8) Working Constraints for This Instance

- Do not assume the Cloud Run frontend can host RTMP or SRT listeners.
- Do not remove the Cloud SQL attachment from the backend service.
- Do not replace the database secret chain without updating the backend deployment and this file.
- Do not introduce hard-coded dashboard metrics when the backend already provides live values.
- Do not restore removed promotional or fake analytics widgets unless explicitly requested.
- Keep real-time data source of truth in the backend, not in mock frontend state.

## 9) Known Stable Backend/Frontend Behavior

- Backend login failures now return `401`, not `429` or `500`, when credentials are invalid.
- The frontend proxy reaches the backend service successfully.
- The backend is backed by Cloud SQL PostgreSQL in the hosting project.
- The frontend login page no longer shows the removed terms/footer or system-online badge.
- The dashboard should continue to prefer backend-derived values over static placeholders.
- The dashboard sidebar no longer renders a brand image block; keep the top of the sidebar clear above the status card.
- The stream keys inputs are read-only display fields with subdued placeholder copy when empty.

## 10) Feature Log for Future AI Agents

Use this backlog as the working record for future features.

### Priority A: Live stream state
- Goal: show real live/offline status from the backend only.
- Acceptance: dashboard status changes only when backend stream state changes.
- Avoid: fake timers, fake uptime, or client-only stream state simulation.

### Priority A: Session and history accuracy
- Goal: keep sessions, durations, and ingest type values synchronized with backend data.
- Acceptance: session cards and totals match the records returned by `/api/users/me` and session endpoints.
- Avoid: static session counts or hard-coded demo history.

### Priority A: Ingest key management
- Goal: preserve real stream key, RTMP ingest, and SRT ingest management from the backend.
- Acceptance: regenerate key, copy ingest URL, and save destination settings all call the API.
- Avoid: exposing placeholder keys or copy-only mock controls.

### Priority B: BRB and health controls
- Goal: keep BRB settings, health, and recovery state backend-driven.
- Acceptance: BRB toggle, timeout, and media path reflect actual persisted settings.
- Avoid: fake uptime and synthetic health charts.

### Priority B: Dashboard cleanup
- Goal: remove remaining static promotional metrics and one-off demo copy.
- Acceptance: any metric on the dashboard can be traced to a backend field or a deliberate marketing page.
- Avoid: follower/revenue/view count placeholders unless the user explicitly wants them.

### Priority C: Deployment hygiene
- Goal: keep this file current whenever infrastructure changes.
- Acceptance: service URLs, project IDs, secrets, and account identities are always updated after redeployments.
- Avoid: stale docs that refer to old revisions, old Cloud Run URLs, or deprecated secrets.

## 11) What To Check Before Shipping

Before closing any frontend or backend change, confirm:

- The correct Google Cloud project is active: `hosting-484414`
- The active user is still the expected Google account
- The backend health endpoint returns success
- The frontend login route loads successfully
- The frontend login request reaches the backend and returns the expected auth response
- The Cloud SQL-backed schema still matches the deployed API
- No new hard-coded dashboard counters or fake streaming timers were introduced

## 12) Update Rule

If an AI agent changes any of the following, update this file in the same task:

- Cloud Run service name or URL
- Cloud SQL instance or database name
- Secret Manager secret names
- Runtime service account
- Authentication flow
- Frontend proxy behavior
- Any deployment command or required verification step
