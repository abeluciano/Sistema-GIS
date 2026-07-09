import { LogOut, MapPinned } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { ChartsPanel } from "./components/ChartsPanel";
import { FiltersBar } from "./components/FiltersBar";
import { KpiGrid } from "./components/KpiGrid";
import { LoginPanel } from "./components/LoginPanel";
import { MapPanel } from "./components/MapPanel";
import { ReportsTable } from "./components/ReportsTable";
import { StatisticalAnalysisPanel } from "./components/StatisticalAnalysisPanel";
import {
  buildReportsCsvUrl,
  changeReportState,
  deleteReportPhoto,
  getByCategory,
  getByPeriod,
  getByZone,
  getCategories,
  getHeatmap,
  getMe,
  getReportGeoJson,
  getReportPhotoBlob,
  getReportPhotos,
  getReports,
  getSummary,
  getZones,
  getZonesGeoJson,
  getZoneConcentration,
  loginAdmin,
  runStatisticalAnalysis,
  type AdminUser,
  type Category,
  type CountPoint,
  type EstadoReporte,
  type HeatPoint,
  type PeriodPoint,
  type Report,
  type ReportFilters,
  type ReportPagination,
  type ReportPhotoView,
  type Summary,
  type Zone
} from "./services/api";

const TOKEN_KEY = "sistema_gis_admin_token";

export default function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) ?? "");
  const [user, setUser] = useState<AdminUser | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({});
  const [draftFilters, setDraftFilters] = useState<ReportFilters>({});
  const [reports, setReports] = useState<Report[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [reportPagination, setReportPagination] = useState<ReportPagination>({
    page: 1,
    page_size: 5,
    total: 0,
    total_pages: 1
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [summary, setSummary] = useState<Summary>();
  const [byCategory, setByCategory] = useState<CountPoint[]>([]);
  const [byZone, setByZone] = useState<CountPoint[]>([]);
  const [byPeriod, setByPeriod] = useState<PeriodPoint[]>([]);
  const [reportsGeoJson, setReportsGeoJson] = useState<GeoJSON.FeatureCollection>();
  const [zonesGeoJson, setZonesGeoJson] = useState<GeoJSON.FeatureCollection>();
  const [heatmap, setHeatmap] = useState<HeatPoint[]>([]);
  const [zoneConcentration, setZoneConcentration] = useState<GeoJSON.FeatureCollection>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  const loadData = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [
        reportsResponse,
        categoriesResponse,
        zonesResponse,
        summaryResponse,
        byCategoryResponse,
        byZoneResponse,
        byPeriodResponse,
        reportsGeo,
        zonesGeo,
        heatResponse,
        concentrationResponse
      ] = await Promise.all([
        getReports(token, filters, page, pageSize),
        getCategories(),
        getZones(),
        getSummary(token, filters),
        getByCategory(token, filters),
        getByZone(token, filters),
        getByPeriod(token, filters),
        getReportGeoJson(token, filters),
        getZonesGeoJson(token),
        getHeatmap(token, filters),
        getZoneConcentration(token, filters)
      ]);

      setReports(reportsResponse.data);
      setReportPagination(reportsResponse.pagination);
      if (reportsResponse.pagination.page !== page) setPage(reportsResponse.pagination.page);
      setCategories(categoriesResponse.data);
      setZones(zonesResponse.data);
      setSummary(summaryResponse.data);
      setByCategory(byCategoryResponse.data);
      setByZone(byZoneResponse.data);
      setByPeriod(byPeriodResponse.data);
      setReportsGeoJson(reportsGeo);
      setZonesGeoJson(zonesGeo);
      setHeatmap(heatResponse.data);
      setZoneConcentration(concentrationResponse);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "No se pudo cargar el dashboard.");
    } finally {
      setLoading(false);
    }
  }, [filters, page, pageSize, token]);

  useEffect(() => {
    if (!token) return;
    getMe(token)
      .then((response) => setUser(response.user))
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setToken("");
        setUser(null);
      });
  }, [token]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  async function handleLogin(usuario: string, password: string) {
    const session = await loginAdmin(usuario, password);
    localStorage.setItem(TOKEN_KEY, session.token);
    setToken(session.token);
    setUser(session.user);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setUser(null);
  }

  async function handleStateChange(reportId: number, estado: EstadoReporte) {
    if (!token) return;
    setActionError("");
    setActionMessage("");
    try {
      await changeReportState(token, reportId, estado);
      setActionMessage(estado === "validado" ? "Reporte validado correctamente." : "Reporte marcado como atendido.");
      await loadData();
    } catch (stateError) {
      setActionError(stateError instanceof Error ? stateError.message : "No se pudo actualizar el reporte.");
    }
  }

  async function loadReportPhotos(reportId: number): Promise<ReportPhotoView[]> {
    const response = await getReportPhotos(token, reportId);
    return Promise.all(response.data.map(async (photo) => ({
      ...photo,
      url: URL.createObjectURL(await getReportPhotoBlob(token, reportId, photo.id))
    })));
  }

  async function handleDeletePhoto(reportId: number, photoId: number) {
    await deleteReportPhoto(token, reportId, photoId);
  }

  function applyFilters() {
    setActionError("");
    setActionMessage("");
    setPage(1);
    setFilters({ ...draftFilters });
  }

  function changePageSize(nextPageSize: number) {
    setPage(1);
    setPageSize(nextPageSize);
  }

  async function downloadReportsCsv() {
    if (!token) return;
    const response = await fetch(buildReportsCsvUrl(filters), {
      headers: { Authorization: `Bearer ${token}` }
    });
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "reportes.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  if (!token) return <LoginPanel onLogin={handleLogin} />;

  return (
    <main className="dashboard-shell">
      <aside className="sidebar">
        <div className="brand-row compact">
          <span className="brand-mark"><MapPinned size={22} /></span>
          <div>
            <p>Sistema GIS</p>
            <h1>Gestion</h1>
          </div>
        </div>
        <nav aria-label="Modulos">
          <a href="#operacion">Operacion</a>
          <a href="#mapa">Mapa</a>
          <a href="#indicadores">Indicadores</a>
          <a href="#estadistica">Analisis</a>
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p>{user?.rol ?? "gestor"}</p>
            <h2>{user?.nombre ?? "Dashboard administrativo"}</h2>
          </div>
          <button type="button" className="secondary-button" onClick={logout}>
            <LogOut size={17} />
            <span>Salir</span>
          </button>
        </header>

        <section id="operacion" className="workspace-section">
          <FiltersBar
            categories={categories}
            zones={zones}
            filters={draftFilters}
            onChange={setDraftFilters}
            onSearch={applyFilters}
            onRefresh={loadData}
            onExport={downloadReportsCsv}
            loading={loading}
          />
          {error ? <p className="form-error">{error}</p> : null}
          {loading ? <p className="loading-line">Cargando datos...</p> : null}
          <KpiGrid summary={summary} />
        </section>

        <section id="mapa" className="workspace-section two-column">
          <MapPanel
            reportsGeoJson={reportsGeoJson}
            zonesGeoJson={zonesGeoJson}
            zoneConcentration={zoneConcentration}
            heatmap={heatmap}
          />
          <ReportsTable
            reports={reports}
            pagination={reportPagination}
            onPageChange={setPage}
            onPageSizeChange={changePageSize}
            onStateChange={handleStateChange}
            onLoadPhotos={loadReportPhotos}
            onDeletePhoto={handleDeletePhoto}
            actionMessage={actionMessage}
            actionError={actionError}
          />
        </section>

        <section id="indicadores" className="workspace-section">
          <ChartsPanel byCategory={byCategory} byZone={byZone} byPeriod={byPeriod} />
        </section>

        <section id="estadistica" className="workspace-section">
          <StatisticalAnalysisPanel
            categories={categories}
            zones={zones}
            runAnalysis={(request) => runStatisticalAnalysis(token, request)}
          />
        </section>
      </section>
    </main>
  );
}
