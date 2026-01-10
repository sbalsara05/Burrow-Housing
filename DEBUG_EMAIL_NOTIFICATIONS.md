# Debugging Email Notifications

## Quick Diagnostic Checklist

### 1. Check Server Startup Logs

When you start your server, you should see:
```
Redis initialized successfully
[Email Queue] Queue initialized and ready
Email notification queue initialized
✓ Email notification template ID configured: <template_id>
✓ Brevo API key configured
```

If you see warnings, those are the issues:
- ⚠️ `BREVO_NOTIFICATION_TEMPLATE_ID is not set` → **Add it to .env**
- ⚠️ `BREVO_API_KEY is not set` → **Add it to .env**
- ⚠️ `Failed to initialize Redis` → **Check Redis connection**

### 2. Check When Triggering a Notification

When you create a notification (e.g., submit interest), you should see:

**In the logs:**
```
[Notification Email Helper] Queued new_interest email for user <userId>
[Email Queue] Job <jobId> started processing
[Email Queue] Processing new_interest email job <jobId> for user <userId>
[Email Queue] Found user <email> (ID: <userId>), checking preferences...
[Email Queue] Sending new_interest email to <email>...
[Email Service] Sending new_interest email to <email> using template <templateId>
[Email Queue] ✓ Successfully sent new_interest email to <email>
[Email Queue] ✓ Job <jobId> completed (email sent to <email>)
```

### 3. Common Issues and Solutions

#### Issue: No logs when triggering notification

**Possible causes:**
- Queue helper is not being called
- Check that `queueNotificationEmail` is imported and called in the controller

**Fix:** Verify in your controller files that you have:
```javascript
const { queueNotificationEmail } = require("../utils/notificationEmailHelper");

// After creating notification
await queueNotificationEmail(userId, "new_interest", {...});
```

#### Issue: Job queued but never processes

**Possible causes:**
- Redis connection failed
- Queue not initialized properly
- Bull queue worker not running

**Fix:**
1. Check Redis connection:
   ```bash
   redis-cli ping
   # Should return: PONG
   ```

2. Check server logs for queue initialization errors

3. Verify `REDIS_URL` in `.env` is correct

#### Issue: "User not found" in logs

**Possible causes:**
- User ID is incorrect or user was deleted
- MongoDB query failing

**Fix:**
- Verify the `userId` being passed to `queueNotificationEmail`
- Check MongoDB connection

#### Issue: "Email notifications disabled"

**Possible causes:**
- User has `emailNotifications.enabled: false`
- Specific notification type is disabled

**Fix:**
- Check user document in MongoDB:
  ```javascript
  db.users.findOne({_id: ObjectId("user_id")})
  ```
- Set to enabled:
  ```javascript
  db.users.updateOne(
    {_id: ObjectId("user_id")},
    {$set: {"emailNotifications.enabled": true}}
  )
  ```

#### Issue: "No notification template ID configured"

**Possible causes:**
- `BREVO_NOTIFICATION_TEMPLATE_ID` not set in `.env`
- Template ID is not a number

**Fix:**
1. Add to `.env`:
   ```env
   BREVO_NOTIFICATION_TEMPLATE_ID=123456
   ```
2. Restart server
3. Verify template ID is a number (not a string like "123456")

#### Issue: "Invalid template ID" or Brevo API errors

**Possible causes:**
- Template ID doesn't exist in Brevo
- Brevo API key is invalid
- Template doesn't have required variables

**Fix:**
1. Log into Brevo dashboard
2. Go to Transactional Emails > Templates
3. Verify template ID matches what's in `.env`
4. Check template has these variables:
   - `{{params.name}}`
   - `{{params.message}}`
   - `{{params.link}}`
   - `{{params.year}}` (auto-added)

#### Issue: Job fails repeatedly

**Possible causes:**
- Brevo API error (rate limit, invalid credentials, etc.)
- Network issues
- Template validation error

**Fix:**
1. Check detailed error in logs: `[Email Queue] ✗ Job failed: <error>`
2. Check Brevo dashboard for email logs
3. Verify Brevo API key has correct permissions
4. Check Brevo account status (not suspended/limited)

### 4. Test Manually

Create a test script to manually trigger an email:

```javascript
// test-email.js (create in backend folder)
require('dotenv').config({ path: './.env' });
const { queueNotificationEmail } = require('./utils/notificationEmailHelper');

(async () => {
  try {
    // Replace with actual user ID from your database
    const testUserId = 'YOUR_USER_ID_HERE';
    
    console.log('Testing email notification...');
    await queueNotificationEmail(
      testUserId,
      'new_interest',
      {
        message: 'This is a test notification email',
        link: '/dashboard/notifications',
        metadata: {}
      }
    );
    
    console.log('Email queued! Check server logs for processing...');
    
    // Wait a bit for processing
    setTimeout(() => {
      console.log('Check logs above for email processing status');
      process.exit(0);
    }, 5000);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
```

Run it:
```bash
cd backend
node test-email.js
```

### 5. Check Queue Status

Add this endpoint temporarily to check queue status:

```javascript
// Add to server.js or a routes file
app.get('/api/debug/email-queue', async (req, res) => {
  try {
    const { emailQueue } = require('./queues/emailQueue');
    
    const [waiting, active, completed, failed] = await Promise.all([
      emailQueue.getWaiting(),
      emailQueue.getActive(),
      emailQueue.getCompleted(),
      emailQueue.getFailed(),
    ]);
    
    res.json({
      queue: 'email-notifications',
      status: {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
      },
      waitingJobs: waiting.map(j => ({ id: j.id, data: j.data })),
      activeJobs: active.map(j => ({ id: j.id, data: j.data })),
      failedJobs: failed.slice(0, 10).map(j => ({ 
        id: j.id, 
        data: j.data,
        error: j.failedReason 
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

Then visit: `http://localhost:5001/api/debug/email-queue`

### 6. Enable More Verbose Logging

If you need more details, check:
- Server console logs
- Bull queue events (already logging)
- Brevo dashboard for email delivery status

## Next Steps

Based on what you see in the logs:

1. **If nothing appears:** Queue helper not being called → Check controller code
2. **If job queued but not processed:** Redis/Queue issue → Check Redis connection
3. **If job processes but fails:** Brevo/Template issue → Check Brevo configuration
4. **If job succeeds but no email:** Check spam folder, verify email address

Share the logs you see and I can help debug further!
