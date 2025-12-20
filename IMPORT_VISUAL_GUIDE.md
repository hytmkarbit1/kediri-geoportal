# 🗺️ Admin Data Import - Visual Guide

## 📊 Data Flow Diagram

```mermaid
graph TD
    A[Your GeoJSON Files<br/>426,945 features] --> B{Choose Import Method}
    
    B -->|Method 1: Direct API| C[import-to-supabase.js]
    B -->|Method 2: SQL File| D[import-admin-data.js]
    
    C --> E[Batch Processing<br/>100 records at a time]
    E --> F[Supabase API]
    F --> G[PostGIS Database]
    
    D --> H[Generate SQL<br/>006_import_admin_data.sql<br/>180 MB]
    H --> I[Split Files<br/>Manual Step]
    I --> J[Supabase SQL Editor]
    J --> G
    
    G --> K[Your Geoportal Map]
    
    style C fill:#90EE90
    style E fill:#90EE90
    style F fill:#90EE90
    style G fill:#4169E1,color:#fff
    style K fill:#FFD700
```

## 📁 File Structure

```
C:\Users\acer\kediri-geoportal\
│
├── data/government/fix/           ← YOUR DATA (426,945 features)
│   ├── administrasi_ar_kabkota.geojson      (2 features)
│   ├── administrasi_ar_kecamatan.geojson    (54 features)
│   ├── administrasi_ar_desakel.geojson      (456 features)
│   ├── land_cover.geojson                   (9,548 features)
│   ├── bangunan_ar.geojson                  (381,950 features) ⚠️ LARGE
│   ├── jalan_ln.geojson                     (34,891 features)
│   └── pendidikan_pt.geojson                (44 features)
│
├── scripts/                       ← IMPORT SCRIPTS (NEW)
│   ├── import-admin-data.js       (Generates SQL file)
│   └── import-to-supabase.js      (Direct API import) ⭐
│
├── database/migrations/
│   ├── 001_create_schemas.sql
│   ├── 002_create_government_tables.sql
│   ├── 003_create_crowd_tables.sql
│   ├── 004_create_rls_policies.sql
│   ├── 005_create_triggers.sql
│   └── 006_import_admin_data.sql  ← GENERATED (180 MB)
│
├── IMPORT_DATA_GUIDE.md           ← DOCUMENTATION (NEW)
├── QUICK_IMPORT.md                ← QUICK REFERENCE (NEW)
└── README.md                      ← UPDATED
```

## 🎯 Import Process Timeline

```mermaid
gantt
    title Import Timeline (~60 minutes)
    dateFormat  mm:ss
    axisFormat %M:%S
    
    section Admin Boundaries
    City (2)           :00:00, 00:05
    District (54)      :00:05, 00:30
    Village (456)      :00:35, 03:00
    
    section Other Data
    Land Cover (9,548) :03:00, 10:00
    Education (44)     :13:00, 00:05
    Roads (34,891)     :13:05, 15:00
    
    section Large Dataset
    Buildings (381,950):28:05, 45:00
```

## 🗄️ Database Schema Mapping

```mermaid
graph LR
    A[GeoJSON Files] --> B[Import Script]
    
    B --> C1[admin_boundaries<br/>512 records]
    B --> C2[land_cover<br/>9,548 records]
    B --> C3[buildings<br/>381,950 records]
    B --> C4[roads<br/>34,891 records]
    B --> C5[education_points<br/>44 records]
    
    C1 --> D[government_data schema]
    C2 --> D
    C3 --> D
    C4 --> D
    C5 --> D
    
    D --> E[PostGIS Indexes]
    E --> F[Map Layers]
    
    style A fill:#FFE4B5
    style D fill:#4169E1,color:#fff
    style F fill:#32CD32,color:#fff
```

## 📈 Data Distribution

```
Total Features: 426,945

Buildings:        381,950  ████████████████████████████████████████ 89.5%
Roads:             34,891  ███                                       8.2%
Land Cover:         9,548  ██                                        2.2%
Villages:             456  ▏                                         0.1%
Districts:             54  ▏                                         0.01%
Education:             44  ▏                                         0.01%
City:                   2  ▏                                         0.001%
```

## 🔄 Field Mapping Examples

### Admin Boundaries (Indonesian → English)

```
GeoJSON (Indonesian)          Database (English)
┌─────────────────────┐      ┌──────────────────┐
│ NAMOBJ              │ ───→ │ name             │
│ WADMKK/WADMKC/WADMKD│ ───→ │ name             │
│ KDCBPS/KDCPUM/KDCKEL│ ───→ │ code             │
│ JUMLAH_PE           │ ───→ │ population       │
│ REMARK              │ ───→ │ description      │
│ geometry            │ ───→ │ geom (PostGIS)   │
└─────────────────────┘      └──────────────────┘
```

### Land Cover

```
GeoJSON                Database
┌─────────────┐       ┌─────────────────┐
│ NAMOBJ      │ ───→  │ name            │
│ KELAS       │ ───→  │ land_type       │
│ LUASHA      │ ───→  │ area_hectares   │
│ REMARK      │ ───→  │ description     │
│ geometry    │ ───→  │ geom            │
└─────────────┘       └─────────────────┘
```

### Roads

```
GeoJSON                Database
┌─────────────┐       ┌─────────────────┐
│ NAMRJL      │ ───→  │ name            │
│ FCODE       │ ───→  │ road_type       │
│ PERMKL      │ ───→  │ surface         │
│ PANJANG     │ ───→  │ length_meters   │
│ REMARK      │ ───→  │ description     │
│ geometry    │ ───→  │ geom            │
└─────────────┘       └─────────────────┘
```

## 🚀 Quick Command Reference

### Install Dependencies
```cmd
npm install
```

### Run Import (Recommended)
```cmd
node scripts/import-to-supabase.js
```

### Generate SQL File (Alternative)
```cmd
node scripts/import-admin-data.js
```

### Verify Import
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

### Start Dev Server
```cmd
npm run dev
```

## ✅ Success Checklist

```
Before Import:
☐ Database migrations 001-005 completed
☐ .env file configured
☐ npm install completed
☐ ~60 minutes available

During Import:
☐ Monitor console output
☐ Check for errors
☐ Wait for completion message

After Import:
☐ Verify record counts in Supabase
☐ Test map layers
☐ Check geometry rendering
☐ Verify attribute data
```

## 🎯 Expected Results

### Supabase Table Editor

```
government_data schema:
├── admin_boundaries     [512 rows]     ✓
├── land_cover          [9,548 rows]    ✓
├── buildings           [381,950 rows]  ✓
├── roads               [34,891 rows]   ✓
└── education_points    [44 rows]       ✓
```

### Map Interface

```
Layer Control:
├── 🗺️ Administrative Boundaries
│   ├── City (Kediri)
│   ├── Districts (54)
│   └── Villages (456)
├── 🌳 Land Cover (9,548)
├── 🏢 Buildings (381,950)
├── 🛣️ Roads (34,891)
└── 🎓 Education (44)
```

---

**Ready to import? Run:** `node scripts/import-to-supabase.js`
