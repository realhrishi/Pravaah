# scripts/gis-seed/03_terrain_features.py
import geopandas as gpd
import rasterio
import numpy as np
from rasterstats import zonal_stats

pilot = gpd.read_file("data/processed/pilot_watershed_villages.geojson")

with rasterio.open("data/raw/dem/ALPSMLC30_N030E079_DSM.tif") as src:
    dem = src.read(1).astype(np.float64)
    transform = src.transform
    crs = src.crs
    # pixel size in degrees — convert to metres roughly for this latitude
    px_size_deg = transform[0]
    meters_per_deg = 111320  # approx at this latitude, good enough for slope calc
    cell_size_m = px_size_deg * meters_per_deg

print(f"Cell size: ~{cell_size_m:.1f} m")

# standard gradient-based slope/aspect — same underlying math as most
# GIS tools use (Horn's method simplified), just via numpy instead of a
# dedicated terrain library
dzdy, dzdx = np.gradient(dem, cell_size_m)

slope_rad = np.arctan(np.sqrt(dzdx**2 + dzdy**2))
slope_deg = np.degrees(slope_rad)

aspect_rad = np.arctan2(-dzdx, dzdy)
aspect_deg = np.degrees(aspect_rad)
aspect_deg = np.where(aspect_deg < 0, 90 - aspect_deg, np.where(aspect_deg > 90, 360 - aspect_deg + 90, 90 - aspect_deg))

def write_raster(array, path, ref_transform, ref_crs):
    with rasterio.open(
        path, "w", driver="GTiff", height=array.shape[0], width=array.shape[1],
        count=1, dtype=array.dtype, crs=ref_crs, transform=ref_transform,
    ) as dst:
        dst.write(array, 1)

write_raster(slope_deg, "data/processed/slope.tif", transform, crs)
write_raster(aspect_deg, "data/processed/aspect.tif", transform, crs)

print("Running zonal statistics per village...")
elevation_stats = zonal_stats(pilot, "data/raw/dem/ALPSMLC30_N030E079_DSM.tif", stats="mean")
slope_stats = zonal_stats(pilot, "data/processed/slope.tif", stats="mean")
aspect_stats = zonal_stats(pilot, "data/processed/aspect.tif", stats="mean")

pilot["elevation_m"] = [s["mean"] for s in elevation_stats]
pilot["slope_deg"] = [s["mean"] for s in slope_stats]
pilot["aspect_deg"] = [s["mean"] for s in aspect_stats]

print(pilot[["vilname11", "elevation_m", "slope_deg", "aspect_deg"]])

pilot.to_file("data/processed/pilot_with_terrain.geojson", driver="GeoJSON")
print("\nSaved: data/processed/pilot_with_terrain.geojson")