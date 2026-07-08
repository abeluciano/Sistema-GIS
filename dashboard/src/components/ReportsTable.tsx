import { CheckCircle2, FileSearch, ShieldCheck } from "lucide-react";
import type { EstadoReporte, Report } from "../services/api";

type ReportsTableProps = {
  reports: Report[];
  onStateChange: (reportId: number, estado: EstadoReporte) => void;
};

function formatDate(value: string) {
  return new Date(value).toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
}

export function ReportsTable({ reports, onStateChange }: ReportsTableProps) {
  return (
    <section className="panel reports-panel" aria-label="Reportes">
      <header className="panel-header">
        <div>
          <h2>Reportes</h2>
          <p>{reports.length} registros visibles</p>
        </div>
      </header>
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
            {reports.map((report) => (
              <tr key={report.id}>
                <td>#{report.id}</td>
                <td>
                  <strong>{report.categoria_nombre ?? "Sin categoria"}</strong>
                  <span>{report.descripcion}</span>
                </td>
                <td>{report.zona_nombre ?? "Sin zona"}</td>
                <td><span className={`urgency urgency-${report.urgencia}`}>{report.urgencia}</span></td>
                <td><span className={`state state-${report.estado}`}>{report.estado}</span></td>
                <td>{formatDate(report.created_at)}</td>
                <td>
                  <div className="row-actions">
                    <button type="button" className="icon-button" onClick={() => onStateChange(report.id, "validado")} aria-label="Validar reporte">
                      <ShieldCheck size={16} />
                    </button>
                    <button type="button" className="icon-button" onClick={() => onStateChange(report.id, "atendido")} aria-label="Marcar atendido">
                      <CheckCircle2 size={16} />
                    </button>
                    <button type="button" className="icon-button muted" aria-label="Ver detalle">
                      <FileSearch size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {reports.length === 0 ? (
              <tr>
                <td colSpan={7} className="empty-cell">Sin reportes para los filtros seleccionados.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
