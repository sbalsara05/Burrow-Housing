# Testing the Ambassador Dashboard

## Quick Start

### Step 1: Set Your User as an Ambassador

**Option A: Using the Script (Easiest)**

1. Open your terminal
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```
3. Run the script with your email:
   ```bash
   node setAmbassador.js your-email@example.com
   ```
   Replace `your-email@example.com` with the email you used to log in.

**Option B: Using MongoDB Directly**

If you have MongoDB Compass or mongo shell access:

```javascript
// Connect to your MongoDB database
use your-database-name

// Update your user
db.users.updateOne(
  { email: "your-email@example.com" },
  { 
    $set: { 
      isAmbassador: true, 
      ambassadorStatus: "active",
      "ambassadorProfile.completedInspections": 47,
      "ambassadorProfile.rating": 4.8
    }
  }
)
```

### Step 2: Refresh Your Session

After setting yourself as an ambassador:

1. **Log out and log back in** (or refresh the page)
   - This ensures the frontend gets the updated user data from the backend

2. **Check the Sidebar**
   - You should now see a new section called "Ambassador" in the left sidebar
   - It should have a link to "Ambassador Dashboard"

### Step 3: Access the Dashboard

**Method 1: Via Sidebar**
- Click on "Ambassador Dashboard" in the sidebar

**Method 2: Direct URL**
- Navigate to: `http://localhost:5173/dashboard/ambassador`
- (Replace with your frontend URL if different)

### Step 4: What to Check

Once you're on the dashboard, you should see:

✅ **Four Metric Cards:**
- Places Viewed (should show 47 or your completed inspections count)
- Upcoming Viewings (count of assigned/approved requests)
- Pending Follow-ups (count of completed requests)
- Completion Rate (percentage, should show target of 90%)

✅ **Today's Schedule Panel (Left):**
- Shows scheduled viewings for today
- Each item has:
  - Address
  - Client name
  - Time
  - Color-coded status indicator (red/orange/green)
- "View All Viewings" button at the bottom

✅ **Recent Activity Panel (Right):**
- Shows recent activity with timestamps
- Activities like:
  - "Completed inspection at [address]"
  - "Assigned to inspection at [address]"
  - "Scheduled viewing for [address]"

### Step 5: Test with Real Data (Optional)

To see actual data in the dashboard:

1. **Create some Ambassador Requests:**
   - As a regular user, submit ambassador requests for properties
   - Approve them as the lister

2. **Assign Requests to Yourself:**
   - The dashboard will show pending requests you can claim
   - You can create a simple API call or add a UI button later to claim requests

3. **Complete Some Inspections:**
   - Update request status to "completed" to see them in activity

## Troubleshooting

### Dashboard doesn't appear in sidebar
- ✅ Make sure you logged out and logged back in
- ✅ Check browser console for errors
- ✅ Verify in MongoDB that `isAmbassador: true` and `ambassadorStatus: "active"`

### Dashboard shows "Loading..." forever
- ✅ Check browser console for API errors
- ✅ Verify backend server is running
- ✅ Check that `/api/ambassador/dashboard/stats` endpoint is accessible

### "Access denied" error
- ✅ Verify your user has `isAmbassador: true` and `ambassadorStatus: "active"` in MongoDB
- ✅ Make sure you're logged in with the correct account

### Empty dashboard (no data)
- ✅ This is normal if you haven't created any ambassador requests yet
- ✅ The dashboard will show "No scheduled viewings" and "No recent activity" until you have data

## Quick Test Commands

```bash
# Set yourself as ambassador
cd backend
node setAmbassador.js your-email@example.com

# Check if it worked (in MongoDB)
db.users.findOne({ email: "your-email@example.com" }, { isAmbassador: 1, ambassadorStatus: 1, ambassadorProfile: 1 })
```

## Next Steps

Once the dashboard is working:
1. Create some test ambassador requests
2. Assign them to yourself
3. Complete some inspections
4. See the data populate in real-time!
