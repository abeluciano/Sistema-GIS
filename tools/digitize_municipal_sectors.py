"""Vectorize the A-G sectors from the municipality's 2019 contingency map.

The source is a low-resolution raster, so the resulting boundaries are
referential. PostGIS clips them against the authoritative district outline.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import cv2
import numpy as np


SECTORS = {
    "A": {"name": "Lambramani", "hue": 90, "seed": (365, 100)},
    "B": {"name": "Adepa - Bancarios", "hue": 54, "seed": (250, 100)},
    "C": {"name": "Plataforma C.C. Andres Avelino Caceres", "hue": 7, "seed": (180, 120)},
    "D": {"name": "Cerro Juli", "hue": 31, "seed": (70, 250)},
    "E": {"name": "Villa Electrica - Fecia Las Begonias - Melgariana", "hue": 126, "seed": (260, 250)},
    "F": {
        "name": "13 de Enero - Juan Pablo Vizcardo y Guzman - Satelite Grande - Mi Peru - Dolores - Monterrey",
        "hue": 18,
        "seed": (350, 330),
    },
    "G": {"name": "Simon Bolivar - Las Esmeraldas", "hue": 165, "seed": (500, 500)},
}

# Colored district extent in the embedded 636 x 641 map image.
PIXEL_EXTENT = {"left": 11, "right": 624, "top": 17, "bottom": 612}
GEO_EXTENT = {
    "min_lon": -71.5475594,
    "max_lon": -71.5011398,
    "min_lat": -16.455307,
    "max_lat": -16.4108211,
}


def circular_hue_distance(hue: np.ndarray, target: int) -> np.ndarray:
    delta = np.abs(hue.astype(np.int16) - target)
    return np.minimum(delta, 180 - delta)


def component_near_seed(mask: np.ndarray, seed: tuple[int, int]) -> np.ndarray:
    count, labels, stats, centroids = cv2.connectedComponentsWithStats(mask, connectivity=8)
    if count <= 1:
        raise RuntimeError("No colored component was detected.")

    x, y = seed
    label = labels[y, x]
    if label == 0:
        candidates = range(1, count)
        label = min(
            candidates,
            key=lambda item: (centroids[item][0] - x) ** 2 + (centroids[item][1] - y) ** 2,
        )

    selected = np.where(labels == label, 255, 0).astype(np.uint8)
    return selected


def pixel_to_coordinate(point: np.ndarray) -> list[float]:
    x, y = float(point[0]), float(point[1])
    px = (x - PIXEL_EXTENT["left"]) / (PIXEL_EXTENT["right"] - PIXEL_EXTENT["left"])
    py = (y - PIXEL_EXTENT["top"]) / (PIXEL_EXTENT["bottom"] - PIXEL_EXTENT["top"])
    lon = GEO_EXTENT["min_lon"] + px * (GEO_EXTENT["max_lon"] - GEO_EXTENT["min_lon"])
    lat = GEO_EXTENT["max_lat"] - py * (GEO_EXTENT["max_lat"] - GEO_EXTENT["min_lat"])
    return [round(lon, 7), round(lat, 7)]


def vectorize(image_path: Path) -> dict:
    image = cv2.imread(str(image_path))
    if image is None:
        raise FileNotFoundError(image_path)

    hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
    hue = hsv[:, :, 0]
    saturation = hsv[:, :, 1]
    target_hues = np.array([sector["hue"] for sector in SECTORS.values()], dtype=np.int16)
    distances = np.stack([circular_hue_distance(hue, int(target)) for target in target_hues])
    nearest = np.argmin(distances, axis=0)
    nearest_distance = np.min(distances, axis=0)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11))
    features = []

    for index, (code, sector) in enumerate(SECTORS.items()):
        mask = np.where(
            (nearest == index) & (nearest_distance <= 13) & (saturation >= 25),
            255,
            0,
        ).astype(np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=2)
        mask = component_near_seed(mask, sector["seed"])
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        contour = max(contours, key=cv2.contourArea)
        epsilon = max(1.5, cv2.arcLength(contour, True) * 0.004)
        simplified = cv2.approxPolyDP(contour, epsilon, True).reshape(-1, 2)
        ring = [pixel_to_coordinate(point) for point in simplified]
        if ring[0] != ring[-1]:
            ring.append(ring[0])

        features.append(
            {
                "type": "Feature",
                "properties": {
                    "codigo": code,
                    "nombre": sector["name"],
                    "fuente": "GDU - MDJLBYR, Plan de Contingencia por Sismos 2019, pagina 55",
                    "precision": "Digitalizacion referencial de mapa raster 636x641",
                },
                "geometry": {"type": "Polygon", "coordinates": [ring]},
            }
        )

    return {"type": "FeatureCollection", "features": features}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("image", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    result = vectorize(args.image)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(result, ensure_ascii=True, separators=(",", ":")), encoding="utf-8")
    print(f"Generated {len(result['features'])} sector polygons in {args.output}")


if __name__ == "__main__":
    main()
