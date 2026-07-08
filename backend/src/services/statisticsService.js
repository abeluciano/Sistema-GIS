import jstat from "jstat";

const { jStat } = jstat;

const urgencyOrder = { baja: 1, media: 2, alta: 3, critica: 4 };

function interpretation(pValue, kind) {
  if (pValue < 0.05) {
    return `Existe evidencia estadistica de ${kind}. Este resultado no implica causalidad.`;
  }

  return `No se encontro evidencia estadistica suficiente de ${kind}. Este resultado no implica causalidad.`;
}

function rank(values) {
  const sorted = values
    .map((value, index) => ({ value, index }))
    .sort((a, b) => a.value - b.value);
  const ranks = Array(values.length);

  for (let i = 0; i < sorted.length; i += 1) {
    let j = i;
    while (j + 1 < sorted.length && sorted[j + 1].value === sorted[i].value) j += 1;
    const averageRank = (i + 1 + j + 1) / 2;
    for (let k = i; k <= j; k += 1) ranks[sorted[k].index] = averageRank;
    i = j;
  }

  return ranks;
}

function pearson(x, y) {
  const n = x.length;
  const meanX = x.reduce((sum, value) => sum + value, 0) / n;
  const meanY = y.reduce((sum, value) => sum + value, 0) / n;
  let numerator = 0;
  let denominatorX = 0;
  let denominatorY = 0;

  for (let i = 0; i < n; i += 1) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denominatorX += dx ** 2;
    denominatorY += dy ** 2;
  }

  return numerator / Math.sqrt(denominatorX * denominatorY);
}

export function chiSquaredTest(rows) {
  const rowLabels = [...new Set(rows.map((row) => row.variable_a))];
  const columnLabels = [...new Set(rows.map((row) => row.variable_b))];

  if (rowLabels.length < 2 || columnLabels.length < 2) {
    return { canRun: false, message: "Se requieren al menos dos categorias comparables por variable." };
  }

  const table = rowLabels.map((rowLabel) => {
    return columnLabels.map((columnLabel) => {
      return Number(rows.find((row) => row.variable_a === rowLabel && row.variable_b === columnLabel)?.total ?? 0);
    });
  });

  const rowTotals = table.map((row) => row.reduce((sum, value) => sum + value, 0));
  const columnTotals = columnLabels.map((_, index) => table.reduce((sum, row) => sum + row[index], 0));
  const grandTotal = rowTotals.reduce((sum, value) => sum + value, 0);

  if (grandTotal < 5) return { canRun: false, message: "No hay suficientes observaciones para ejecutar la prueba." };

  let statistic = 0;
  for (let i = 0; i < table.length; i += 1) {
    for (let j = 0; j < table[i].length; j += 1) {
      const expected = (rowTotals[i] * columnTotals[j]) / grandTotal;
      if (expected > 0) statistic += ((table[i][j] - expected) ** 2) / expected;
    }
  }

  const degreesOfFreedom = (rowLabels.length - 1) * (columnLabels.length - 1);
  const pValue = 1 - jStat.chisquare.cdf(statistic, degreesOfFreedom);

  return {
    canRun: true,
    test: "Chi-cuadrado de independencia",
    statistic,
    degreesOfFreedom,
    pValue,
    sampleSize: grandTotal,
    contingencyTable: { rowLabels, columnLabels, values: table },
    interpretation: interpretation(pValue, "asociacion entre las variables")
  };
}

export function mannWhitneyTest(groups) {
  if (groups.length !== 2) return { canRun: false, message: "Se requieren exactamente dos grupos independientes." };
  if (groups.some((group) => group.values.length < 2)) return { canRun: false, message: "Cada grupo debe tener al menos dos observaciones." };

  const combined = groups.flatMap((group, groupIndex) => group.values.map((value) => ({ value, groupIndex })));
  const ranks = rank(combined.map((item) => item.value));
  const rankSumA = ranks.reduce((sum, rankValue, index) => sum + (combined[index].groupIndex === 0 ? rankValue : 0), 0);
  const n1 = groups[0].values.length;
  const n2 = groups[1].values.length;
  const u1 = rankSumA - (n1 * (n1 + 1)) / 2;
  const u2 = n1 * n2 - u1;
  const u = Math.min(u1, u2);
  const mean = (n1 * n2) / 2;
  const sd = Math.sqrt((n1 * n2 * (n1 + n2 + 1)) / 12);
  const z = (u - mean) / sd;
  const pValue = 2 * (1 - jStat.normal.cdf(Math.abs(z), 0, 1));

  return {
    canRun: true,
    test: "U de Mann-Whitney",
    statistic: u,
    pValue,
    sampleSizes: groups.map((group) => ({ group: group.label, n: group.values.length })),
    interpretation: interpretation(pValue, "diferencia entre los dos grupos")
  };
}

export function kruskalWallisTest(groups) {
  if (groups.length < 3) return { canRun: false, message: "Se requieren tres o mas grupos independientes." };
  if (groups.some((group) => group.values.length < 2)) return { canRun: false, message: "Cada grupo debe tener al menos dos observaciones." };

  const combined = groups.flatMap((group, groupIndex) => group.values.map((value) => ({ value, groupIndex })));
  const ranks = rank(combined.map((item) => item.value));
  const n = combined.length;
  let h = 0;

  for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
    const groupRanks = ranks.filter((_rankValue, index) => combined[index].groupIndex === groupIndex);
    const rankSum = groupRanks.reduce((sum, value) => sum + value, 0);
    h += (rankSum ** 2) / groups[groupIndex].values.length;
  }

  h = (12 / (n * (n + 1))) * h - 3 * (n + 1);
  const degreesOfFreedom = groups.length - 1;
  const pValue = 1 - jStat.chisquare.cdf(h, degreesOfFreedom);

  return {
    canRun: true,
    test: "Kruskal-Wallis",
    statistic: h,
    degreesOfFreedom,
    pValue,
    sampleSizes: groups.map((group) => ({ group: group.label, n: group.values.length })),
    interpretation: interpretation(pValue, "diferencia entre tres o mas grupos")
  };
}

export function spearmanCorrelation(pairs) {
  if (pairs.length < 5) return { canRun: false, message: "Se requieren al menos cinco pares de datos comparables." };

  const xRanks = rank(pairs.map((pair) => pair.x));
  const yRanks = rank(pairs.map((pair) => pair.y));
  const rho = pearson(xRanks, yRanks);
  const n = pairs.length;
  const t = rho * Math.sqrt((n - 2) / (1 - rho ** 2));
  const pValue = 2 * (1 - jStat.studentt.cdf(Math.abs(t), n - 2));

  return {
    canRun: true,
    test: "Correlacion de Spearman",
    rho,
    pValue,
    sampleSize: n,
    interpretation: interpretation(pValue, "relacion estadistica entre las variables")
  };
}

export function mapUrgency(value) {
  return urgencyOrder[value] ?? null;
}
