import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CountPoint, PeriodPoint } from "../services/api";

type ChartsPanelProps = {
  byCategory: CountPoint[];
  byZone: CountPoint[];
  byPeriod: PeriodPoint[];
};

export function ChartsPanel({ byCategory, byZone, byPeriod }: ChartsPanelProps) {
  return (
    <section className="charts-grid" aria-label="Graficos de indicadores">
      <article className="panel">
        <header className="panel-header">
          <h2>Reportes por categoria</h2>
        </header>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byCategory.slice(0, 8)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="total" fill="#007c89" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </article>
      <article className="panel">
        <header className="panel-header">
          <h2>Reportes por zona</h2>
        </header>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={byZone.slice(0, 8)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nombre" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="total" fill="#7f5af0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </article>
      <article className="panel wide-panel">
        <header className="panel-header">
          <h2>Volumen por periodo</h2>
        </header>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={byPeriod}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="periodo" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#d97706" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </article>
    </section>
  );
}
