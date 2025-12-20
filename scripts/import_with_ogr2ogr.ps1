# Import Government Data to Supabase
# This script uses ogr2ogr (GDAL) to import large GeoJSON files

# IMPORTANT: You need to get your database password from Supabase first
# Go to: https://supabase.com/dashboard/project/wfelfwvvwtdvdcfcrlyh/settings/database
# Copy the password

$DB_HOST = "db.wfelfwvvwtdvdcfcrlyh.supabase.co"
$DB_PORT = "5432"
$DB_NAME = "postgres"
$DB_USER = "postgres"
$DB_PASSWORD = "YOUR_DATABASE_PASSWORD_HERE"  # Replace with actual password

$DATA_DIR = "C:\Users\acer\kediri-geoportal\data\government\fix"

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host "KEDIRI GEOPORTAL - DATA IMPORT USING OGRE2OGR" -ForegroundColor Green
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host ""

# Check if ogr2ogr is available
try {
    $null = Get-Command ogr2ogr -ErrorAction Stop
    Write-Host "✓ ogr2ogr found" -ForegroundColor Green
} catch {
    Write-Host "✗ ogr2ogr not found. Please install GDAL first:" -ForegroundColor Red
    Write-Host "  Download from: https://gdal.org/download.html" -ForegroundColor Yellow
    Write-Host "  Or use OSGeo4W: https://trac.osgeo.org/osgeo4w/" -ForegroundColor Yellow
    exit 1
}

# Connection string
$PG_CONN = "PG:host=$DB_HOST port=$DB_PORT dbname=$DB_NAME user=$DB_USER password=$DB_PASSWORD"

# Import admin boundaries - village level
Write-Host "`n📂 Importing: administrasi_ar_desakel.geojson" -ForegroundColor Cyan
Write-Host "   Target: government_data.admin_boundaries (village)" -ForegroundColor Gray
ogr2ogr -f "PostgreSQL" $PG_CONN `
    "$DATA_DIR\administrasi_ar_desakel.geojson" `
    -nln "government_data.admin_boundaries" `
    -append `
    -lco GEOMETRY_NAME=geom `
    -a_srs EPSG:4326 `
    -sql "SELECT NAMOBJ as name, 'village' as admin_level, KDPPUM as code, REMARK as description, geometry FROM administrasi_ar_desakel"

# Import admin boundaries - district level  
Write-Host "`n📂 Importing: administrasi_ar_kecamatan.geojson" -ForegroundColor Cyan
Write-Host "   Target: government_data.admin_boundaries (district)" -ForegroundColor Gray
ogr2ogr -f "PostgreSQL" $PG_CONN `
    "$DATA_DIR\administrasi_ar_kecamatan.geojson" `
    -nln "government_data.admin_boundaries" `
    -append `
    -lco GEOMETRY_NAME=geom `
    -a_srs EPSG:4326 `
    -sql "SELECT NAMOBJ as name, 'district' as admin_level, KDPPUM as code, REMARK as description, geometry FROM administrasi_ar_kecamatan"

# Import admin boundaries - city level
Write-Host "`n📂 Importing: administrasi_ar_kabkota.geojson" -ForegroundColor Cyan
Write-Host "   Target: government_data.admin_boundaries (city)" -ForegroundColor Gray
ogr2ogr -f "PostgreSQL" $PG_CONN `
    "$DATA_DIR\administrasi_ar_kabkota.geojson" `
    -nln "government_data.admin_boundaries" `
    -append `
    -lco GEOMETRY_NAME=geom `
    -a_srs EPSG:4326 `
    -sql "SELECT NAMOBJ as name, 'city' as admin_level, KDPPUM as code, REMARK as description, geometry FROM administrasi_ar_kabkota"

# Import buildings
Write-Host "`n📂 Importing: bangunan_ar.geojson" -ForegroundColor Cyan
Write-Host "   Target: government_data.buildings" -ForegroundColor Gray
Write-Host "   ⚠️  This is a large file (174MB), may take several minutes..." -ForegroundColor Yellow
ogr2ogr -f "PostgreSQL" $PG_CONN `
    "$DATA_DIR\bangunan_ar.geojson" `
    -nln "government_data.buildings" `
    -append `
    -lco GEOMETRY_NAME=geom `
    -a_srs EPSG:4326 `
    -sql "SELECT NAMOBJ as name, FCODE as building_type, REMARK as description, geometry FROM bangunan_ar" `
    -progress

# Import roads
Write-Host "`n📂 Importing: jalan_ln.geojson" -ForegroundColor Cyan
Write-Host "   Target: government_data.roads" -ForegroundColor Gray
ogr2ogr -f "PostgreSQL" $PG_CONN `
    "$DATA_DIR\jalan_ln.geojson" `
    -nln "government_data.roads" `
    -append `
    -lco GEOMETRY_NAME=geom `
    -a_srs EPSG:4326 `
    -sql "SELECT NAMRJL as name, FCODE as road_type, REMARK as description, geometry FROM jalan_ln" `
    -progress

# Import land cover
Write-Host "`n📂 Importing: land_cover.geojson" -ForegroundColor Cyan
Write-Host "   Target: government_data.land_cover" -ForegroundColor Gray
Write-Host "   ⚠️  This is a large file (37MB), may take a few minutes..." -ForegroundColor Yellow
ogr2ogr -f "PostgreSQL" $PG_CONN `
    "$DATA_DIR\land_cover.geojson" `
    -nln "government_data.land_cover" `
    -append `
    -lco GEOMETRY_NAME=geom `
    -a_srs EPSG:4326 `
    -sql "SELECT NAMOBJ as name, FCODE as land_type, REMARK as description, geometry FROM land_cover" `
    -progress

# Import education points
Write-Host "`n📂 Importing: pendidikan_pt.geojson" -ForegroundColor Cyan
Write-Host "   Target: government_data.education_points" -ForegroundColor Gray
ogr2ogr -f "PostgreSQL" $PG_CONN `
    "$DATA_DIR\pendidikan_pt.geojson" `
    -nln "government_data.education_points" `
    -append `
    -lco GEOMETRY_NAME=geom `
    -a_srs EPSG:4326 `
    -sql "SELECT NAMOBJ as name, 'university' as education_type, REMARK as address, REMARK as description, geometry FROM pendidikan_pt"

Write-Host "`n" -NoNewline
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host "✅ IMPORT COMPLETE!" -ForegroundColor Green
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 59) -ForegroundColor Cyan
Write-Host "`nRefresh your geoportal to see the data on the map!" -ForegroundColor Yellow
