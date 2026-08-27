# scripts/gis-seed/02_check_dem_coverage.py
import geopandas as gpd
import rasterio

pilot = gpd.read_file("data/processed/pilot_watershed_villages.geojson")
print("Pilot villages bounding box (lon/lat):")
print(pilot.total_bounds)

with rasterio.open("data/raw/dem/ALPSMLC30_N030E079_DSM.tif") as dem:
    print("\nDEM tile bounding box:")
    print(dem.bounds)
    print("DEM CRS:", dem.crs)

    b = dem.bounds
    px = pilot.total_bounds
    covers = (b.left <= px[0] and b.bottom <= px[1] and b.right >= px[2] and b.top >= px[3])
    print(f"\nDEM fully covers pilot villages: {covers}")