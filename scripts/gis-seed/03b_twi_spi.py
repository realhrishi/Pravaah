# scripts/gis-seed/03b_twi_spi.py
import geopandas as gpd
import rasterio
import numpy as np
from rasterstats import zonal_stats

def compute_d8_flow_accumulation(dem: np.ndarray) -> np.ndarray:
    """
    D8 algorithm: each cell flows to whichever of its 8 neighbors has
    the steepest downhill slope. Flow accumulation = how many upstream
    cells eventually drain through this cell.
    """
    rows, cols = dem.shape
    flow_dir = np.zeros((rows, cols), dtype=np.int8)  # 0-7 = direction to steepest neighbor, -1 = none (pit/edge)

    # 8 neighbor offsets: N, NE, E, SE, S, SW, W, NW
    offsets = [(-1,0),(-1,1),(0,1),(1,1),(1,0),(1,-1),(0,-1),(-1,-1)]
    dist = [1,1.414,1,1.414,1,1.414,1,1.414]  # diagonal cells are farther

    for r in range(1, rows-1):
        for c in range(1, cols-1):
            max_drop = 0
            best_dir = -1
            for i, (dr, dc) in enumerate(offsets):
                drop = (dem[r,c] - dem[r+dr, c+dc]) / dist[i]
                if drop > max_drop:
                    max_drop = drop
                    best_dir = i
            flow_dir[r,c] = best_dir

    # Accumulate: each cell contributes 1 unit to whichever cell it flows into,
    # processed in elevation order (highest first) so upstream totals propagate downstream
    flow_acc = np.ones((rows, cols), dtype=np.float64)  # every cell starts by counting itself
    flat_indices = np.argsort(-dem, axis=None)  # highest elevation first

    for idx in flat_indices:
        r, c = np.unravel_index(idx, dem.shape)
        d = flow_dir[r, c]
        if d == -1:
            continue
        dr, dc = offsets[d]
        nr, nc = r + dr, c + dc
        if 0 <= nr < rows and 0 <= nc < cols:
            flow_acc[nr, nc] += flow_acc[r, c]

    return flow_acc


def main():
    with rasterio.open("data/raw/dem/ALPSMLC30_N030E079_DSM.tif") as src:
        dem = src.read(1).astype(np.float64)
        transform = src.transform
        crs = src.crs

    slope_deg = rasterio.open("data/processed/slope.tif").read(1)
    slope_rad = np.radians(slope_deg)
    slope_rad = np.clip(slope_rad, 0.001, None)  # avoid divide-by-zero at flat cells

    print("Computing D8 flow accumulation (this is slow on large DEMs — expect a few minutes)...")
    flow_acc = compute_d8_flow_accumulation(dem)

    print("Computing TWI and SPI...")
    twi = np.log(flow_acc / np.tan(slope_rad))
    spi = flow_acc * np.tan(slope_rad)

    def write_raster(array, path):
        with rasterio.open(
            path, "w", driver="GTiff", height=array.shape[0], width=array.shape[1],
            count=1, dtype=array.dtype, crs=crs, transform=transform,
        ) as dst:
            dst.write(array, 1)

    write_raster(flow_acc, "data/processed/flow_accumulation.tif")
    write_raster(twi, "data/processed/twi.tif")
    write_raster(spi, "data/processed/spi.tif")

    print("Running zonal statistics per village...")
    pilot = gpd.read_file("data/processed/pilot_final.geojson")

    flow_stats = zonal_stats(pilot, "data/processed/flow_accumulation.tif", stats="mean")
    twi_stats = zonal_stats(pilot, "data/processed/twi.tif", stats="mean")
    spi_stats = zonal_stats(pilot, "data/processed/spi.tif", stats="mean")

    pilot["flow_accumulation"] = [s["mean"] for s in flow_stats]
    pilot["twi"] = [s["mean"] for s in twi_stats]
    pilot["spi"] = [s["mean"] for s in spi_stats]

    print(pilot[["vilname11", "flow_accumulation", "twi", "spi"]])

    pilot.to_file("data/processed/pilot_final_v2.geojson", driver="GeoJSON")
    print("\nSaved: data/processed/pilot_final_v2.geojson")


if __name__ == "__main__":
    main()