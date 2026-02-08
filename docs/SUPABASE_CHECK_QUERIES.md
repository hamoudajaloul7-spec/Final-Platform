# Supabase SQL Queries to Check User Data

## Check if salem.mfurjani@gmail.com exists in users table

Run these queries in Supabase SQL Editor: https://database.supabase.com

### Query 1: Check exact email match
```sql
SELECT id, email, role, password_hash, created_at, updated_at
FROM users
WHERE email = 'salem.mfurjani@gmail.com';
```

### Query 2: Check partial email match (if exact doesn't work)
```sql
SELECT id, email, role, created_at
FROM users
WHERE email ILIKE '%salem%mfurjani%'
LIMIT 5;
```

### Query 3: List all users to understand table structure
```sql
SELECT id, email, role, created_at
FROM users
ORDER BY created_at DESC
LIMIT 10;
```

### Query 4: Check stores table for shekha
```sql
SELECT id, name, slug, owner_id, created_at
FROM stores
WHERE slug = 'shekha' OR name ILIKE '%shekha%';
```

### Query 5: Check merchants table
```sql
SELECT id, store_slug, user_email, created_at
FROM merchants
WHERE store_slug = 'shekha';
```

---

## Expected Results:

| Table | Should Have | Value |
|-------|-------------|-------|
| users | email | `salem.mfurjani@gmail.com` |
| users | role | `merchant` |
| users | password_hash | starts with `$2b$` |
| stores | slug | `shekha` |
| merchants | store_slug | `shekha` |

---

## If No Results Found:

The user account was not saved to the database. You will need to:
1. Delete the store from control panel (if it exists)
2. Recreate it using the 8-step process
3. OR run the fix SQL script (see below)

## Fix SQL - Create User Manually (only if user doesn't exist):

```sql
-- First check if user exists
SELECT * FROM users WHERE email = 'salem.mfurjani@gmail.com';

-- If not found, create user (you need to know the password hash)
-- This requires knowing the original password to generate proper hash
-- Better to recreate the store through the normal flow
```
