# scripts/gis-seed/01_filter_chamoli.py
import geopandas as gpd

villages = gpd.read_parquet("data/raw/villages/Census_Villages.parquet")
watersheds = gpd.read_parquet("data/raw/watersheds/SLUSI_MicroWatersheds.parquet")

chamoli_villages = villages[villages["dtname"].str.contains("Chamoli", case=False, na=False)]
print(f"Villages in Chamoli: {len(chamoli_villages)}")
print(chamoli_villages[["vilname", "t_pop2011", "Long", "Lat"]].head(10))

# geometry is already POINT — no centroid step needed, join directly
joined = gpd.sjoin(
    chamoli_villages,
    watersheds[["id", "WATERSHED", "BASIN", "AREA", "geometry"]],
    how="left",
    predicate="within",
)

# find which watershed has 5-15 villages — that's your pilot candidate
counts = joined.groupby("id").size().sort_values(ascending=False)
print("\nWatersheds with 5-15 villages (pilot candidates):")
print(counts[(counts >= 5) & (counts <= 15)])

# save for the next step
joined.to_file("data/processed/chamoli_villages_with_watershed.geojson", driver="GeoJSON")