# scripts/gis-seed/00_inspect.py
import geopandas as gpd

villages = gpd.read_parquet("data/raw/villages/Census_Villages.parquet")
print("VILLAGES columns:", list(villages.columns))
print(villages.head(2))
print("CRS:", villages.crs)
print()


lgd = gpd.read_parquet("data/raw/villages/LGD_Villages.parquet")
print("LGD_VILLAGES columns:", list(lgd.columns))
print(lgd.head(2))
print("CRS:", lgd.crs)

watersheds = gpd.read_parquet("data/raw/watersheds/SLUSI_MicroWatersheds.parquet")
print("WATERSHEDS columns:", list(watersheds.columns))
print(watersheds.head(2))
print("CRS:", watersheds.crs)
print()

flood = gpd.read_file("data/raw/flood/INDIA_FLOOD_INVENTORY_V3.geojson")
print("FLOOD columns:", list(flood.columns))
print(flood.head(2))