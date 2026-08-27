# scripts/gis-seed/01_final_pilot.py
import geopandas as gpd

PILOT_WATERSHED_ID = "g_mws.54029"

lgd = gpd.read_parquet("data/raw/villages/LGD_Villages.parquet")
watersheds = gpd.read_parquet("data/raw/watersheds/SLUSI_MicroWatersheds.parquet")

chamoli = lgd[lgd["dtname"].str.contains("Chamoli", case=False, na=False)].copy()

# Reproject to UTM Zone 44N (EPSG:32644) — correct projected CRS for
# Uttarakhand — before computing centroids. Geographic CRS (lat/lon)
# distorts distance/area math, which matters on steep hill terrain.
chamoli_projected = chamoli.to_crs(epsg=32644)
chamoli["centroid"] = chamoli_projected.geometry.centroid.to_crs(chamoli.crs)

joined = gpd.sjoin(
    chamoli.set_geometry("centroid"),
    watersheds[["id", "WATERSHED", "BASIN", "AREA", "geometry"]],
    how="left",
    predicate="within",
)

pilot = joined[joined["id"] == PILOT_WATERSHED_ID].copy()

# drop blank/junk village names
pilot = pilot[pilot["vilname11"].str.strip() != ""]
print(f"Final pilot villages: {len(pilot)}")
print(pilot["vilname11"].tolist())

# restore the REAL polygon geometry (not the centroid) for output —
# centroid was only a tool for the spatial join, not what we want to store
pilot = pilot.drop(columns=["centroid", "index_right"])
pilot = pilot.set_geometry(chamoli.loc[pilot.index, "geometry"])

pilot.to_file("data/processed/pilot_watershed_villages.geojson", driver="GeoJSON")
print("\nSaved: data/processed/pilot_watershed_villages.geojson")