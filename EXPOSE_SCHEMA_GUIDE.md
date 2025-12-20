# 🔓 How to Expose the 'government_data' Schema

**CRITICAL STEP**: Before you can import data, you must tell Supabase to allow access to the `government_data` schema. By default, only the `public` schema is accessible.

## Step-by-Step Instructions

1. **Log in to Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Open your project: **wfelfwvvwtdvdcfcrlyh**

2. **Go to API Settings**
   - Click the **Settings** icon (⚙️ gear) at the bottom of the left sidebar
   - Click **API** in the list

3. **Find "Exposed Schemas"**
   - Scroll down to the **"API Settings"** section
   - Look for the **"Exposed schemas"** field
   - It currently says: `public`

4. **Add 'government_data'**
   - Click the field to edit
   - Select `government_data` from the dropdown list
   - **IMPORTANT**: Make sure BOTH `public` and `government_data` are selected
   - It should look like: `public, government_data`

5. **Save Changes**
   - Click the **Save** button

## ✅ Verify It Works

Once you've saved the settings, run the test script again:

```cmd
node test-schema-connection.js
```

**Expected Output:**
```
✅ Connection successful!
   Successfully connected to table: government_data.admin_boundaries
```

## 🚀 Proceed with Import

Now you can run the main import script:

```cmd
node scripts/import-to-supabase.js
```
