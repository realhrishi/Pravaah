# scripts/gis-seed/04_flood_frequency.py
import geopandas as gpd

pilot = gpd.read_file("data/processed/pilot_with_terrain.geojson")
flood = gpd.read_file("data/raw/flood/INDIA_FLOOD_INVENTORY_V3.geojson")

# match CRS before spatial join
flood = flood.to_crs(pilot.crs)

# count how many historical flood event polygons intersect each village
joined = gpd.sjoin(pilot, flood[["FID", "StartDate", "geometry"]], how="left", predicate="intersects")
event_counts = joined.groupby(joined.index)["FID"].nunique()

pilot["historical_event_freq"] = pilot.index.map(event_counts).fillna(0)
print(pilot[["vilname11", "historical_event_freq"]])

pilot.to_file("data/processed/pilot_final.geojson", driver="GeoJSON")
print("\nSaved: data/processed/pilot_final.geojson")