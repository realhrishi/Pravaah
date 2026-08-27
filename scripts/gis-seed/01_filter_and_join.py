# scripts/gis-seed/01_filter_and_join.py
import geopandas as gpd

lgd = gpd.read_parquet("data/raw/villages/LGD_Villages.parquet")
watersheds = gpd.read_parquet("data/raw/watersheds/SLUSI_MicroWatersheds.parquet")

chamoli = lgd[lgd["dtname"].str.contains("Chamoli", case=False, na=False)].copy()
print(f"Chamoli villages (polygons): {len(chamoli)}")

# use village centroid to decide which watershed it falls in — standard
# practice for polygon-in-polygon assignment (a village's centroid is a
# clean single point representing its position, avoids ambiguity from
# boundary edge-cases)
chamoli["centroid"] = chamoli.geometry.centroid

joined = gpd.sjoin(
    chamoli.set_geometry("centroid"),
    watersheds[["id", "WATERSHED", "BASIN", "AREA", "geometry"]],
    how="left",
    predicate="within",
)

counts = joined.groupby("id").size().sort_values(ascending=False)
print("\nWatersheds with 5-15 villages (pilot candidates):")
candidates = counts[(counts >= 5) & (counts <= 15)]
print(candidates)

# quick sanity check — print village names for top few candidates so you
# can eyeball which one looks like real settlements vs forest-block codes
for wid in candidates.index[:5]:
    names = joined[joined["id"] == wid]["vilname11"].tolist()
    print(f"\n{wid} ({len(names)} villages):")
    print(names)