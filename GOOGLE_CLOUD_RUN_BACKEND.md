# Google Cloud Run Backend Deployment

This guide deploys the Node.js backend to Google Cloud Run as a standalone HTTP service.

Important limitation: Cloud Run only exposes HTTP/HTTPS on one container port. It cannot host the RTMP and SRT ingest listeners used by this platform on ports 1935 and 9999. The backend can run on Cloud Run, but the live ingest layer still needs a separate VM, GKE service, or another non-Cloud-Run host.

## What runs on Cloud Run

- Express API
- WebSocket dashboard connections
- Health endpoint
- JWT/auth/admin endpoints
- Database-backed control plane

## What does not run on Cloud Run

- RTMP ingest on port 1935
- SRT ingest on UDP port 9999
- Any service that needs custom inbound TCP/UDP ports

## Prerequisites

- A Google Cloud account with billing enabled
- `gcloud` installed and authenticated
- A PostgreSQL database, preferably Cloud SQL for PostgreSQL
- An external ingest host if you need RTMP/SRT publishing

## 1. Create a new Google Cloud project

Replace `YOUR_PROJECT_ID` with your own project id.

```bash
gcloud projects create YOUR_PROJECT_ID --name="SIL Hosting"
gcloud config set project YOUR_PROJECT_ID
```

If billing is not already attached, link the billing account in the Google Cloud console or with `gcloud billing projects link`.

## 2. Enable required APIs

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com \
  sqladmin.googleapis.com \
  secretmanager.googleapis.com
```

## 3. Create a Cloud SQL PostgreSQL instance

Adjust region, size, and password to your needs.

```bash
export REGION=us-central1
export DB_INSTANCE=sil-postgres
export DB_NAME=sil_hosting
export DB_USER=sil_app
export DB_PASSWORD='replace-with-a-long-random-password'

gcloud sql instances create "$DB_INSTANCE" \
  --database-version=POSTGRES_15 \
  --region="$REGION" \
  --cpu=2 \
  --memory=7680MiB \
  --storage-size=20GB

gcloud sql databases create "$DB_NAME" --instance="$DB_INSTANCE"
gcloud sql users create "$DB_USER" --instance="$DB_INSTANCE" --password="$DB_PASSWORD"
```

Record the instance connection name:

```bash
gcloud sql instances describe "$DB_INSTANCE" --format='value(connectionName)'
```

## 4. Create secrets

Store the sensitive values in Secret Manager.

```bash
export JWT_SECRET='replace-with-a-long-random-secret'
export ADMIN_SECRET='replace-with-another-long-random-secret'

echo -n "$DB_PASSWORD" | gcloud secrets create sil-db-password --data-file=-
echo -n "$JWT_SECRET" | gcloud secrets create sil-jwt-secret --data-file=-
echo -n "$ADMIN_SECRET" | gcloud secrets create sil-admin-secret --data-file=-
```

If the secrets already exist, use `gcloud secrets versions add` instead of `create`.

## 5. Build and deploy the backend image

The backend already has a Dockerfile in `backend/Dockerfile`. Deploy from source so Cloud Run uses that file automatically.

```bash
export SERVICE_NAME=sil-api
export IMAGE_REGION=us-central1
export CORS_ORIGIN='*'
export INGRESS_HOST='your-external-ingest-hostname-or-ip'
export INSTANCE_CONNECTION_NAME='YOUR_PROJECT_ID:us-central1:sil-postgres'

export DATABASE_URL="postgresql://sil_app:${DB_PASSWORD}@/sil_hosting?host=/cloudsql/${INSTANCE_CONNECTION_NAME}"

gcloud run deploy "$SERVICE_NAME" \
  --source backend \
  --region "$REGION" \
  --allow-unauthenticated \
  --add-cloudsql-instances "$INSTANCE_CONNECTION_NAME" \
  --set-env-vars NODE_ENV=production,LOG_LEVEL=info,CORS_ORIGIN="$CORS_ORIGIN",SERVER_PUBLIC_IP="$INGRESS_HOST",DATABASE_URL="$DATABASE_URL" \
  --set-secrets JWT_SECRET=sil-jwt-secret:latest,ADMIN_SECRET=sil-admin-secret:latest
```

Notes:

- `PORT` is injected by Cloud Run automatically.
- The app listens on `PORT`, so no extra port configuration is needed.
- `SERVER_PUBLIC_IP` should point to the separate ingest host, not the Cloud Run URL, if you want the app to generate usable RTMP/SRT URLs.

## 6. Run database migrations

Run the schema/migrations once against the Cloud SQL database.

Option A: use the backend migration script with the same database URL.

```bash
cd backend
DATABASE_URL="$DATABASE_URL" npm run db:migrate
```

Option B: use Cloud Shell or a local shell with network access to the database.

## 7. Verify the deployment

Get the Cloud Run service URL:

```bash
gcloud run services describe "$SERVICE_NAME" --region "$REGION" --format='value(status.url)'
```

Then test the health endpoint:

```bash
curl -s "https://YOUR_CLOUD_RUN_URL/health"
```

You should see a JSON response with `status: online`.

## 8. Connect the rest of the stack

If you need full IRL streaming support, deploy these separately:

- RTMP ingest host for port 1935
- SRT ingest host for UDP 9999
- Optional NGINX or MediaMTX service for webhook callbacks and stream health checks

Use the public hostname or IP of that ingest host in `SERVER_PUBLIC_IP` so the backend returns correct ingest URLs.

## Recommended production setup

- Cloud Run: backend control plane
- Cloud SQL: PostgreSQL database
- Compute Engine VM or GKE: RTMP/SRT ingest layer
- Secret Manager: credentials
- Cloud Logging: runtime logs

## Troubleshooting

- If Cloud Run starts but the app cannot find a frontend, that is expected for this backend-only deployment. The server now returns JSON at `/` instead of requiring the local frontend folder.
- If database startup fails, confirm `DATABASE_URL` is correct and the Cloud SQL instance is attached.
- If ingest URLs are wrong, update `SERVER_PUBLIC_IP` to the actual external ingest host.
- If you want a browser dashboard on Cloud Run as well, deploy the React frontend as a separate service or static site.
