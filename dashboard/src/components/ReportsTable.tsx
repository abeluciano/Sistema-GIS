import { CheckCircle2, ChevronLeft, ChevronRight, FileSearch, ShieldCheck, X } from "lucide-react";
import { useMemo, useState } from "react";
import type { EstadoReporte, Report, ReportPagination } from "../services/api";

type ReportsTableProps = {
  reports: Report[];
  pagination: ReportPagination;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onStateChange: (reportId: number, estado: EstadoReporte) => Promise<void>;
  actionMessage?: string;
  actionError?: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
}

function readable(value?: string | null) {
  if (!value) return "Sin asignar";
  return value.replaceAll("_", " ");
}

function pageNumbers(current: number, total: number) {
  const start = Math.max(1, Math.min(current - 2, total - 4));
  const end = Math.min(total, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

export function ReportsTable({
  reports,
  pagination,
  onPageChange,
  onPageSizeChange,
  onStateChange,
  actionMessage,
  actionError
}: ReportsTableProps) {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [processing, setProcessing] = useState("");
  const pages = useMemo(
    () => pageNumbers(pagination.page, pagination.total_pages),
    [pagination.page, pagination.total_pages]
  );
  const firstVisible = pagination.total === 0 ? 0 : ((pagination.page - 1) * pagination.page_size) + 1;
  const lastVisible = Math.min(pagination.total, pagination.page * pagination.page_size);

  async function updateState(reportId: number, estado: EstadoReporte) {
    const operation = `${reportId}-${estado}`;
    setProcessing(operation);
    try {
      await onStateChange(reportId, estado);
    } finally {
      setProcessing("");
    }
  }

  return (
    <section className="panel reports-panel" aria-label="Reportes">
      <header className="panel-header">
        <div>
          <h2>Reportes</h2>
          <p>{pagination.total} registros encontrados</p>
        </div>
      </header>

      {actionError ? <p className="table-feedback error" role="alert">{actionError}</p> : null}
      {actionMessage ? <p className="table-feedback success" role="status">{actionMessage}</p> : null}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Categoria</th>
              <th>Zona</th>
              <th>Urgencia</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => {
              const canValidate = report.estado === "pendiente";
              const canAttend = report.estado === "validado";
              return (
                <tr key={report.id}>
                  <td>#{report.id}</td>
                  <td>
                    <strong>{readable(report.categoria_nombre ?? "Sin categoria")}</strong>
                    <span>{report.descripcion}</span>
                  </td>
                  <td>{report.zona_nombre ?? "Sin zona"}</td>
                  <td><span className={`urgency urgency-${report.urgencia}`}>{report.urgencia}</span></td>
                  <td><span className={`state state-${report.estado}`}>{report.estado}</span></td>
                  <td>{formatDate(report.created_at)}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => void updateState(report.id, "validado")}
                        aria-label={`Validar reporte ${report.id}`}
                        title={canValidate ? "Validar reporte" : "Solo disponible para reportes pendientes"}
                        disabled={!canValidate || Boolean(processing)}
                      >
                        <ShieldCheck size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-button"
                        onClick={() => void updateState(report.id, "atendido")}
                        aria-label={`Marcar atendido el reporte ${report.id}`}
                        title={canAttend ? "Marcar como atendido" : "Disponible después de validar"}
                        disabled={!canAttend || Boolean(processing)}
                      >
                        <CheckCircle2 size={16} />
                      </button>
                      <button
                        type="button"
                        className="icon-button muted"
                        onClick={() => setSelectedReport(report)}
                        aria-label={`Ver detalle del reporte ${report.id}`}
                        title="Ver detalle"
                      >
                        <FileSearch size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {reports.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-cell">Sin reportes para los filtros seleccionados.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <footer className="pagination-bar" aria-label="Paginacion de reportes">
        <p>Mostrando {firstVisible}-{lastVisible} de {pagination.total}</p>
        <div className="pagination-controls">
          <label className="page-size">
            Filas
            <select value={pagination.page_size} onChange={(event) => onPageSizeChange(Number(event.target.value))}>
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </label>
          <button
            type="button"
            className="icon-button"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            aria-label="Pagina anterior"
            title="Pagina anterior"
          >
            <ChevronLeft size={17} />
          </button>
          <div className="page-numbers">
            {pages.map((page) => (
              <button
                type="button"
                key={page}
                className={page === pagination.page ? "page-button active" : "page-button"}
                onClick={() => onPageChange(page)}
                aria-current={page === pagination.page ? "page" : undefined}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={pagination.page >= pagination.total_pages}
            aria-label="Pagina siguiente"
            title="Pagina siguiente"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </footer>

      {selectedReport ? (
        <div className="modal-backdrop" onMouseDown={() => setSelectedReport(null)}>
          <section
            className="report-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-detail-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <p>Reporte #{selectedReport.id}</p>
                <h3 id="report-detail-title">{readable(selectedReport.categoria_nombre)}</h3>
              </div>
              <button type="button" className="icon-button" onClick={() => setSelectedReport(null)} aria-label="Cerrar detalle">
                <X size={18} />
              </button>
            </header>
            <dl className="report-detail-grid">
              <div><dt>Estado</dt><dd>{selectedReport.estado}</dd></div>
              <div><dt>Urgencia</dt><dd>{selectedReport.urgencia}</dd></div>
              <div><dt>Zona</dt><dd>{selectedReport.zona_nombre ?? "Sin zona"}</dd></div>
              <div><dt>Ciudadano</dt><dd>{selectedReport.usuario_nombre ?? "Sin nombre"}</dd></div>
              <div><dt>Fecha</dt><dd>{formatDate(selectedReport.created_at)}</dd></div>
              <div><dt>Fotografias</dt><dd>{selectedReport.total_fotos ?? 0}</dd></div>
              <div className="detail-wide"><dt>Direccion aproximada</dt><dd>{selectedReport.direccion_aprox ?? "No indicada"}</dd></div>
              <div className="detail-wide"><dt>Descripcion</dt><dd>{selectedReport.descripcion}</dd></div>
              <div className="detail-wide">
                <dt>Coordenadas</dt>
                <dd>
                  {selectedReport.latitud != null && selectedReport.longitud != null
                    ? `${selectedReport.latitud}, ${selectedReport.longitud}`
                    : "No disponibles"}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      ) : null}
    </section>
  );
}
