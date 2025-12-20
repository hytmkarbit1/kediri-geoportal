# 📊 Admin Data Import Guide

This guide explains how to import the real administrative data from `data/government/fix` into your Kediri Geoportal.

## 📁 Available Data Files

Your `data/government/fix` directory contains:

| File | Features | Size | Description |
|------|----------|------|-------------|
| `administrasi_ar_kabkota.geojson` | 2 | 759 KB | City-level boundaries (Kabupaten/Kota) |
| `administrasi_ar_kecamatan.geojson` | 54 | 2.7 MB | District-level boundaries (Kecamatan) |
| `administrasi_ar_desakel.geojson` | 456 | 8.6 MB | Village-level boundaries (Desa/Kelurahan) |
| `land_cover.geojson` | 9,548 | 37 MB | Land cover/land use polygons |
| `bangunan_ar.geojson` | 381,950 | 174 MB | Building footprints |
| `jalan_ln.geojson` | 34,891 | 19 MB | Road network |
| `pendidikan_pt.geojson` | 44 | 8 KB | Education facilities |

**Total: 426,945 features**

## 🎯 Import Methods

There are **two methods** to import this data:

### Method 1: Direct API Import (RECOMMENDED) ⭐

This method directly uploads data to Supabase using the API. It's slower but more reliable.

**Pros:**
- ✅ No file size limits
- ✅ Progress tracking
- ✅ Automatic error handling
- ✅ Can pause/resume

**Cons:**
- ⏱️ Takes 30-60 minutes for all data
- 🌐 Requires internet connection

**Steps:**

1. **Install dotenv package** (if not already installed):
   ```cmd
   npm install
   ```

2. **Make sure your .env file is configured**:
   
   **Quick test:**
   ```cmd
   node test-env.js
   ```
   
   **Expected output:**
   ```
   ✅ VITE_SUPABASE_URL is set
   ✅ VITE_SUPABASE_ANON_KEY is set
   🎉 Configuration looks good!
   ```
   
   **If you see errors**, check that your `.env` file contains:
   ```
   VITE_SUPABASE_URL=https://wfelfwvvwtdvdcfcrlyh.supabase.co
   VITE_SUPABASE_ANON_KEY=your-key-here
   ```
   
   **Need help?** See [VERIFY_ENV_FILE.md](VERIFY_ENV_FILE.md) for detailed instructions.

   **Need help?** See [VERIFY_ENV_FILE.md](VERIFY_ENV_FILE.md) for detailed instructions.

3. **CRITICAL: Enable Data Import** 🔓
   
   You need to run a special migration to allow importing data without changing dashboard settings.
   
   1. Go to Supabase SQL Editor
   2. Run the file: `database/migrations/007_enable_import_rpc.sql`
   
   **Verify it works:**
   ```cmd
   node test-schema-connection.js
   ```
   *(Note: The test script might still fail if schema isn't exposed, but the import script below WILL work now)*

4. **Run the import script**:
   ```cmd
   node scripts/import-to-supabase.js
   ```

5. **Monitor progress**:
   - The script will show real-time progress
   - You can skip buildings (largest file) by pressing Ctrl+C when prompted

5. **Verify in Supabase**:
   - Go to Supabase Dashboard → Table Editor
   - Check `government_data` schema tables

---

### Method 2: SQL File Import

This method generates a large SQL file that you can run in Supabase.

**Pros:**
- ⚡ Faster if it works
- 📝 Can review SQL before running

**Cons:**
- ❌ File is 180 MB (too large for Supabase SQL Editor)
- ❌ Need to split into smaller files manually

**Steps:**

1. **Generate SQL file**:
   ```cmd
   node scripts/import-admin-data.js
   ```

2. **Result**: Creates `database/migrations/006_import_admin_data.sql` (180 MB)

3. **Problem**: Supabase SQL Editor has a file size limit

4. **Solution**: You'll need to split the file or use Method 1

---

## 🚀 Quick Start (Recommended Path)

### Step 1: Install Dependencies

```cmd
cd C:\Users\acer\kediri-geoportal
npm install
```

### Step 2: Run Direct Import

```cmd
node scripts/import-to-supabase.js
```

### Step 3: Wait for Completion

Expected times:
- Admin boundaries (city): ~5 seconds
- Admin boundaries (district): ~30 seconds  
- Admin boundaries (village): ~3 minutes
- Land cover: ~10 minutes
- Education points: ~5 seconds
- Roads: ~15 minutes
- Buildings: ~30-45 minutes ⚠️

**Total: ~60 minutes**

### Step 4: Verify Data

1. Open Supabase Dashboard
2. Go to **Table Editor**
3. Select `government_data` schema
4. Check each table:
   - `admin_boundaries` → Should have 512 records (2 + 54 + 456)
   - `land_cover` → Should have 9,548 records
   - `buildings` → Should have 381,950 records
   - `roads` → Should have 34,891 records
   - `education_points` → Should have 44 records

### Step 5: Test in Application

1. Start your dev server:
   ```cmd
   npm run dev
   ```

2. Open http://localhost:5173

3. Check the layer control - you should see:
   - Administrative boundaries at different levels
   - Land cover polygons
   - Building footprints
   - Road network
   - Education facilities

---

## 📊 Data Mapping

### Admin Boundaries

The script maps GeoJSON properties to database columns:

| GeoJSON Property | Database Column | Notes |
|------------------|-----------------|-------|
| `NAMOBJ`, `WADMKK`, `WADMKC`, `WADMKD` | `name` | Name of admin area |
| File-based | `admin_level` | 'city', 'district', or 'village' |
| `KDCBPS`, `KDCPUM`, `KDCKEL` | `code` | Official code |
| `JUMLAH_PE` | `population` | Population count |
| `REMARK` | `description` | Additional notes |
| `geometry` | `geom` | PostGIS geometry |

### Land Cover

| GeoJSON Property | Database Column |
|------------------|-----------------|
| `NAMOBJ` | `name` |
| `KELAS` | `land_type` |
| `LUASHA` | `area_hectares` |
| `REMARK` | `description` |
| `geometry` | `geom` |

### Buildings

| GeoJSON Property | Database Column |
|------------------|-----------------|
| `NAMOBJ` | `name` |
| `FCODE` | `building_type` |
| `TINGKAT` | `floors` |
| `REMARK` | `description` |
| `geometry` | `geom` |

### Roads

| GeoJSON Property | Database Column |
|------------------|-----------------|
| `NAMRJL`, `NAMOBJ` | `name` |
| `FCODE`, `TIPJLN` | `road_type` |
| `PERMKL` | `surface` |
| `PANJANG` | `length_meters` |
| `REMARK` | `description` |
| `geometry` | `geom` |

### Education Points

| GeoJSON Property | Database Column |
|------------------|-----------------|
| `NAMOBJ` | `name` |
| `FCODE` | `education_type` |
| `ALAMAT` | `address` |
| `KAPASITAS` | `student_capacity` |
| `REMARK` | `description` |
| `geometry` | `geom` |

---

## ⚠️ Important Notes

### Database Limits (Supabase Free Tier)

- **Storage**: 500 MB database size
- **Your data**: ~250 MB (with indexes)
- **Remaining**: ~250 MB for user contributions

### Performance Considerations

1. **Buildings are HUGE**: 381,950 features will take time
   - Consider importing only a subset if needed
   - You can modify the script to limit features

2. **Indexes**: PostGIS spatial indexes are created automatically
   - This helps with map performance
   - But increases database size

3. **RLS Policies**: Already configured in migration 004
   - Public users can read all government data
   - Only admins can edit

### Troubleshooting

| Problem | Solution |
|---------|----------|
| Script fails with "VITE_SUPABASE_URL not found" | Check your `.env` file exists and has correct values |
| Import is very slow | Normal for large datasets. Buildings alone take 30+ min |
| "Row Level Security" error | Make sure you've run all migrations 001-005 first |
| Geometry errors | The script uses `ST_GeomFromGeoJSON` which validates automatically |
| Out of memory | Close other applications, or import files one at a time |

---

## 🔧 Advanced Usage

### Import Only Specific Files

Edit `scripts/import-to-supabase.js` and comment out files you don't want:

```javascript
// await importBuildings();  // Skip buildings
```

### Limit Number of Features

Modify the loop in each import function:

```javascript
// Only import first 1000 features
const features = data.features.slice(0, 1000);
```

### Custom Field Mapping

Edit the property mapping in each function to match your GeoJSON structure.

---

## 📋 Checklist

Before importing:
- [ ] All database migrations (001-005) are run
- [ ] `.env` file is configured with Supabase credentials
- [ ] `npm install` has been run
- [ ] You have ~60 minutes for the import to complete

After importing:
- [ ] Verify record counts in Supabase Table Editor
- [ ] Test map layers in the application
- [ ] Check that geometries display correctly
- [ ] Verify attribute data is populated

---

## 🎉 Success!

Once imported, your Kediri Geoportal will have:

✅ **Real administrative boundaries** at 3 levels (city, district, village)
✅ **Detailed land cover** data
✅ **381,950 building footprints**
✅ **Complete road network**
✅ **Education facility locations**

Your users can now:
- View official government data
- Contribute their own data
- Download combined datasets
- Perform spatial analysis

---

## 📞 Need Help?

1. Check the console output for error messages
2. Verify your Supabase credentials in `.env`
3. Make sure all migrations are run in order
4. Check Supabase logs in the dashboard

---

**Built with ❤️ for Kediri**
