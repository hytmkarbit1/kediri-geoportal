# Terminal Commands Quick Reference

## Installation & Setup

### Install Dependencies
```cmd
# Use Command Prompt (cmd.exe), NOT PowerShell
cd C:\Users\acer\kediri-geoportal
npm install
```

If you must use PowerShell:
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npm install
```

## Development

### Start Development Server
```cmd
npm run dev
```
Access at: http://localhost:5173

### Build for Production
```cmd
npm run build
```

### Preview Production Build
```cmd
npm run preview
```

## Deployment

### Install Vercel CLI
```cmd
npm install -g vercel
```

### Login to Vercel
```cmd
vercel login
```

### Deploy to Preview
```cmd
vercel
```

### Deploy to Production
```cmd
vercel --prod
```

## Git Commands

### Initialize Repository
```cmd
cd C:\Users\acer\kediri-geoportal
git init
git add .
git commit -m "Initial commit: Kediri Participatory Geoportal"
```

### Connect to GitHub
```cmd
git remote add origin https://github.com/yourusername/kediri-geoportal.git
git branch -M main
git push -u origin main
```

### Update Repository
```cmd
git add .
git commit -m "Your commit message"
git push
```

## Database Commands (Supabase SQL Editor)

### Check PostGIS Version
```sql
SELECT PostGIS_Version();
```

### List All Schemas
```sql
SELECT schema_name 
FROM information_schema.schemata 
WHERE schema_name IN ('government_data', 'crowd_data');
```

### Check Tables in Schema
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'government_data';
```

### Count Features in Table
```sql
SELECT COUNT(*) FROM government_data.education_points;
SELECT COUNT(*) FROM crowd_data.user_points;
```

### View User Roles
```sql
SELECT u.email, ur.role 
FROM auth.users u
JOIN public.user_roles ur ON u.id = ur.user_id;
```

### Make User Admin
```sql
-- First, get user ID from Authentication > Users in Supabase dashboard
INSERT INTO public.user_roles (user_id, role)
VALUES ('paste-user-uuid-here', 'admin')
ON CONFLICT (user_id) 
DO UPDATE SET role = 'admin';
```

### Add Sample Government Data
```sql
-- Sample education point
INSERT INTO government_data.education_points 
(name, education_type, address, geom)
VALUES 
('SDN Kediri 1', 'elementary', 'Jl. Brawijaya No. 1', 
 ST_SetSRID(ST_MakePoint(112.0167, -7.8167), 4326));

-- Sample commercial point
INSERT INTO government_data.commercial_points 
(name, business_type, address, geom)
VALUES 
('Pasar Kediri', 'market', 'Jl. Pasar Besar', 
 ST_SetSRID(ST_MakePoint(112.0180, -7.8150), 4326));
```

### Check RLS Policies
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname IN ('government_data', 'crowd_data');
```

### View Triggers
```sql
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_schema IN ('government_data', 'crowd_data');
```

## Troubleshooting Commands

### Clear npm Cache
```cmd
npm cache clean --force
```

### Reinstall Dependencies
```cmd
rmdir /s /q node_modules
del package-lock.json
npm install
```

### Check Node Version
```cmd
node --version
npm --version
```

### Check if Port 5173 is in Use
```cmd
netstat -ano | findstr :5173
```

### Kill Process on Port 5173
```cmd
# Find PID from above command, then:
taskkill /PID <PID> /F
```

## Useful Supabase Queries

### View All User Submissions
```sql
SELECT 
    u.email,
    up.feature_name,
    up.feature_type,
    up.status,
    up.created_at
FROM crowd_data.user_points up
JOIN auth.users u ON up.user_id = u.id
ORDER BY up.created_at DESC;
```

### Approve Pending Submissions
```sql
UPDATE crowd_data.user_points
SET status = 'approved'
WHERE status = 'pending' AND id = 123;
```

### Delete Invalid Geometries
```sql
DELETE FROM crowd_data.user_points
WHERE NOT ST_IsValid(geom);
```

### Export Data as CSV (in Supabase)
```sql
COPY (
    SELECT 
        feature_name,
        feature_type,
        ST_AsText(geom) as geometry_wkt
    FROM crowd_data.user_points
    WHERE status = 'approved'
) TO STDOUT WITH CSV HEADER;
```

## Quick Fixes

### Fix: "Cannot find module"
```cmd
npm install
```

### Fix: "Port already in use"
```cmd
# Kill the process or use different port
npm run dev -- --port 3000
```

### Fix: "Supabase connection error"
Check .env file exists and has correct values:
```cmd
type .env
```

### Fix: "Map not loading"
Open browser console (F12) and check for errors

## Development Workflow

### Typical Development Session
```cmd
# 1. Navigate to project
cd C:\Users\acer\kediri-geoportal

# 2. Pull latest changes (if using Git)
git pull

# 3. Install any new dependencies
npm install

# 4. Start dev server
npm run dev

# 5. Make changes, test in browser

# 6. Commit changes
git add .
git commit -m "Description of changes"
git push
```

## Production Deployment Workflow

```cmd
# 1. Test locally
npm run build
npm run preview

# 2. Deploy to Vercel
vercel --prod

# 3. Test production URL
# Visit the URL provided by Vercel
```

---

**Pro Tip**: Keep this file open in a separate window for quick reference while developing!
