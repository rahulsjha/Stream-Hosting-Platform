# Google Cloud Run Frontend Deployment

This guide deploys the React frontend to Google Cloud Run as a static container.

The frontend container serves the React build on the Cloud Run URL and proxies `/api/*` and `/ws` to the backend Cloud Run service. That keeps the browser on one origin and avoids CORS issues in the app.

## Prerequisites

- The backend Cloud Run service is already deployed.
- `gcloud` is installed and authenticated.
- You know the backend service root URL, for example `https://sil-api-xxxxxx.uc.a.run.app`.

## 1. Deploy the frontend service

Run from the repository root:

```bash
export REGION=us-central1
export SERVICE_NAME=sil-frontend
export BACKEND_URL='https://YOUR-BACKEND-SERVICE-URL'

gcloud run deploy "$SERVICE_NAME" \
  --source frontend-react \
  --region "$REGION" \
  --allow-unauthenticated \
  --set-env-vars BACKEND_URL="$BACKEND_URL"
```

The Dockerfile in `frontend-react/` builds the React app and the Nginx template forwards API and WebSocket traffic to `BACKEND_URL`.

## 2. Verify the deployment

Get the frontend URL:

```bash
gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format='value(status.url)'
```

Open that URL in a browser and confirm the dashboard loads.

## 3. Optional backend note

Because the frontend proxies to the backend server-side, the browser does not need direct access to the backend URL. If you later remove the proxy and call the backend directly from the browser, update backend CORS to allow the frontend Cloud Run origin.