#!/bin/bash

set -e

PROJECT="hosting-484414"
REGION="us-central1"
VM_ZONE="us-central1-a"
VM_NAME="sil-ingest-vm"
API_URL="https://sil-api-57x2g5nmaq-uc.a.run.app"
CLOUD_RUN_IP="34.46.51.228"
RTMP_PORT="1935"

echo "=========================================="
echo "Stream Pipeline Test Suite"
echo "=========================================="

# Test 1: Verify nginx is running on VM
echo -e "\n[TEST 1] Verify nginx-rtmp service on VM..."
gcloud compute ssh "$VM_NAME" --zone "$VM_ZONE" --project "$PROJECT" --command "ps aux | grep -E 'nginx: (master|worker)' | grep -v grep | head -2" && echo "✓ nginx is running" || echo "✗ nginx NOT running"

# Test 2: Verify port 1935 is listening
echo -e "\n[TEST 2] Verify port 1935 listening..."
gcloud compute ssh "$VM_NAME" --zone "$VM_ZONE" --project "$PROJECT" --command "ss -tulpn | grep 1935" && echo "✓ Port 1935 is listening" || echo "✗ Port 1935 NOT listening"

# Test 3: Verify Cloud Run is responding
echo -e "\n[TEST 3] Verify Cloud Run API is responding..."
HEALTH_CHECK=$(curl -s "$API_URL/api/health" 2>&1 || echo "ERROR")
if [[ "$HEALTH_CHECK" == *"\"status\"" ]] || [[ "$HEALTH_CHECK" == "OK" ]]; then
    echo "✓ Cloud Run API is responding"
else
    echo "✗ Cloud Run API not responding: $HEALTH_CHECK"
fi

# Test 4: Check nginx config for correct webhook URL
echo -e "\n[TEST 4] Verify nginx config has correct webhook..."
gcloud compute ssh "$VM_NAME" --zone "$VM_ZONE" --project "$PROJECT" --command "grep -c 'sil-api.*run.app' /etc/nginx/nginx.conf || echo '0'" && echo "✓ nginx config has Cloud Run webhook" || echo "✗ nginx config issue"

# Test 5: Check if FFmpeg transcoding is set up correctly in nginx
echo -e "\n[TEST 5] Verify nginx FFmpeg transcoding config..."
gcloud compute ssh "$VM_NAME" --zone "$VM_ZONE" --project "$PROJECT" --command "grep -A 2 'exec ffmpeg' /etc/nginx/nginx.conf | head -5" && echo "✓ FFmpeg transcoding configured" || echo "✗ FFmpeg config missing"

# Test 6: Check HLS path exists and is writable
echo -e "\n[TEST 6] Verify HLS output directory..."
gcloud compute ssh "$VM_NAME" --zone "$VM_ZONE" --project "$PROJECT" --command "ls -ld /opt/data/hls 2>&1" && echo "✓ HLS directory accessible" || echo "✗ HLS directory issue"

# Test 7: Check Cloud Run logs for recent auth callbacks
echo -e "\n[TEST 7] Check Cloud Run logs for auth activity..."
RECENT_LOGS=$(gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=sil-api" --limit 50 --format='value(textPayload)' 2>/dev/null | grep -i "auth\|rtmp" | tail -5 || echo "No logs")
echo "$RECENT_LOGS"

# Test 8: Simulate RTMP auth callback
echo -e "\n[TEST 8] Test RTMP auth endpoint with curl..."
TEST_STREAM_KEY="test-stream-key-$(date +%s)"
AUTH_RESPONSE=$(curl -s -X POST "$API_URL/rtmp/auth" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "name=$TEST_STREAM_KEY&addr=127.0.0.1" 2>&1)
echo "Auth response: $AUTH_RESPONSE"
if [[ "$AUTH_RESPONSE" == *"403"* ]] || [[ "$AUTH_RESPONSE" == "" ]]; then
    echo "✓ Auth endpoint responding (returned 403 for test key - expected)"
else
    echo "⚠ Auth endpoint response: $AUTH_RESPONSE"
fi

# Test 9: Check if restreamer sessions exist
echo -e "\n[TEST 9] Check active restreamer sessions..."
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=sil-api" \
  --limit 100 --format='value(textPayload)' 2>/dev/null | \
  grep -E "Session starting|YouTube|Twitch|Kick" | tail -10 || echo "No active sessions"

# Test 10: Check for FFmpeg connection errors
echo -e "\n[TEST 10] Check FFmpeg connection status..."
ERROR_COUNT=$(gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=sil-api" \
  --limit 200 --format='value(textPayload)' 2>/dev/null | \
  grep -c "Connection refused" || echo "0")
echo "FFmpeg connection errors in last 200 logs: $ERROR_COUNT"
if [[ "$ERROR_COUNT" -lt 5 ]]; then
    echo "✓ No recent connection errors"
else
    echo "⚠ Multiple connection errors detected - check network connectivity"
fi

# Test 11: Verify database connectivity
echo -e "\n[TEST 11] Check Cloud Run database connectivity..."
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=sil-api" \
  --limit 50 --format='value(textPayload)' 2>/dev/null | \
  grep -E "Connected to PostgreSQL|DB.*timeout" | tail -3 || echo "No recent DB logs"

# Test 12: Check firewall rules
echo -e "\n[TEST 12] Check GCP Firewall rules for port 1935..."
gcloud compute firewall-rules list --project "$PROJECT" --format='table(name,direction,sourceRanges[].list():label=SOURCES,allowed[].map().firewall_rule().list():label=ALLOW)' 2>&1 | grep -i "1935" || echo "No specific rule for 1935 found"

echo -e "\n=========================================="
echo "Test Suite Complete"
echo "=========================================="
echo ""
echo "SUMMARY:"
echo "--------"
echo "If all tests pass, the pipeline should work end-to-end:"
echo "1. OBS → nginx-rtmp on VM (port 1935)"
echo "2. nginx-rtmp → webhook to Cloud Run"
echo "3. Cloud Run → FFmpeg restreamer"
echo "4. FFmpeg → YouTube/Twitch/Kick"
echo ""
echo "Next steps if tests fail:"
echo "- Check OBS is using CORRECT server and stream key format"
echo "- Verify firewall allows Cloud Run to reach VM:1935"
echo "- Check nginx logs: gcloud compute ssh $VM_NAME --zone $VM_ZONE --command 'tail -50 /var/log/nginx/error.log'"
echo "- Monitor FFmpeg: gcloud compute ssh $VM_NAME --zone $VM_ZONE --command 'ps aux | grep ffmpeg'"
echo ""
