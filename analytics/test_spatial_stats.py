import unittest

from spatial_stats import build_inputs, getis_ord, moran_global, moran_local


def clustered_units():
    values = [1, 1, 1, 1, 2, 8, 8, 9, 9]
    units = []
    for index, value in enumerate(values):
        row, column = divmod(index, 3)
        neighbors = []
        for candidate in range(9):
            if candidate == index:
                continue
            other_row, other_column = divmod(candidate, 3)
            if abs(row - other_row) <= 1 and abs(column - other_column) <= 1:
                neighbors.append(candidate + 1)
        units.append({
            "id": index + 1,
            "codigo": f"C{index + 1}",
            "value": value,
            "neighbors": neighbors,
        })
    return units


class SpatialStatsTests(unittest.TestCase):
    def test_global_moran_detects_clustered_pattern(self):
        units, values, weights = build_inputs({"units": clustered_units()})
        result = moran_global(units, values, weights, 99)
        self.assertTrue(result["canRun"])
        self.assertGreater(result["statistic"], result["expected"])
        self.assertLess(result["pValue"], 0.05)

    def test_local_moran_returns_every_unit(self):
        units, values, weights = build_inputs({"units": clustered_units()})
        result = moran_local(units, values, weights, 99)
        self.assertEqual(len(result["data"]), 9)
        self.assertEqual(result["multipleTesting"], "Benjamini-Hochberg FDR 0.05")

    def test_constant_values_are_rejected(self):
        units = clustered_units()
        for unit in units:
            unit["value"] = 1
        with self.assertRaisesRegex(ValueError, "variacion"):
            build_inputs({"units": units})

    def test_getis_ord_returns_bounded_adjusted_probabilities(self):
        units, values, weights = build_inputs({"units": clustered_units()})
        result = getis_ord(units, values, weights, 99)
        self.assertEqual(len(result["data"]), 9)
        self.assertTrue(all(0 <= row["pAdjusted"] <= 1 for row in result["data"]))


if __name__ == "__main__":
    unittest.main()
