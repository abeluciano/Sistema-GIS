import { query } from "../config/database.js";
import { HttpError } from "../utils/httpError.js";

const groupColumns = {
  zona: "coalesce(z.nombre, 'Sin zona')",
  categoria: "c.nombre",
  estado: "r.estado"
};

export async function comparePeriods(params) {
  const groupBy = params.agrupar ?? "zona";
  const groupColumn = groupColumns[groupBy];
  if (!groupColumn) throw new HttpError(400, "Agrupacion temporal no valida.");

  if (params.periodo_a_inicio > params.periodo_a_fin || params.periodo_b_inicio > params.periodo_b_fin) {
    throw new HttpError(400, "La fecha inicial no puede ser posterior a la fecha final.");
  }

  const values = [
    params.periodo_a_inicio,
    params.periodo_a_fin,
    params.periodo_b_inicio,
    params.periodo_b_fin,
    params.categoria_id ?? null,
    params.zona_id ?? null,
    params.estado ?? null,
    params.urgencia ?? null
  ];

  const result = await query(`
    select
      ${groupColumn} as nombre,
      count(*) filter (where r.created_at::date between $1::date and $2::date)::int as periodo_a,
      count(*) filter (where r.created_at::date between $3::date and $4::date)::int as periodo_b
    from reportes r
    left join categorias c on c.id = r.categoria_id
    left join zonas z on z.id = r.zona_id
    where (
      r.created_at::date between $1::date and $2::date
      or r.created_at::date between $3::date and $4::date
    )
      and ($5::int is null or r.categoria_id = $5::int)
      and ($6::int is null or r.zona_id = $6::int)
      and ($7::varchar is null or r.estado = $7::varchar)
      and ($8::varchar is null or r.urgencia = $8::varchar)
    group by ${groupColumn}
    order by greatest(
      count(*) filter (where r.created_at::date between $1::date and $2::date),
      count(*) filter (where r.created_at::date between $3::date and $4::date)
    ) desc, nombre asc
  `, values);

  const data = result.rows.map((row) => {
    const periodA = Number(row.periodo_a);
    const periodB = Number(row.periodo_b);
    return {
      nombre: row.nombre,
      periodo_a: periodA,
      periodo_b: periodB,
      diferencia: periodB - periodA,
      variacion_porcentual: periodA === 0 ? null : Number((((periodB - periodA) / periodA) * 100).toFixed(2))
    };
  });

  const totalA = data.reduce((sum, row) => sum + row.periodo_a, 0);
  const totalB = data.reduce((sum, row) => sum + row.periodo_b, 0);

  return {
    periodos: {
      a: { inicio: params.periodo_a_inicio, fin: params.periodo_a_fin },
      b: { inicio: params.periodo_b_inicio, fin: params.periodo_b_fin }
    },
    agrupacion: groupBy,
    resumen: {
      periodo_a: totalA,
      periodo_b: totalB,
      diferencia: totalB - totalA,
      variacion_porcentual: totalA === 0 ? null : Number((((totalB - totalA) / totalA) * 100).toFixed(2))
    },
    data,
    interpretation: totalB > totalA
      ? "El segundo periodo registra un mayor volumen de reportes."
      : totalB < totalA
        ? "El segundo periodo registra un menor volumen de reportes."
        : "Ambos periodos registran el mismo volumen de reportes.",
    warning: "La comparacion describe cambios de volumen y no implica causalidad."
  };
}
