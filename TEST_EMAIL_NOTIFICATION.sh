#!/bin/bash

# Test Email Notification Endpoint
# Usage: ./TEST_EMAIL_NOTIFICATION.sh YOUR_JWT_TOKEN [notification_type]

# Get JWT token from first argument or prompt for it
if [ -z "$1" ]; then
    echo "Usage: ./TEST_EMAIL_NOTIFICATION.sh YOUR_JWT_TOKEN [notification_type]"
    echo ""
    echo "Example: ./TEST_EMAIL_NOTIFICATION.sh eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... new_interest"
    echo ""
    echo "Available notification types:"
    echo "  - new_interest (default)"
    echo "  - interest_approved"
    echo "  - interest_declined"
    echo "  - ambassador_request"
    echo "  - ambassador_request_update"
    echo "  - new_message"
    echo "  - property_deleted"
    exit 1
fi

JWT_TOKEN=$1
NOTIFICATION_TYPE=${2:-new_interest}  # Default to new_interest if not provided
API_URL="http://localhost:5001/api/notifications/test-email"

echo "Testing email notification..."
echo "Type: $NOTIFICATION_TYPE"
echo ""

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d "{\"notificationType\": \"$NOTIFICATION_TYPE\"}" \
  | jq '.'

echo ""
echo ""
echo "Check your server logs and email inbox for results!"
