# Kediri Geoportal - Setup Guide

## Step-by-Step Installation Instructions

### Step 1: Install Dependencies

Due to PowerShell execution policy, run this command instead:

```powershell
# Option 1: Bypass execution policy for this session
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
```

Or use Command Prompt (cmd.exe) instead:

```cmd
npm install
```

### Step 2: Run Database Migrations

1. Open your Supabase project: https://wfelfwvvwtdvdcfcrlyh.supabase.co
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste each migration file content (in order):

#### Migration 1: Create Schemas
Copy content from: `database/migrations/001_create_schemas.sql`
Click "Run" or press Ctrl+Enter

#### Migration 2: Government Tables
Copy content from: `database/migrations/002_create_government_tables.sql`
Click "Run"

#### Migration 3: Crowd Tables
Copy content from: `database/migrations/003_create_crowd_tables.sql`
Click "Run"

#### Migration 4: RLS Policies
Copy content from: `database/migrations/004_create_rls_policies.sql`
Click "Run"

#### Migration 5: Triggers
Copy content from: `database/migrations/005_create_triggers.sql`
Click "Run"

### Step 3: Start Development Server

```cmd
npm run dev
```

The application will open at: http://localhost:5173

### Step 4: Create Your First Account

1. Open http://localhost:5173
2. Enter your email and password
3. Click "Sign Up"
4. Check your email for verification link (if email is configured in Supabase)

### Step 5: Make Yourself Admin

1. Go to Supabase Dashboard → Authentication → Users
2. Copy your User ID (UUID format)
3. Go to SQL Editor
4. Run this query:

```sql
INSERT INTO public.user_roles (user_id, role)
VALUES ('paste-your-user-id-here', 'admin');
```

5. Refresh your browser - you should now see admin tools!

### Step 6: Test Features

#### Test Map Display
- Map should load centered on Kediri
- Layer control should appear on the right
- Legend should appear on the bottom right

#### Test Authentication
- Login/logout should work
- User info should display after login
- Tools panel should appear when logged in

#### Test Digitization
- Click "Digitize Features"
- Drawing tools should appear on the left
- Draw a point or polygon
- Fill in the attribute form
- Feature should save to database

#### Test Upload
- Prepare a zipped shapefile
- Click "Upload Shapefile"
- Select your .zip file
- Features should appear on map

#### Test Download
- Click "Download Data"
- Select a dataset
- File should download as GeoJSON

## Troubleshooting

### npm command not found
Install Node.js from: https://nodejs.org/

### PowerShell execution policy error
Use Command Prompt (cmd.exe) instead of PowerShell, or run:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Supabase connection error
- Check that .env file exists
- Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are correct
- Ensure you're using the anon/public key, not the service role key

### Map not loading
- Open browser console (F12)
- Check for JavaScript errors
- Verify Leaflet CSS and JS are loading

### Database errors
- Ensure all 5 migration files were run successfully
- Check Supabase logs in dashboard
- Verify PostGIS extension is enabled

### Cannot see data
- Ensure you've created at least one user role
- Check RLS policies are active
- Try logging out and back in

## Next Steps

### Add Sample Government Data

You can add sample data via QGIS or SQL:

```sql
-- Example: Add a sample education point
INSERT INTO government_data.education_points 
(name, education_type, address, geom)
VALUES 
('SDN Kediri 1', 'elementary', 'Jl. Example No. 1', 
 ST_SetSRID(ST_MakePoint(112.0167, -7.8167), 4326));
```

### Deploy to Vercel

```cmd
npm install -g vercel
vercel login
vercel
```

Follow the prompts to deploy!

## Support

If you encounter issues:
1. Check the browser console (F12)
2. Check Supabase logs
3. Review the README.md
4. Check database/README.md for database-specific issues
