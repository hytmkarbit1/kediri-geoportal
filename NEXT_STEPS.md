# 🚀 Next Steps: Getting Everything Running

Follow these 3 simple steps to apply all fixes and start using the new features.

## Step 1: Update Database (Critical)
You need to run two SQL scripts in your Supabase Dashboard to fix the errors.

1.  **Go to Supabase**: Open your project dashboard and go to the **SQL Editor**.
2.  **Run Migration 009** (Fixes the crash):
    - Copy code from: `database/migrations/009_fix_rls_recursion.sql`
    - Paste into SQL Editor and click **Run**.
3.  **Run Migration 010** (Fixes "Permission Denied"):
    - Copy code from: `database/migrations/010_fix_schema_permissions.sql`
    - Paste into SQL Editor and click **Run**.
4.  **Run Migration 011** (Fixes "Sequence Permission" - Error saving):
    - Copy code from: `database/migrations/011_fix_sequence_permissions.sql`
    - Paste into SQL Editor and click **Run**.

## Step 2: Install Updates
We added a new library to handle ZIP files for shapefile uploads.

1.  Open your terminal (VS Code terminal is fine).
2.  Run this command:
    ```bash
    npm install
    ```

## Step 3: Restart and Test
1.  **Restart the Server**:
    - In the terminal, press `Ctrl+C` to stop the current server.
    - Run: `npm run dev`
2.  **Open the App**:
    - Go to `http://localhost:5173`
    - **New Landing Page**: You will see the new home page!
    - **Launch Map**: Click "Start Exploring" to open the map.
    - **Test Admin**: Click "Admin Login" in the top right.

---

### ✅ What Should Work Now?
- **Map Loading**: No more "403 Forbidden" or "Recursion" errors.
- **Digitizing**: You can draw points/polygons and save them. They will appear as "Pending".
- **Uploading**: You can upload a `.zip` shapefile. It will appear as "Pending".
- **Admin Dashboard**: You can log in as admin and Approve/Reject the pending data.
