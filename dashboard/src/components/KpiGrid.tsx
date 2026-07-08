import { AlertCircle, Archive, CheckCircle2, Clock3, FileText, ShieldCheck } from "lucide-react";
import type { Summary } from "../services/api";

const kpis = [
  { key: "total_reportes", label: "Total", icon: FileText },
  { key: "pendientes", label: "Pendientes", icon: Clock3 },
  { key: "validados", label: "Validados", icon: ShieldCheck },
  { key: "atendidos", label: "Atendidos", icon: CheckCircle2 },
  { key: "rechazados", label: "Rechazados", icon: AlertCircle },
  { key: "archivados", label: "Archivados", icon: Archive }
] as const;

type KpiGridProps = {
  summary?: Summary;
};

export function KpiGrid({ summary }: KpiGridProps) {
  return (
    <section className="kpi-grid" aria-label="Indicadores principales">
      {kpis.map((item) => {
        const Icon = item.icon;
        return (
          <article className="kpi-tile" key={item.key}>
            <Icon size={20} />
            <span>{item.label}</span>
            <strong>{summary?.[item.key] ?? 0}</strong>
          </article>
        );
      })}
    </section>
  );
}
