const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "https://68-211-162-69.sslip.io";

export type EstadoReporte = "pendiente" | "validado" | "rechazado" | "atendido" | "archivado";
export type Urgencia = "baja" | "media" | "alta" | "critica";

export type AdminUser = {
  id: number;
  email: string;
  nombre: string;
  rol: "gestor" | "administrador" | "ciudadano";
};

export type AuthSession = {
  token: string;
  user: AdminUser;
};

export type Category = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
};

export type Zone = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  tipo?: string;
  fuente?: string | null;
  referencia?: string | null;
  activo: boolean;
  geojson?: GeoJSON.Geometry | null;
};

export type Report = {
  id: number;
  usuario_id: number;
  usuario_nombre?: string | null;
  categoria_id: number;
  categoria_nombre?: string | null;
  urgencia: Urgencia;
  descripcion: string;
  latitud?: number | null;
  longitud?: number | null;
  direccion_aprox?: string | null;
  estado: EstadoReporte;
  zona_id?: number | null;
  zona_nombre?: string | null;
  validado_por_nombre?: string | null;
  validado_at?: string | null;
  created_at: string;
  updated_at: string;
  total_fotos?: number;
  geojson?: GeoJSON.Geometry;
};

export type ReportPhoto = {
  id: number;
  reporte_id: number;
  ruta_relativa: string;
  descripcion?: string | null;
  created_at: string;
};

export type ReportPhotoView = ReportPhoto & {
  url: string;
};

export type Summary = {
  total_reportes: number;
  pendientes: number;
  validados: number;
  rechazados: number;
  atendidos: number;
  archivados: number;
};

export type CountPoint = {
  id?: number;
  nombre: string;
  total: number;
};

export type PeriodPoint = {
  periodo: string;
  total: number;
};

export type PeriodComparisonConfig = {
  periodo_a_inicio: string;
  periodo_a_fin: string;
  periodo_b_inicio: string;
  periodo_b_fin: string;
  agrupar: "zona" | "categoria" | "estado";
};

export type PeriodComparisonRow = {
  nombre: string;
  periodo_a: number;
  periodo_b: number;
  diferencia: number;
  variacion_porcentual: number | null;
};

export type PeriodComparisonResult = {
  periodos: {
    a: { inicio: string; fin: string };
    b: { inicio: string; fin: string };
  };
  agrupacion: string;
  resumen: {
    periodo_a: number;
    periodo_b: number;
    diferencia: number;
    variacion_porcentual: number | null;
  };
  data: PeriodComparisonRow[];
  interpretation: string;
  warning: string;
};

export type HeatPoint = {
  latitud: number;
  longitud: number;
  intensidad: number;
};

export type ReportFilters = {
  estado?: string;
  categoria_id?: string;
  zona_id?: string;
  urgencia?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
};

export type ReportPagination = {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
};

export type StatisticalResult = {
  canRun: boolean;
  test?: string;
  analysis?: string;
  message?: string;
  interpretation?: string;
  pValue?: number;
  statistic?: number;
  degreesOfFreedom?: number;
  sampleSize?: number;
  sampleSizes?: number[];
  contingencyTable?: unknown;
  groups?: unknown;
  rho?: number;
  warning?: string;
  [key: string]: unknown;
};

export type SpatialGlobalResult = {
  canRun: boolean;
  test?: string;
  method?: string;
  sampleSize?: number;
  permutations?: number;
  statistic?: number;
  expected?: number;
  zScore?: number;
  pValue?: number;
  significant?: boolean;
  interpretation?: string;
  warning?: string;
  message?: string;
};

export type SpatialGeoJson = GeoJSON.FeatureCollection & {
  tamanio_m?: number;
  analysis: {
    canRun: boolean;
    test?: string;
    method?: string;
    sampleSize?: number;
    permutations?: number;
    multipleTesting?: string;
    significantUnits?: number;
    interpretation?: string;
    warning?: string;
    message?: string;
  };
};

export type AnalysisRequest = {
  endpoint: string;
  params?: Record<string, string | undefined>;
};

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function authHeaders(token?: string) {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function buildQuery(params?: Record<string, string | undefined>) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value) query.set(key, value);
  }
  const serialized = query.toString();
  return serialized ? `?${serialized}` : "";
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {})
    }
  });

  if (!response.ok) {
    let details: unknown;
    try {
      details = await response.json();
    } catch {
      details = undefined;
    }
    const message = typeof details === "object" && details && "message" in details
      ? String((details as { message?: unknown }).message)
      : `Solicitud rechazada (${response.status})`;
    throw new ApiError(response.status, message, details);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function loginAdmin(usuario: string, password: string) {
  return request<AuthSession>("/admin/login", {
    method: "POST",
    body: JSON.stringify({ usuario, password })
  });
}

export async function getMe(token: string) {
  return request<{ user: AdminUser }>("/admin/me", { headers: authHeaders(token) });
}

export async function getReports(token: string, filters: ReportFilters, page: number, pageSize: number) {
  return request<{ data: Report[]; pagination: ReportPagination }>(
    `/reportes${buildQuery({ ...filters, page: String(page), page_size: String(pageSize) })}`,
    { headers: authHeaders(token) }
  );
}

export async function getCategories() {
  return request<{ data: Category[] }>("/categorias");
}

export async function getZones() {
  return request<{ data: Zone[] }>("/zonas");
}

export async function getSummary(token: string, filters: ReportFilters) {
  return request<{ data: Summary }>(
    `/indicadores/resumen${buildQuery({ ...filters })}`,
    { headers: authHeaders(token) }
  );
}

export async function getByCategory(token: string, filters: ReportFilters) {
  return request<{ data: CountPoint[] }>(
    `/indicadores/por-categoria${buildQuery({ ...filters })}`,
    { headers: authHeaders(token) }
  );
}

export async function getByZone(token: string, filters: ReportFilters) {
  return request<{ data: CountPoint[] }>(
    `/indicadores/por-zona${buildQuery({ ...filters })}`,
    { headers: authHeaders(token) }
  );
}

export async function getByPeriod(token: string, filters: ReportFilters) {
  return request<{ data: PeriodPoint[] }>(
    `/indicadores/por-periodo${buildQuery({ ...filters, periodo: "dia" })}`,
    { headers: authHeaders(token) }
  );
}

function comparisonQuery(config: PeriodComparisonConfig, filters: ReportFilters) {
  return {
    ...config,
    categoria_id: filters.categoria_id,
    zona_id: filters.zona_id,
    estado: filters.estado,
    urgencia: filters.urgencia
  };
}

export async function getPeriodComparison(
  token: string,
  config: PeriodComparisonConfig,
  filters: ReportFilters
) {
  return request<{ data: PeriodComparisonResult }>(
    `/indicadores/comparacion-periodos${buildQuery(comparisonQuery(config, filters))}`,
    { headers: authHeaders(token) }
  );
}

export async function getReportGeoJson(token: string, filters: ReportFilters) {
  return request<GeoJSON.FeatureCollection>(
    `/gis/reportes.geojson${buildQuery({ ...filters })}`,
    { headers: authHeaders(token) }
  );
}

export async function getZonesGeoJson(token: string) {
  return request<GeoJSON.FeatureCollection>("/gis/zonas.geojson", { headers: authHeaders(token) });
}

export async function getHeatmap(token: string, filters: ReportFilters) {
  return request<{ data: HeatPoint[] }>(
    `/gis/heatmap${buildQuery({ ...filters })}`,
    { headers: authHeaders(token) }
  );
}

export async function getZoneConcentration(token: string, filters: ReportFilters) {
  return request<GeoJSON.FeatureCollection>(
    `/gis/concentracion-zonas.geojson${buildQuery({ ...filters })}`,
    { headers: authHeaders(token) }
  );
}

export async function runStatisticalAnalysis(token: string, requestConfig: AnalysisRequest) {
  try {
    return await request<StatisticalResult>(
      `${requestConfig.endpoint}${buildQuery(requestConfig.params)}`,
      { headers: authHeaders(token) }
    );
  } catch (error) {
    if (error instanceof ApiError && (error.status === 422 || error.status === 501)) {
      return error.details as StatisticalResult;
    }
    throw error;
  }
}

function spatialQuery(size: 250 | 500, filters: ReportFilters) {
  return {
    tamanio: String(size),
    estado: filters.estado,
    categoria_id: filters.categoria_id,
    zona_id: filters.zona_id,
    fecha_inicio: filters.fecha_inicio,
    fecha_fin: filters.fecha_fin
  };
}

async function spatialRequest<T>(token: string, path: string) {
  try {
    return await request<T>(path, { headers: authHeaders(token) });
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) return error.details as T;
    throw error;
  }
}

export function getMoranGlobal(token: string, size: 250 | 500, filters: ReportFilters) {
  return spatialRequest<SpatialGlobalResult>(
    token,
    `/analisis/espacial/moran${buildQuery(spatialQuery(size, filters))}`
  );
}

export function getMoranLocal(token: string, size: 250 | 500, filters: ReportFilters) {
  return spatialRequest<SpatialGeoJson>(
    token,
    `/analisis/espacial/moran-local.geojson${buildQuery(spatialQuery(size, filters))}`
  );
}

export function getGetisOrd(token: string, size: 250 | 500, filters: ReportFilters) {
  return spatialRequest<SpatialGeoJson>(
    token,
    `/analisis/espacial/getis-ord.geojson${buildQuery(spatialQuery(size, filters))}`
  );
}

export async function changeReportState(token: string, reportId: number, estado: EstadoReporte) {
  return request<{ data: Report }>(`/reportes/${reportId}/estado`, {
    method: "PATCH",
    headers: authHeaders(token),
    body: JSON.stringify({ estado })
  });
}

export async function getReportPhotos(token: string, reportId: number) {
  return request<{ data: ReportPhoto[] }>(`/reportes/${reportId}/fotos`, {
    headers: authHeaders(token)
  });
}

export async function getReportPhotoBlob(token: string, reportId: number, photoId: number) {
  const response = await fetch(`${API_BASE_URL}/reportes/${reportId}/fotos/${photoId}/archivo`, {
    headers: authHeaders(token)
  });
  if (!response.ok) throw new ApiError(response.status, "No se pudo cargar la fotografia.");
  return response.blob();
}

export async function deleteReportPhoto(token: string, reportId: number, photoId: number) {
  return request<void>(`/reportes/${reportId}/fotos/${photoId}`, {
    method: "DELETE",
    headers: authHeaders(token)
  });
}

export function buildReportsCsvUrl(filters: ReportFilters) {
  return `${API_BASE_URL}/export/reportes.csv${buildQuery(filters)}`;
}

export function buildPeriodComparisonCsvUrl(config: PeriodComparisonConfig, filters: ReportFilters) {
  return `${API_BASE_URL}/export/comparacion-periodos.csv${buildQuery(comparisonQuery(config, filters))}`;
}
