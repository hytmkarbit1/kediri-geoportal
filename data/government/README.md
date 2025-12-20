# Government Data Import Guide

This folder contains sample government data for Kediri in GeoJSON format.

## Files Created

1. **land_cover.geojson** - 5 land cover polygons (urban, agriculture, park, residential, forest)
2. **admin_boundaries.geojson** - 6 administrative boundaries (1 city, 3 districts, 2 villages)
3. **education_points.geojson** - 8 education facilities (kindergarten to university)
4. **commercial_points.geojson** - 10 commercial points of interest
5. **roads.geojson** - 8 major roads in Kediri
6. **buildings.geojson** - 8 important building footprints

## How to Import to Database

You have two options to import this data:

### Option 1: Using QGIS (Recommended)

1. **Install QGIS** (if not already installed): https://qgis.org/download/
2. **Open QGIS** and create a new project
3. **Add PostGIS Connection**:
   - Layer → Add Layer → Add PostGIS Layers
   - Click "New" to create connection
   - Name: Kediri Geoportal
   - Host: db.wfelfwvvwtdvdcfcrlyh.supabase.co
   - Port: 5432
   - Database: postgres
   - Get credentials from Supabase Dashboard → Settings → Database
4. **Import each GeoJSON file**:
   - Drag and drop GeoJSON file into QGIS
   - Right-click layer → Export → Save Features As
   - Format: PostgreSQL
   - Connection: Select your Supabase connection
   - Schema: government_data
   - Table: (match the filename, e.g., land_cover)
   - Geometry column: geom
   - SRID: 4326

### Option 2: Using SQL (Manual)

Run this SQL in Supabase SQL Editor for each dataset. Example for education points:

```sql
INSERT INTO government_data.education_points (name, education_type, address, student_capacity, description, geom)
VALUES 
('SDN Kediri 1', 'elementary', 'Jl. Brawijaya No. 45', 480, 'Public Elementary School', 
 ST_SetSRID(ST_MakePoint(112.0167, -7.8167), 4326)),
('SMPN 1 Kediri', 'junior_high', 'Jl. Veteran No. 12', 720, 'Public Junior High School', 
 ST_SetSRID(ST_MakePoint(112.0180, -7.8150), 4326)),
('SMAN 1 Kediri', 'senior_high', 'Jl. Pemuda No. 8', 960, 'Public Senior High School', 
 ST_SetSRID(ST_MakePoint(112.0145, -7.8185), 4326)),
('Universitas Nusantara PGRI Kediri', 'university', 'Jl. KH. Ahmad Dahlan No. 76', 5000, 'Private University - Teacher Training', 
 ST_SetSRID(ST_MakePoint(112.0125, -7.8200), 4326)),
('TK Pembina Kediri', 'kindergarten', 'Jl. Pahlawan No. 23', 120, 'Public Kindergarten', 
 ST_SetSRID(ST_MakePoint(112.0190, -7.8140), 4326)),
('SDN Kediri 5', 'elementary', 'Jl. Sukarno Hatta No. 67', 420, 'Public Elementary School', 
 ST_SetSRID(ST_MakePoint(112.0210, -7.8175), 4326)),
('SMKN 2 Kediri', 'senior_high', 'Jl. Industri No. 34', 840, 'Vocational High School', 
 ST_SetSRID(ST_MakePoint(112.0155, -7.8125), 4326)),
('Institut Agama Islam Tribakti', 'university', 'Jl. Telaga Warna', 3500, 'Islamic Higher Education Institute', 
 ST_SetSRID(ST_MakePoint(112.0095, -7.8220), 4326));
```

Repeat for other datasets, adjusting table names and fields accordingly.

### Option 3: Using ogr2ogr Command Line

If you have GDAL installed:

```bash
ogr2ogr -f "PostgreSQL" \
  PG:"host=db.wfelfwvvwtdvdcfcrlyh.supabase.co dbname=postgres user=postgres password=YOUR_PASSWORD" \
  land_cover.geojson \
  -nln government_data.land_cover \
  -lco GEOMETRY_NAME=geom \
  -lco FID=id \
  -a_srs EPSG:4326
```

## Verify Import

After importing, verify in Supabase SQL Editor:

```sql
-- Check record counts
SELECT 'land_cover' as table_name, COUNT(*) as count FROM government_data.land_cover
UNION ALL
SELECT 'admin_boundaries', COUNT(*) FROM government_data.admin_boundaries
UNION ALL
SELECT 'education_points', COUNT(*) FROM government_data.education_points
UNION ALL
SELECT 'commercial_points', COUNT(*) FROM government_data.commercial_points
UNION ALL
SELECT 'roads', COUNT(*) FROM government_data.roads
UNION ALL
SELECT 'buildings', COUNT(*) FROM government_data.buildings;
```

Expected counts:
- land_cover: 5
- admin_boundaries: 6
- education_points: 8
- commercial_points: 10
- roads: 8
- buildings: 8

## View on Map

After importing, refresh your geoportal application and the data should appear on the map automatically!

## Notes

- All coordinates are in WGS84 (EPSG:4326)
- This is sample data for demonstration purposes
- Replace with actual Kediri government data when available
- You can edit this data through the admin interface after logging in as admin
