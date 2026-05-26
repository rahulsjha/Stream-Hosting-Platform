#!/bin/bash
set -e

# Configuration
CLOUD_RUN_URL="https://sil-api-308720634926.us-central1.run.app"
CONTROL_PLANE_URL="${CLOUD_RUN_URL}"

# Create nginx config with correct Cloud Run URL
cat > /tmp/nginx-rtmp.conf << 'EOF'
daemon off;

error_log /dev/stdout info;

events {
    worker_connections 1024;
}

rtmp {
    server {
        listen 1935;
        chunk_size 4000;

        application live {
            live on;

            # Control-plane webhook (Cloud Run)
            exec_publish /usr/bin/curl -sS -o /dev/null -X POST -d name=$name -d addr=$addr CONTROL_PLANE_AUTH;
            exec_publish_done /usr/bin/curl -sS -o /dev/null -X POST -d name=$name -d addr=$addr CONTROL_PLANE_DONE;

            # Allow both publish (encoders) and play (restreamer pulls)
            allow publish all;
            allow play all;
        }
    }
}

http {
    server {
        listen 80;
        location /stat {
            rtmp_stat all;
        }
        location /control {
            rtmp_control all;
        }
    }
}
EOF

# Replace placeholders
sed -i "s|CONTROL_PLANE_AUTH|${CONTROL_PLANE_URL}/rtmp/auth|g" /tmp/nginx-rtmp.conf
sed -i "s|CONTROL_PLANE_DONE|${CONTROL_PLANE_URL}/rtmp/done|g" /tmp/nginx-rtmp.conf

echo "✓ nginx-rtmp config created at /tmp/nginx-rtmp.conf"

# Stop existing container if running
echo "Checking for existing nginx-rtmp container..."
docker stop sil-nginx-rtmp 2>/dev/null || true
docker rm sil-nginx-rtmp 2>/dev/null || true

# Pull latest image
echo "Pulling nginx-rtmp image..."
docker pull tiangolo/nginx-rtmp:latest

# Run nginx-rtmp container
echo "Starting nginx-rtmp container..."
docker run -d \
  --name sil-nginx-rtmp \
  --restart unless-stopped \
  -p 1935:1935 \
  -p 80:80 \
  -v /tmp/nginx-rtmp.conf:/etc/nginx/nginx.conf:ro \
  tiangolo/nginx-rtmp:latest

echo "✓ nginx-rtmp container started"

# Verify it's running
sleep 2
if docker ps | grep -q sil-nginx-rtmp; then
  echo "✓✓✓ SUCCESS: nginx-rtmp is running and listening on port 1935"
  docker logs sil-nginx-rtmp 2>&1 | head -10
else
  echo "✗ ERROR: nginx-rtmp container failed to start"
  docker logs sil-nginx-rtmp
  exit 1
fi
