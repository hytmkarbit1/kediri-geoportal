# 📋 Admin Dashboard Implementation Plan

This document outlines the plan to separate the **Admin Dashboard** from the **User Geoportal**, as requested.

## 1. Architecture

We will create a separate page for the Admin Dashboard to ensure security and a clean user experience.

- **User Geoportal (`/`)**: 
  - Focus: Viewing, Downloading, Contributing (Digitize/Upload).
  - Features: Map interface, Layer control, Download buttons.
  - Access: Public (view), Logged-in Users (contribute).

- **Admin Dashboard (`/admin.html`)**:
  - Focus: Management, Review, QC/QA.
  - Features: Data tables, Approve/Reject buttons, Delete, Bulk Upload.
  - Access: **Admins Only** (Strictly enforced).

## 2. New Files

- `admin.html`: The HTML structure for the dashboard.
- `src/admin/admin.js`: The logic for fetching and managing data.
- `src/admin/admin.css`: Styles for the dashboard.

## 3. Features to Implement

### A. Data Review (QC/QA)
- List all `pending` submissions from `crowd_data`.
- Show details (User, Date, Geometry type).
- **Actions**:
  - ✅ **Approve**: Changes status to `approved` (visible on map).
  - ❌ **Reject**: Changes status to `rejected` (hidden).
  - 🗑️ **Delete**: Permanently removes data.

### B. Government Data Management
- List all official data layers.
- **Actions**:
  - 🗑️ **Delete**: Remove outdated data.
  - 📤 **Upload**: Interface to upload new GeoJSON files directly to `government_data`.

### C. User Management (Optional)
- List users and their roles.
- Promote users to Admin.

## 4. Next Steps

1. **Approve this plan** (by asking me to proceed).
2. I will create the `admin.html` and `src/admin/` files.
3. I will configure Vite to serve the new page.
4. I will implement the review logic.
