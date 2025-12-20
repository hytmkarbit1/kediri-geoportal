# Database Setup Guide

This directory contains SQL migration files to set up your Supabase database for the Kediri Geoportal.

## Prerequisites

- Supabase account (free tier)
- Access to Supabase SQL Editor

## Migration Order

Run these SQL files **in order** using the Supabase SQL Editor:

### 1. `001_create_schemas.sql`
- Enables PostGIS extension
- Creates `government_data` and `crowd_data` schemas
- Creates `user_roles` table for role-based access control
- Sets up initial RLS policies for user roles

### 2. `002_create_government_tables.sql`
- Creates tables for official government datasets:
  - `land_cover` - Land use/cover polygons
  - `admin_boundaries` - Administrative boundaries (city/district/village)
  - `buildings` - Building footprints
  - `commercial_points` - Commercial/business locations
  - `roads` - Road network
  - `education_points` - Schools and educational facilities
- Adds spatial indexes for performance
- Enables RLS on all tables

### 3. `003_create_crowd_tables.sql`
- Creates tables for user-contributed data:
  - `user_points` - User-digitized points
  - `user_polygons` - User-digitized polygons
  - `uploaded_features` - Features from uploaded shapefiles
- Includes status field for QC/QA workflow
- Adds spatial indexes and user_id indexes

### 4. `004_create_rls_policies.sql`
- Creates comprehensive Row Level Security policies
- **Government Data**: Read-only for public, full access for admins
- **Crowd Data**: Users can create/edit their own, view approved submissions
- Creates `is_admin()` helper function

### 5. `005_create_triggers.sql`
- **Geometry Validation**: Auto-fixes invalid geometries using `ST_MakeValid`
- **Attribute Validation**: Ensures required fields are populated
- **Auto-calculations**: Calculates area for polygons
- **Timestamps**: Auto-updates `updated_at` field

## How to Run Migrations

1. Go to your Supabase project: https://wfelfwvvwtdvdcfcrlyh.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**
4. Copy and paste the content of `001_create_schemas.sql`
5. Click **Run** (or press Ctrl+Enter)
6. Repeat for files 002 through 005 **in order**

## Post-Migration Setup

### Create Your First Admin User

After running all migrations, you need to assign yourself as an admin:

1. Sign up for an account in your application
2. Go to Supabase Dashboard → Authentication → Users
3. Copy your User ID (UUID)
4. Run this SQL in the SQL Editor:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('YOUR_USER_ID_HERE', 'admin');
```

### Set Up Storage for Raster DEM

1. Go to **Storage** in Supabase Dashboard
2. Create a new bucket named `rasters`
3. Set it to **Public** (for read access)
4. Upload your DEM TIFF files to this bucket

## Schema Overview

```
┌─────────────────────────────────────┐
│         government_data             │
├─────────────────────────────────────┤
│ - land_cover                        │
│ - admin_boundaries                  │
│ - buildings                         │
│ - commercial_points                 │
│ - roads                             │
│ - education_points                  │
└─────────────────────────────────────┘
         ↓ (Read-only for public)
         ↓ (Full access for admin)

┌─────────────────────────────────────┐
│           crowd_data                │
├─────────────────────────────────────┤
│ - user_points                       │
│ - user_polygons                     │
│ - uploaded_features                 │
└─────────────────────────────────────┘
         ↓ (Users can create/edit own)
         ↓ (View approved submissions)
```

## RLS Security Model

- **Public Users**: Can view all government data, create/edit their own crowd data
- **Admin Users**: Full CRUD access to all tables
- **Automatic**: Geometry validation, required field checks, timestamp updates

## Troubleshooting

### Error: "extension postgis does not exist"
- PostGIS should be available by default in Supabase
- Try running: `CREATE EXTENSION IF NOT EXISTS postgis CASCADE;`

### Error: "permission denied for schema"
- Make sure you're running queries as the postgres role
- Check that RLS is properly configured

### Geometry not showing on map
- Verify geometries are in SRID 4326 (WGS84)
- Check that spatial indexes were created
- Ensure RLS policies allow SELECT access

## Next Steps

After completing database setup:
1. Test the connection from your frontend application
2. Load sample government data (via QGIS or SQL)
3. Test user registration and role assignment
4. Verify RLS policies work as expected
