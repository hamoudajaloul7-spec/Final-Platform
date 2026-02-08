# Shekha Store Fix Script

## Problem Summary
- Login fails with 400 Bad Request
- Store loads but shows simplified dashboard
- Products work but related products don't show

## Root Cause Analysis
The issue is likely that:
1. The user account was created but not properly saved
2. The password hash doesn't match
3. The merchant role wasn't properly set

## SQL Fix Script
Run this in Supabase SQL Editor:

```sql
-- Check if user exists
SELECT * FROM users WHERE email = 'salem.mfurjani@gmail.com' OR email LIKE '%salem%';

-- Check if store exists
SELECT * FROM stores WHERE slug = 'shekha' OR name LIKE '%shekha%';

-- Check if merchant record exists
SELECT * FROM merchants WHERE store_slug = 'shekha';
```

## If user doesn't exist, create it:
```sql
-- Create user if not exists
INSERT INTO users (id, email, password_hash, role, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'salem.mfurjani@gmail.com',
  '$2b$10$placeholder_hash_replace_with_actual',
  'merchant',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING;
```

## Backend Logs to Check
On Render, check the logs for:
- "AUTH_DEBUG: Login attempt for email:"
- "AUTH_DEBUG: User found:"
- "AUTH_DEBUG: Password comparison result:"
- "AUTH_DEBUG: Login successful"
- "AUTH_DEBUG: Login failed:"
