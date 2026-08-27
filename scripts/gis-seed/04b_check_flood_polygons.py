# scripts/gis-seed/04b_check_flood_polygons.py
import geopandas as gpd

pilot = gpd.read_file("data/processed/pilot_final.geojson")
flood = gpd.read_file("data/raw/flood/INDIA_FLOOD_INVENTORY_V3.geojson")
flood = flood.to_crs(pilot.crs)

joined = gpd.sjoin(pilot, flood[["FID", "StartDate", "geometry"]], how="left", predicate="intersects")
matched_ids = joined["FID"].dropna().unique()
print("The 2 matching flood events:")
print(joined[joined["FID"].isin(matched_ids)][["FID", "StartDate"]].drop_duplicates())

matching_polys = flood[flood["FID"].isin(matched_ids)]
print("\nApprox area of each event polygon (deg²):")
print(matching_polys.geometry.area)