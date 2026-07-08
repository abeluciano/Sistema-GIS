import { Download, RefreshCw, Search } from "lucide-react";
import type { Category, ReportFilters, Zone } from "../services/api";

type FiltersBarProps = {
  categories: Category[];
  zones: Zone[];
  filters: ReportFilters;
  onChange: (filters: ReportFilters) => void;
  onSearch: () => void;
  onRefresh: () => void;
  onExport: () => void;
  loading?: boolean;
};

export function FiltersBar({ categories, zones, filters, onChange, onSearch, onRefresh, onExport, loading }: FiltersBarProps) {
  function update(key: keyof ReportFilters, value: string) {
    onChange({ ...filters, [key]: value || undefined });
  }

  return (
    <section className="filters-bar" aria-label="Filtros">
      <label>
        Estado
        <select value={filters.estado ?? ""} onChange={(event) => update("estado", event.target.value)}>
          <option value="">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="validado">Validado</option>
          <option value="rechazado">Rechazado</option>
          <option value="atendido">Atendido</option>
          <option value="archivado">Archivado</option>
        </select>
      </label>
      <label>
        Categoria
        <select value={filters.categoria_id ?? ""} onChange={(event) => update("categoria_id", event.target.value)}>
          <option value="">Todas</option>
          {categories.map((category) => (
            <option value={category.id} key={category.id}>{category.nombre}</option>
          ))}
        </select>
      </label>
      <label>
        Zona
        <select value={filters.zona_id ?? ""} onChange={(event) => update("zona_id", event.target.value)}>
          <option value="">Todas</option>
          {zones.map((zone) => (
            <option value={zone.id} key={zone.id}>{zone.nombre}</option>
          ))}
        </select>
      </label>
      <label>
        Urgencia
        <select value={filters.urgencia ?? ""} onChange={(event) => update("urgencia", event.target.value)}>
          <option value="">Todas</option>
          <option value="baja">Baja</option>
          <option value="media">Media</option>
          <option value="alta">Alta</option>
          <option value="critica">Critica</option>
        </select>
      </label>
      <label>
        Desde
        <input type="date" value={filters.fecha_inicio ?? ""} onChange={(event) => update("fecha_inicio", event.target.value)} />
      </label>
      <label>
        Hasta
        <input type="date" value={filters.fecha_fin ?? ""} onChange={(event) => update("fecha_fin", event.target.value)} />
      </label>
      <div className="filter-actions">
        <button type="button" className="icon-button" onClick={onRefresh} aria-label="Actualizar" title="Actualizar datos" disabled={loading}>
          <RefreshCw size={17} />
        </button>
        <button type="button" className="icon-button" onClick={onExport} aria-label="Exportar CSV" title="Exportar CSV" disabled={loading}>
          <Download size={17} />
        </button>
        <button type="button" className="icon-button search-button" onClick={onSearch} aria-label="Aplicar filtros" title="Aplicar filtros" disabled={loading}>
          <Search size={18} />
        </button>
      </div>
    </section>
  );
}
