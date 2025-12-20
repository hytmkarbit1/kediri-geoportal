# ✅ Fixes for Map Loading Issues

I've identified and fixed two critical issues preventing your data from showing on the map.

## 1. Infinite Recursion Error (Critical)

**The Problem:** The database was getting stuck in a loop when checking if a user is an admin (`user_roles` policy checking `user_roles`).

**The Fix:** Created a new migration `009_fix_rls_recursion.sql`.

**Action Required:**
1. Open `database/migrations/009_fix_rls_recursion.sql`
2. Run it in Supabase SQL Editor

## 2. "Could not find table" Error

**The Problem:** The frontend code was trying to access tables like `public.government_data.land_cover`, which is incorrect. It should have been switching schemas properly.

**The Fix:** Updated `src/map/layers.js` to use the correct Supabase method:
```javascript
// Old (Wrong)
.from('government_data.land_cover')

// New (Correct)
.schema('government_data').from('land_cover')
```

**Action Required:**
- None! I already applied this fix to your code.
- Just restart your dev server (`npm run dev`).

## 3. "Permission Denied" Error (Critical)

**The Problem:** The database schemas `government_data` and `crowd_data` were created but permissions were not granted to public/users, causing `403 Forbidden` errors.

**The Fix:** Created a new migration `010_fix_schema_permissions.sql`.

**Action Required:**
1. Open `database/migrations/010_fix_schema_permissions.sql`
2. Run it in Supabase SQL Editor

## 🚀 Try It Now

1. Run Migration 009 (Recursion Fix)
2. Run Migration 010 (Permission Fix)
3. Restart `npm run dev`
4. Refresh your browser

Your map should now load all the data! 🎉
