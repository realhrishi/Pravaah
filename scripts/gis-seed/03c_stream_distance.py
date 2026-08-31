"""
scripts/gis-seed/03c_stream_distance.py

Derives a stream network from flow accumulation (cells above a threshold
are "stream" cells — this is the standard approach, not a hack), then
computes each pixel's distance to the nearest stream cell.

Run AFTER 03b_twi_spi.py — needs data/processed/flow_accumulation.tif.
"""

import geopandas as gpd
import rasterio
import numpy as np
from scipy import ndimage
from rasterstats import zonal_stats

# Cells with flow accumulation above this are classified as a stream.
# This threshold is empirical — start here, sanity-check against a real
# map of the watershed's known streams, adjust if the derived network
# looks too sparse/dense.
STREAM_THRESHOLD = 500


def main():
    with rasterio.open("data/processed/flow_accumulation.tif") as src:
        flow_acc = src.read(1)
        transform = src.transform
        crs = src.crs
        pixel_size_deg = transform[0]

    print(f"Stream threshold: cells with flow_accumulation > {STREAM_THRESHOLD}")
    stream_mask = flow_acc > STREAM_THRESHOLD
    n_stream_cells = stream_mask.sum()
    print(f"Identified {n_stream_cells} stream cells out of {flow_acc.size} total")

    if n_stream_cells == 0:
        raise ValueError(
            "No stream cells found — lower STREAM_THRESHOLD and re-run. "
            "Check flow_accumulation.tif's actual value range first."
        )

    # distance_transform_edt gives, for every cell, the distance (in pixels)
    # to the nearest True cell in the input — exactly "distance to nearest stream"
    print("Computing distance transform...")
    distance_pixels = ndimage.distance_transform_edt(~stream_mask)

    meters_per_degree = 111320  # approx at this latitude
    pixel_size_m = pixel_size_deg * meters_per_degree
    distance_m = distance_pixels * pixel_size_m

    with rasterio.open(
        "data/processed/distance_to_stream.tif", "w", driver="GTiff",
        height=distance_m.shape[0], width=distance_m.shape[1],
        count=1, dtype=distance_m.dtype, crs=crs, transform=transform,
    ) as dst:
        dst.write(distance_m, 1)

    print("Running zonal statistics per village...")
    pilot = gpd.read_file("data/processed/pilot_final_v2.geojson")
    dist_stats = zonal_stats(pilot, "data/processed/distance_to_stream.tif", stats="mean")
    pilot["distance_to_stream_m"] = [s["mean"] for s in dist_stats]

    print(pilot[["vilname11", "distance_to_stream_m"]])

    pilot.to_file("data/processed/pilot_final_v3.geojson", driver="GeoJSON")
    print("\nSaved: data/processed/pilot_final_v3.geojson — this is now the complete, final seed file")


if __name__ == "__main__":
    main()