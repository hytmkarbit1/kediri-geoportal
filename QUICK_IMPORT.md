# 🚀 Quick Import Reference

## One-Command Import

```cmd
node scripts/import-to-supabase.js
```

## What Gets Imported

| Data Type | Records | Time |
|-----------|---------|------|
| City boundaries | 2 | 5s |
| District boundaries | 54 | 30s |
| Village boundaries | 456 | 3m |
| Land cover | 9,548 | 10m |
| Education points | 44 | 5s |
| Roads | 34,891 | 15m |
| Buildings | 381,950 | 45m |
| **TOTAL** | **426,945** | **~60m** |

## Prerequisites

✅ Database migrations 001-005 completed
✅ `.env` file configured
✅ `npm install` completed

## Verify Success

```sql
-- Run in Supabase SQL Editor
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

Expected results:
- admin_boundaries: **512**
- land_cover: **9,548**
- buildings: **381,950**
- roads: **34,891**
- education_points: **44**

## Troubleshooting

| Error | Fix |
|-------|-----|
| "VITE_SUPABASE_URL not found" | Check `.env` file |
| "Row Level Security" error | Run migrations 001-005 |
| Very slow | Normal - buildings take 45 min |
| Out of memory | Close other apps |

## Skip Buildings (Optional)

If you want to skip the large building dataset:

1. Open `scripts/import-to-supabase.js`
2. Comment out line with `await importBuildings();`
3. Save and run

This reduces import time to ~15 minutes.
