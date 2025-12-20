# 🔧 Import Troubleshooting Guide

## Common Issues and Solutions

### 1. Environment Variable Errors

#### Error Message
```
❌ Error: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY must be set in .env file
```

#### Solution
1. Check that `.env` file exists in project root
2. Verify it contains:
   ```
   VITE_SUPABASE_URL=https://wfelfwvvwtdvdcfcrlyh.supabase.co
   VITE_SUPABASE_ANON_KEY=your-key-here
   ```
3. Make sure there are no spaces around the `=` sign
4. Restart the import script

---

### 2. Row Level Security Errors

#### Error Message
```
❌ Batch insert error: new row violates row-level security policy
```

#### Solution
1. Verify all migrations 001-005 are run in Supabase
2. Check that RLS policies exist:
   ```sql
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE schemaname = 'government_data';
   ```
3. If no policies exist, run `004_create_rls_policies.sql`
4. Retry the import

---

### 3. "Invalid schema: government_data" Error

#### Error Message
```
❌ Connection failed: Invalid schema: government_data
```

#### Solution
This means you haven't exposed the schema in Supabase settings.

1. Go to Supabase Dashboard > Settings > API
2. Add `government_data` to **Exposed schemas**
3. See [EXPOSE_SCHEMA_GUIDE.md](EXPOSE_SCHEMA_GUIDE.md) for details

---

### 4. Geometry Validation Errors

#### Error Message
```
❌ Error processing feature: Invalid geometry
```

#### Solution
The script uses `ST_GeomFromGeoJSON` which auto-validates. If you still get errors:

1. Check the GeoJSON file is valid:
   ```cmd
   node -e "console.log(JSON.parse(require('fs').readFileSync('data/government/fix/filename.geojson')))"
   ```
2. Look for malformed coordinates
3. Try importing other files first
4. Report the specific feature that fails

---

### 4. Out of Memory Errors

#### Error Message
```
❌ JavaScript heap out of memory
```

#### Solution

**Option 1: Increase Node.js memory**
```cmd
set NODE_OPTIONS=--max-old-space-size=4096
node scripts/import-to-supabase.js
```

**Option 2: Import files individually**
Edit `scripts/import-to-supabase.js` and comment out large files:
```javascript
// await importBuildings();  // Skip for now
```

**Option 3: Close other applications**
- Close browser tabs
- Close other programs
- Restart computer

---

### 5. Network/Connection Errors

#### Error Message
```
❌ Batch insert error: fetch failed
❌ ECONNRESET
```

#### Solution
1. Check internet connection
2. Verify Supabase is accessible: https://wfelfwvvwtdvdcfcrlyh.supabase.co
3. Check Supabase status: https://status.supabase.com
4. Retry the import (script will continue from where it left off)
5. Reduce batch size in script:
   ```javascript
   const BATCH_SIZE = 50; // Reduce from 100
   ```

---

### 6. Import Takes Too Long

#### Issue
Import is running for hours

#### Solution

**Check progress:**
- Script shows real-time progress
- Buildings (381,950 features) take 30-45 minutes alone

**Speed up:**
1. Skip buildings temporarily:
   ```javascript
   // await importBuildings();
   ```
2. Import only essential data first
3. Run buildings overnight

**Expected times:**
- Admin boundaries: 3-4 minutes
- Land cover: 10 minutes
- Roads: 15 minutes
- Education: 5 seconds
- Buildings: 30-45 minutes
- **Total: ~60 minutes**

---

### 7. Duplicate Key Errors

#### Error Message
```
❌ duplicate key value violates unique constraint
```

#### Solution
Data was already imported. Options:

**Option 1: Clear existing data**
```sql
-- Run in Supabase SQL Editor
TRUNCATE government_data.admin_boundaries CASCADE;
TRUNCATE government_data.land_cover CASCADE;
TRUNCATE government_data.buildings CASCADE;
TRUNCATE government_data.roads CASCADE;
TRUNCATE government_data.education_points CASCADE;
```

**Option 2: Skip already imported files**
Comment out in script:
```javascript
// await importAdminBoundaries(...);  // Already done
```

---

### 8. File Not Found Errors

#### Error Message
```
⚠️ File not found, skipping...
```

#### Solution
1. Verify file exists in `data/government/fix/`
2. Check filename matches exactly (case-sensitive)
3. Ensure file is valid GeoJSON:
   ```cmd
   type data\government\fix\filename.geojson
   ```

---

### 9. Permission Errors

#### Error Message
```
❌ Error: permission denied
```

#### Solution
1. Make sure you're logged into Supabase
2. Check your Supabase API key has correct permissions
3. Verify you're using the `anon` key, not `service_role` key
4. Check RLS policies allow inserts

---

### 10. Data Not Appearing on Map

#### Issue
Import succeeded but data doesn't show on map

#### Solution

**Check data exists:**
```sql
SELECT COUNT(*) FROM government_data.admin_boundaries;
```

**Check geometry is valid:**
```sql
SELECT 
  id, 
  name, 
  ST_IsValid(geom) as is_valid,
  ST_GeometryType(geom) as geom_type
FROM government_data.admin_boundaries
LIMIT 10;
```

**Check map bounds:**
1. Open browser console (F12)
2. Look for JavaScript errors
3. Verify map is centered on Kediri:
   ```javascript
   center: [-7.8167, 112.0167]
   ```

**Refresh layers:**
1. Clear browser cache
2. Hard refresh (Ctrl + F5)
3. Check layer control is enabled

---

## 🔍 Debugging Tips

### Enable Verbose Logging

Edit `scripts/import-to-supabase.js` and add:
```javascript
console.log('Processing feature:', feature.properties);
```

### Check Supabase Logs

1. Go to Supabase Dashboard
2. Click "Logs" in sidebar
3. Select "Database" logs
4. Look for errors during import time

### Verify Database Connection

```javascript
// Add to top of import script
const { data, error } = await supabase.from('admin_boundaries').select('count');
console.log('Connection test:', data, error);
```

### Test with Small Dataset

Create a test file with just 10 features:
```cmd
node -e "const fs=require('fs'); const data=JSON.parse(fs.readFileSync('data/government/fix/land_cover.geojson')); data.features=data.features.slice(0,10); fs.writeFileSync('test.geojson', JSON.stringify(data));"
```

---

## 📊 Verification Queries

### Check Record Counts
```sql
SELECT 
  'admin_boundaries' as table_name, 
  COUNT(*) as records 
FROM government_data.admin_boundaries
UNION ALL
SELECT 'land_cover', COUNT(*) FROM government_data.land_cover
UNION ALL
SELECT 'buildings', COUNT(*) FROM government_data.buildings
UNION ALL
SELECT 'roads', COUNT(*) FROM government_data.roads
UNION ALL
SELECT 'education_points', COUNT(*) FROM government_data.education_points;
```

### Check Geometry Types
```sql
SELECT 
  ST_GeometryType(geom) as geom_type,
  COUNT(*) as count
FROM government_data.admin_boundaries
GROUP BY ST_GeometryType(geom);
```

### Check Spatial Extent
```sql
SELECT 
  ST_Extent(geom) as bbox
FROM government_data.admin_boundaries;
```

### Check for Invalid Geometries
```sql
SELECT 
  id, 
  name,
  ST_IsValid(geom) as is_valid,
  ST_IsValidReason(geom) as reason
FROM government_data.admin_boundaries
WHERE NOT ST_IsValid(geom);
```

---

## 🆘 Emergency Recovery

### If Import Fails Midway

The script processes in batches. To resume:

1. Check how many records were imported:
   ```sql
   SELECT COUNT(*) FROM government_data.buildings;
   ```

2. Modify script to skip already imported records:
   ```javascript
   const features = data.features.slice(ALREADY_IMPORTED_COUNT);
   ```

3. Re-run the script

### Complete Reset

If you need to start over:

```sql
-- WARNING: This deletes ALL government data
TRUNCATE government_data.admin_boundaries CASCADE;
TRUNCATE government_data.land_cover CASCADE;
TRUNCATE government_data.buildings CASCADE;
TRUNCATE government_data.roads CASCADE;
TRUNCATE government_data.education_points CASCADE;
```

Then re-run the import.

---

## 📞 Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Review console output for specific errors
3. ✅ Check Supabase logs
4. ✅ Verify all prerequisites are met
5. ✅ Try the suggested solutions

### Information to Provide

When reporting issues, include:

- Error message (exact text)
- Which file was being imported
- How many records were imported before error
- Node.js version: `node --version`
- Operating system
- Supabase project URL
- Console output (last 50 lines)

### Check These First

- [ ] All migrations 001-005 are run
- [ ] `.env` file exists and is correct
- [ ] `npm install` completed successfully
- [ ] Internet connection is stable
- [ ] Supabase is accessible
- [ ] GeoJSON files are valid

---

## 🎯 Success Indicators

You'll know it's working when:

✅ Console shows progress updates
✅ No error messages appear
✅ Record counts increase in Supabase
✅ Import completes with success message
✅ Verification query shows correct counts
✅ Data appears on map

---

**Still having issues?** Check the main [IMPORT_DATA_GUIDE.md](IMPORT_DATA_GUIDE.md) for more details.
