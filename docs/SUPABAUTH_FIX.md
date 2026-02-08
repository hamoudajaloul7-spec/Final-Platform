# Supabase Auth Fix for Shekha Merchant

## Problem Confirmed
- `users` table does NOT have `password_hash` column
- Authentication is handled by Supabase Auth (separate from users table)
- User exists in `users` table but may not exist in Supabase Auth

## Solution: Check Supabase Auth

### Option 1: Check in Supabase Dashboard
1. Go to: https://database.supabase.com/project/wbakbuqvdbmweujkbzxn/auth/users
2. Look for user: `salem.mfurjani@gmail.com`
3. Check if user exists and is confirmed

### Option 2: Run SQL to check Supabase Auth
```sql
-- Check if user exists in auth.users
SELECT email, encrypted_password, confirmed_at, email_confirmed_at
FROM auth.users
WHERE email = 'salem.mfurjani@gmail.com';
```

### Option 3: Create user in Supabase Auth (if missing)
If the user doesn't exist in auth.users, create it:

```sql
-- Note: Creating users in auth.users directly is complex
-- Better to use Supabase Auth API or Dashboard

-- Alternative: Delete user record and recreate through signup flow
```

## Recommended Fix Steps

### Step 1: Verify in Supabase Auth Dashboard
1. Open: https://database.supabase.com/project/wbakbuqvdbmweujkbzxn/auth/users
2. Search for `salem.mfurjani@gmail.com`
3. Check status (confirmed/pending)

### Step 2: If user missing in Auth
**Option A: Use "Invite User" in Supabase**
1. Click "Invite User" in Auth tab
2. Enter: `salem.mfurjani@gmail.com`
3. User will receive invite email
4. Set password through invite link

**Option B: Delete and Recreate**
1. Delete from `users` table: `DELETE FROM users WHERE email = 'salem.mfurjani@gmail.com';`
2. Delete from `stores` table: `DELETE FROM stores WHERE slug = 'shekha';`
3. Delete from `merchants` table: `DELETE FROM merchants WHERE store_slug = 'shekha';`
4. Recreate store through 8-step flow

### Step 3: If user exists in Auth but can't login
Check if email is confirmed:
```sql
SELECT email, email_confirmed_at, encrypted_password
FROM auth.users
WHERE email = 'salem.mfurjani@gmail.com';
```

If `email_confirmed_at` is NULL:
- Resend confirmation email
- OR use "Reset Password" flow

## Alternative: Use Supabase Auth API

Create a script to create the user:

```javascript
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://wbakbuqvdbmweujkbzxn.supabase.co',
  'YOUR_SERVICE_ROLE_KEY' // Only service role can create users
);

async function createMerchantUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: 'salem.mfurjani@gmail.com',
    password: 'NEW_PASSWORD_HERE',
    email_confirm: true,
    user_metadata: {
      role: 'merchant',
      store_slug: 'shekha'
    }
  });

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('User created:', data);
  }
}
```

## Summary
The login fails because:
1. Supabase Auth user doesn't exist or password not set
2. The `users` table is just metadata, not authentication

**Fix: Create/confirm user in Supabase Auth**
