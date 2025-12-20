"""
Import Government Data to Supabase
This script imports GeoJSON files from the data/government/fix folder into Supabase
"""

import json
import os
from supabase import create_client, Client

# Supabase configuration
SUPABASE_URL = "https://wfelfwvvwtdvdcfcrlyh.supabase.co"
SUPABASE_KEY = "sb_publishable_KWxkEwhRFXYy6F3O_pfEyA_3GI1X4os"

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# File mapping: filename -> (schema.table, field_mapping)
FILE_MAPPINGS = {
    "administrasi_ar_desakel.geojson": {
        "table": "government_data.admin_boundaries",
        "fields": {
            "name": "NAMOBJ",  # Adjust based on actual field names
            "admin_level": lambda props: "village",
            "code": "KDPPUM",
            "description": "REMARK"
        }
    },
    "administrasi_ar_kecamatan.geojson": {
        "table": "government_data.admin_boundaries",
        "fields": {
            "name": "NAMOBJ",
            "admin_level": lambda props: "district",
            "code": "KDPPUM",
            "description": "REMARK"
        }
    },
    "administrasi_ar_kabkota.geojson": {
        "table": "government_data.admin_boundaries",
        "fields": {
            "name": "NAMOBJ",
            "admin_level": lambda props: "city",
            "code": "KDPPUM",
            "description": "REMARK"
        }
    },
    "bangunan_ar.geojson": {
        "table": "government_data.buildings",
        "fields": {
            "name": "NAMOBJ",
            "building_type": "FCODE",
            "description": "REMARK"
        }
    },
    "jalan_ln.geojson": {
        "table": "government_data.roads",
        "fields": {
            "name": "NAMRJL",
            "road_type": "FCODE",
            "description": "REMARK"
        }
    },
    "land_cover.geojson": {
        "table": "government_data.land_cover",
        "fields": {
            "name": "NAMOBJ",
            "land_type": "FCODE",
            "description": "REMARK"
        }
    },
    "pendidikan_pt.geojson": {
        "table": "government_data.education_points",
        "fields": {
            "name": "NAMOBJ",
            "education_type": lambda props: "university",  # Adjust based on data
            "address": "REMARK",
            "description": "REMARK"
        }
    }
}

def read_geojson(filepath):
    """Read GeoJSON file"""
    print(f"Reading {filepath}...")
    with open(filepath, 'r', encoding='utf-8') as f:
        return json.load(f)

def map_properties(properties, field_mapping):
    """Map GeoJSON properties to database fields"""
    mapped = {}
    for db_field, source_field in field_mapping.items():
        if callable(source_field):
            mapped[db_field] = source_field(properties)
        elif source_field in properties:
            mapped[db_field] = properties[source_field]
        else:
            mapped[db_field] = None
    return mapped

def import_file(filepath, config):
    """Import a single GeoJSON file"""
    try:
        data = read_geojson(filepath)
        features = data.get('features', [])
        
        if not features:
            print(f"No features found in {filepath}")
            return
        
        print(f"Found {len(features)} features")
        
        # Process in batches
        batch_size = 100
        total_imported = 0
        
        for i in range(0, len(features), batch_size):
            batch = features[i:i+batch_size]
            records = []
            
            for feature in batch:
                props = feature.get('properties', {})
                geom = feature.get('geometry')
                
                # Map properties
                record = map_properties(props, config['fields'])
                record['geom'] = geom
                
                records.append(record)
            
            # Insert batch
            try:
                result = supabase.table(config['table']).insert(records).execute()
                total_imported += len(records)
                print(f"Imported {total_imported}/{len(features)} features...")
            except Exception as e:
                print(f"Error inserting batch: {e}")
                continue
        
        print(f"✅ Successfully imported {total_imported} features from {os.path.basename(filepath)}")
        
    except Exception as e:
        print(f"❌ Error importing {filepath}: {e}")

def main():
    """Main import function"""
    data_dir = r"C:\Users\acer\kediri-geoportal\data\government\fix"
    
    print("=" * 60)
    print("KEDIRI GEOPORTAL - DATA IMPORT")
    print("=" * 60)
    print()
    
    for filename, config in FILE_MAPPINGS.items():
        filepath = os.path.join(data_dir, filename)
        
        if not os.path.exists(filepath):
            print(f"⚠️  File not found: {filename}")
            continue
        
        print(f"\n📂 Processing: {filename}")
        print(f"   Target: {config['table']}")
        print("-" * 60)
        
        import_file(filepath, config)
    
    print("\n" + "=" * 60)
    print("IMPORT COMPLETE!")
    print("=" * 60)

if __name__ == "__main__":
    main()
