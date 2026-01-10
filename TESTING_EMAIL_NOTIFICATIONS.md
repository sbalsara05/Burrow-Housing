# Quick Testing Checklist for Email Notifications

## Pre-Test Setup ✅

Before testing, ensure:

1. **Redis is running**
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

2. **Environment variables are set** (in `.env`):
   - ✅ `REDIS_URL` - Your Redis connection string
   - ✅ `BREVO_API_KEY` - Your Brevo API key
   - ✅ `BREVO_SENDER_EMAIL` - Your sender email (e.g., notifications@burrowhousing.com)
   - ✅ `BREVO_NOTIFICATION_TEMPLATE_ID` - Your Brevo template ID
   - ✅ `FRONTEND_URL` - Your frontend URL (optional, defaults to burrowhousing.com)

3. **Brevo template is created** with these variables:
   - `{{params.name}}`
   - `{{params.message}}`
   - `{{params.link}}`
   - `{{params.linkText}}` (optional)
   - `{{params.year}}` (auto-added)

## Test Steps

### 1. Start the Server

```bash
cd backend
npm start
```

**Expected logs:**
```
MongoDB connected
Redis initialized successfully
Email notification queue initialized
Server running on port 5001
```

### 2. Test Notification Creation

#### Test Case 1: New Interest Notification
1. Log in as User A
2. Log in as User B (different account)
3. User B shows interest in User A's property
4. **Check logs for:**
   ```
   [Notification Email Helper] Queued new_interest email for user <userId>
   [Email Queue] Queued new_interest email for user <userId>
   [Email Queue] Job <jobId> completed
   ```
5. **Check User A's email** - should receive notification email

#### Test Case 2: Interest Approved
1. User A approves User B's interest
2. **Check logs:**
   ```
   [Notification Email Helper] Queued interest_approved email for user <userId>
   [Email Queue] Job <jobId> completed
   ```
3. **Check User B's email** - should receive approval email

#### Test Case 3: Ambassador Request
1. User B requests ambassador for User A's property
2. **Check logs:**
   ```
   [Notification Email Helper] Queued ambassador_request email for user <userId>
   ```
3. **Check User A's email** - should receive ambassador request email

### 3. Verify Email Queue Processing

Check server logs for:
- ✅ `[Email Queue] Queued <type> email for user <userId>` - Job queued
- ✅ `[Email Queue] Job <jobId> completed` - Email sent successfully
- ❌ `[Email Queue] Job <jobId> failed` - Check error message

### 4. Test User Preferences

1. **Disable email notifications for a user:**
   ```javascript
   // In MongoDB or via API
   db.users.updateOne(
     { _id: ObjectId("user_id") },
     { $set: { "emailNotifications.enabled": false } }
   )
   ```

2. Trigger a notification
3. **Verify:** Email should NOT be sent (check logs)

4. **Re-enable:**
   ```javascript
   db.users.updateOne(
     { _id: ObjectId("user_id") },
     { $set: { "emailNotifications.enabled": true } }
   )
   ```

## Troubleshooting

### ❌ "Email Queue not initialized"
- **Fix:** Check Redis connection
- **Verify:** `redis-cli ping` returns PONG

### ❌ "Job failed" errors
- **Check:** Brevo API key is valid
- **Check:** Template ID exists in Brevo
- **Check:** Template has all required variables
- **Check:** Sender email is verified in Brevo

### ❌ No emails received
1. Check spam folder
2. Verify user has `emailNotifications.enabled: true`
3. Check Brevo dashboard for email logs
4. Verify template ID in `.env` matches Brevo template

### ❌ Queue not processing
- **Check:** Redis is running
- **Check:** `REDIS_URL` is correct
- **Restart:** Server to reinitialize queue

## Success Indicators ✅

You'll know it's working when:
1. ✅ Server logs show "Email notification queue initialized"
2. ✅ Logs show jobs being queued: `[Notification Email Helper] Queued...`
3. ✅ Logs show jobs completing: `[Email Queue] Job completed`
4. ✅ Emails arrive in inbox (check spam too!)
5. ✅ Email content matches notification message

## Quick Test Script

You can also test directly by creating a notification:

```javascript
// In a test script or MongoDB shell
const { queueNotificationEmail } = require('./utils/notificationEmailHelper');

await queueNotificationEmail(
  'USER_ID_HERE',
  'new_interest',
  {
    message: 'Test notification message',
    link: '/dashboard/notifications',
    metadata: {}
  }
);
```

## Next Steps After Testing

Once confirmed working:
1. ✅ Monitor email delivery rates in Brevo dashboard
2. ✅ Set up email preferences UI in frontend
3. ✅ Consider adding email digests for multiple notifications
4. ✅ Add unsubscribe functionality
