# 🛡️ Admin Dashboard Guide

A new Admin Dashboard has been added to manage the Geoportal data.

## 🔗 Accessing the Dashboard

1. **Login as Admin**: You must be logged in with an account that has the `admin` role.
2. **Go to URL**: Navigate to `/admin.html` (e.g., `http://localhost:5173/admin.html`).
3. **Link**: There is also a link in the main map interface (if you are an admin).

## ✨ Features

### 1. Pending Review Tab
- Lists all data submitted by users (Points, Polygons, Uploads).
- **Approve**: Makes the data visible on the public map.
- **Reject**: Marks data as rejected (hides it).
- **Delete**: Permanently removes the data.

### 2. Approved Data Tab
- Lists all currently visible crowd data.
- You can delete inappropriate data here.

### 3. Government Data Tab
- Shows statistics for official layers.
- **Upload**: (Coming soon) Interface to upload official data.

## 🛠️ Setup Required

If you haven't already, please run the migration to fix permissions:
1. Open Supabase SQL Editor.
2. Run `database/migrations/010_fix_schema_permissions.sql`.

## 🐞 Troubleshooting

- **"Access Denied"**: Ensure your user has the `admin` role in the `user_roles` table.
- **"Loading..." forever**: Check the console (F12) for errors. Ensure RLS policies are correct (Migration 009).
