# Manual MongoDB Update for Ambassador

## Quick MongoDB Commands

### Using MongoDB Shell (mongosh or mongo)

```javascript
// Connect to your database
use your-database-name

// Update by email
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

// Verify it worked
db.users.findOne(
  { email: "your-email@example.com" },
  { isAmbassador: 1, ambassadorStatus: 1, ambassadorProfile: 1, name: 1, email: 1 }
)
```

### Using MongoDB Compass (GUI)

1. **Open MongoDB Compass**
2. **Connect** to your database
3. **Navigate** to: `your-database` → `users` collection
4. **Find** your user:
   - Click the filter icon
   - Enter: `{ "email": "your-email@example.com" }`
   - Press Enter
5. **Click** on the document to open it
6. **Click "Edit Document"** (pencil icon)
7. **Add/Update** these fields:
   ```json
   {
     "isAmbassador": true,
     "ambassadorStatus": "active",
     "ambassadorProfile": {
       "completedInspections": 47,
       "rating": 4.8
     }
   }
   ```
8. **Click "Update"**

### What the fields mean:

- `isAmbassador: true` - Enables ambassador role
- `ambassadorStatus: "active"` - Must be "active" (not "pending" or "inactive")
- `ambassadorProfile.completedInspections` - Number shown in "Places Viewed" card
- `ambassadorProfile.rating` - Optional, for future use

### After updating:

1. **Log out** of your app
2. **Log back in** (or refresh the page)
3. Check the sidebar for "Ambassador Dashboard" link
4. Navigate to `/dashboard/ambassador`

### Verify it worked:

Run this query to check:
```javascript
db.users.findOne(
  { email: "your-email@example.com" },
  { 
    name: 1, 
    email: 1, 
    isAmbassador: 1, 
    ambassadorStatus: 1, 
    ambassadorProfile: 1 
  }
)
```

You should see:
```json
{
  "_id": "...",
  "name": "Your Name",
  "email": "your-email@example.com",
  "isAmbassador": true,
  "ambassadorStatus": "active",
  "ambassadorProfile": {
    "completedInspections": 47,
    "rating": 4.8
  }
}
```
