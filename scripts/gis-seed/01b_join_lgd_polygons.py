# scripts/gis-seed/01b_join_lgd_polygons.py
import geopandas as gpd

# ⚠️ set this to the watershed_id you picked from Step 1's candidate list
PILOT_WATERSHED_ID = "g_mws.XXXXXX"  # <-- fill in your actual chosen id

lgd = gpd.read_parquet("data/raw/villages/LGD_Villages.parquet")
chamoli_polygons = lgd[lgd["dtname"].str.contains("Chamoli", case=False, na=False)]

all_chamoli = gpd.read_file("data/processed/chamoli_villages_with_watershed.geojson")

# narrow to ONLY your pilot watershed — should drop from 1350 to ~5-15
pilot = all_chamoli[all_chamoli["id"] == PILOT_WATERSHED_ID].copy()
print(f"Pilot watershed villages: {len(pilot)}")
print(pilot["vilname"].tolist())

def clean(s):
    return str(s).strip().lower().replace(" ", "")

chamoli_polygons = chamoli_polygons.copy()
chamoli_polygons["match_key"] = chamoli_polygons["vilnam_soi"].apply(clean)
pilot["match_key"] = pilot["vilname"].apply(clean)

merged = pilot.merge(
    chamoli_polygons[["match_key", "geometry"]].rename(columns={"geometry": "boundary_geometry"}),
    on="match_key",
    how="left",
)

# resolve the two-geometry-column conflict: prefer polygon, fall back to point
merged["final_geometry"] = merged["boundary_geometry"].fillna(merged["geometry"])
merged = merged.drop(columns=["geometry", "boundary_geometry"])
merged = merged.set_geometry("final_geometry").rename_geometry("geometry")

matched = merged["match_key"].isin(chamoli_polygons["match_key"]).sum()
print(f"\nMatched: {matched} / {len(merged)}")
print("\nStill unmatched (should now be a very short, manually-fixable list):")
print(merged[~merged["match_key"].isin(chamoli_polygons["match_key"])]["vilname"].tolist())

merged.to_file("data/processed/chamoli_villages_final.geojson", driver="GeoJSON")