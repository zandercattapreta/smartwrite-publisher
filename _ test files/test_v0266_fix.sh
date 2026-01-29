#!/bin/bash

# SmartWrite Publisher v0.2.6.6 - Test API with Empty draft_bylines
# This tests the fix: draft_bylines MUST be present but can be empty []

COOKIE="connect.sid=s%3A5Ds9Wwg1Jv7wDNPdAjiHUwQO1PfqEGfj.qw37jDKUqiCfnrE3MXCJ3QxF8Fmca6O1xBOTnw76A4I"
PUB_ID="7678831"
DOMAIN="thebreachrpg.substack.com"

echo "============================================"
echo "SmartWrite v0.2.6.6 - API Fix Test"
echo "============================================"
echo ""
echo "Testing: draft_bylines: [] (empty array)"
echo "Expected: HTTP 200/201 (Success)"
echo ""

curl -i -X POST \
  -H "Cookie: $COOKIE" \
  -H "Content-Type: application/json" \
  -d '{
    "draft_title": "v0.2.6.6 Test - Empty Bylines Fix",
    "draft_subtitle": "Testing the fix",
    "draft_body": "<p>This draft tests the v0.2.6.6 fix with empty draft_bylines array.</p>",
    "type": "newsletter",
    "draft_bylines": []
  }' \
  https://$DOMAIN/api/v1/drafts?publication_id=$PUB_ID 2>&1

echo ""
echo ""
echo "============================================"
echo "Test Complete!"
echo "============================================"
echo ""
echo "If you see HTTP 200 or 201, the fix works!"
echo "If you see HTTP 400, there's still an issue."
echo ""
