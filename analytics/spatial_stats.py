"""Spatial statistics worker backed by PySAL.

Reads one JSON request from stdin and writes one JSON response to stdout.
"""

from __future__ import annotations

import json
import math
import sys
from typing import Any

import numpy as np
from esda import Moran, Moran_Local
from esda.getisord import G_Local
from libpysal.weights import W


def finite(value: Any) -> float | None:
    number = float(value)
    return number if math.isfinite(number) else None


def fdr_bh(p_values: np.ndarray) -> np.ndarray:
    count = len(p_values)
    order = np.argsort(p_values)
    adjusted = np.empty(count, dtype=float)
    running = 1.0
    for index in range(count - 1, -1, -1):
        original_index = order[index]
        rank = index + 1
        running = min(running, float(p_values[original_index]) * count / rank)
        adjusted[original_index] = min(running, 1.0)
    return adjusted


def build_inputs(payload: dict[str, Any]) -> tuple[list[dict[str, Any]], np.ndarray, W]:
    units = payload.get("units") or []
    if len(units) < 8:
        raise ValueError("Se requieren al menos ocho unidades espaciales comparables.")

    ids = [int(unit["id"]) for unit in units]
    values = np.asarray([float(unit["value"]) for unit in units], dtype=float)
    if not np.all(np.isfinite(values)):
        raise ValueError("Las unidades contienen valores no numericos.")
    if float(np.var(values)) == 0:
        raise ValueError("La variable espacial no presenta variacion suficiente.")

    id_set = set(ids)
    neighbors = {
        int(unit["id"]): [
            int(neighbor)
            for neighbor in unit.get("neighbors", [])
            if int(neighbor) in id_set
        ]
        for unit in units
    }
    if any(len(items) == 0 for items in neighbors.values()):
        raise ValueError("La matriz espacial contiene unidades aisladas.")

    weights = W(neighbors, id_order=ids, silence_warnings=True)
    weights.transform = "r"
    return units, values, weights


def moran_global(units: list[dict[str, Any]], values: np.ndarray, weights: W, permutations: int) -> dict[str, Any]:
    np.random.seed(42)
    result = Moran(values, weights, permutations=permutations, two_tailed=True)
    significant = float(result.p_sim) < 0.05
    if significant and result.I > result.EI:
        interpretation = "Existe evidencia de autocorrelacion espacial positiva; valores similares tienden a agruparse."
    elif significant:
        interpretation = "Existe evidencia de autocorrelacion espacial negativa; valores diferentes tienden a ser vecinos."
    else:
        interpretation = "No se encontro evidencia estadistica suficiente de autocorrelacion espacial global."

    return {
        "canRun": True,
        "test": "Moran's I global",
        "method": "PySAL esda.Moran",
        "sampleSize": len(units),
        "permutations": permutations,
        "statistic": finite(result.I),
        "expected": finite(result.EI),
        "zScore": finite(result.z_sim),
        "pValue": finite(result.p_sim),
        "significant": significant,
        "interpretation": interpretation,
        "warning": "Resultado exploratorio. No implica causalidad ni constituye prediccion.",
    }


def moran_local(units: list[dict[str, Any]], values: np.ndarray, weights: W, permutations: int) -> dict[str, Any]:
    result = Moran_Local(
        values,
        weights,
        permutations=permutations,
        seed=42,
        n_jobs=1,
        keep_simulations=True,
        alternative="two-sided",
    )
    adjusted = fdr_bh(np.asarray(result.p_sim, dtype=float))
    quadrant_names = {1: "alto-alto", 2: "bajo-alto", 3: "bajo-bajo", 4: "alto-bajo"}
    rows = []

    for index, unit in enumerate(units):
        significant = bool(adjusted[index] < 0.05)
        rows.append(
            {
                "id": int(unit["id"]),
                "codigo": unit["codigo"],
                "value": float(values[index]),
                "localI": finite(result.Is[index]),
                "zScore": finite(result.z_sim[index]),
                "pValue": finite(result.p_sim[index]),
                "pAdjusted": finite(adjusted[index]),
                "significant": significant,
                "classification": quadrant_names.get(int(result.q[index]), "sin_clasificar")
                if significant
                else "no_significativo",
            }
        )

    return {
        "canRun": True,
        "test": "Moran's I local",
        "method": "PySAL esda.Moran_Local",
        "sampleSize": len(units),
        "permutations": permutations,
        "multipleTesting": "Benjamini-Hochberg FDR 0.05",
        "significantUnits": sum(1 for row in rows if row["significant"]),
        "data": rows,
        "interpretation": "Las clases locales solo se muestran cuando el p-value ajustado es menor a 0.05.",
        "warning": "Resultado exploratorio. No implica causalidad ni constituye prediccion.",
    }


def getis_ord(units: list[dict[str, Any]], values: np.ndarray, weights: W, permutations: int) -> dict[str, Any]:
    result = G_Local(
        values,
        weights,
        transform="R",
        permutations=permutations,
        star=True,
        seed=42,
        n_jobs=1,
        keep_simulations=True,
        alternative="two-sided",
    )
    adjusted = fdr_bh(np.asarray(result.p_sim, dtype=float))
    rows = []
    for index, unit in enumerate(units):
        z_score = float(result.Zs[index])
        significant = bool(adjusted[index] < 0.05)
        classification = "no_significativo"
        if significant:
            classification = "hotspot" if z_score > 0 else "coldspot"
        rows.append(
            {
                "id": int(unit["id"]),
                "codigo": unit["codigo"],
                "value": float(values[index]),
                "giStar": finite(result.Gs[index]),
                "zScore": finite(z_score),
                "pValue": finite(result.p_sim[index]),
                "pAdjusted": finite(adjusted[index]),
                "significant": significant,
                "classification": classification,
            }
        )

    return {
        "canRun": True,
        "test": "Getis-Ord Gi*",
        "method": "PySAL esda.G_Local, star=True",
        "sampleSize": len(units),
        "permutations": permutations,
        "multipleTesting": "Benjamini-Hochberg FDR 0.05",
        "significantUnits": sum(1 for row in rows if row["significant"]),
        "data": rows,
        "interpretation": "Los hotspots y coldspots se muestran solo cuando el p-value ajustado es menor a 0.05.",
        "warning": "Resultado exploratorio. No implica causalidad ni constituye prediccion.",
    }


def main() -> None:
    payload = json.loads(sys.stdin.read())
    permutations = int(payload.get("permutations", 999))
    try:
        units, values, weights = build_inputs(payload)
        method = payload.get("method")
        if method == "moran_global":
            response = moran_global(units, values, weights, permutations)
        elif method == "moran_local":
            response = moran_local(units, values, weights, permutations)
        elif method == "getis_ord":
            response = getis_ord(units, values, weights, permutations)
        else:
            raise ValueError("Metodo espacial no reconocido.")
    except ValueError as error:
        response = {
            "canRun": False,
            "message": str(error),
            "warning": "No se ejecuto la prueba por falta de condiciones estadisticas.",
        }

    sys.stdout.write(json.dumps(response, ensure_ascii=True, allow_nan=False))


if __name__ == "__main__":
    main()
