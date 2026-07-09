import L from "leaflet";
import { useEffect } from "react";
import { CircleMarker, GeoJSON, LayerGroup, LayersControl, MapContainer, Popup, TileLayer, useMap } from "react-leaflet";
import type { HeatPoint } from "../services/api";

type MapPanelProps = {
  reportsGeoJson?: GeoJSON.FeatureCollection;
  zonesGeoJson?: GeoJSON.FeatureCollection;
  heatmap: HeatPoint[];
};

function FitToData({ data }: { data?: GeoJSON.FeatureCollection }) {
  const map = useMap();

  useEffect(() => {
    if (!data?.features.length) return;
    const layer = L.geoJSON(data);
    const bounds = layer.getBounds();
    if (bounds.isValid()) map.fitBounds(bounds, { padding: [24, 24], maxZoom: 15 });
  }, [data, map]);

  return null;
}

function reportPoint(feature: GeoJSON.Feature, latlng: L.LatLngExpression) {
  const estado = String(feature.properties?.estado ?? "pendiente");
  const color = estado === "atendido" ? "#15803d" : estado === "rechazado" ? "#b91c1c" : estado === "validado" ? "#007c89" : "#d97706";
  return L.circleMarker(latlng, {
    radius: 7,
    color,
    weight: 2,
    fillColor: color,
    fillOpacity: 0.72
  });
}

export function MapPanel({ reportsGeoJson, zonesGeoJson, heatmap }: MapPanelProps) {
  return (
    <section className="panel map-panel" aria-label="Mapa GIS">
      <header className="panel-header">
        <div>
          <h2>Mapa GIS</h2>
          <p>Reportes georreferenciados, zonas y calor operativo</p>
        </div>
      </header>
      <MapContainer className="gis-map" center={[-16.432, -71.525]} zoom={13} scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LayersControl position="topright">
          {zonesGeoJson ? (
            <LayersControl.Overlay checked name="Zonas analiticas">
              <GeoJSON
                key={`zones-${zonesGeoJson.features.length}`}
                data={zonesGeoJson}
                style={{ color: "#2563eb", weight: 1.5, fillColor: "#60a5fa", fillOpacity: 0.12 }}
                onEachFeature={(feature, layer) => {
                  layer.bindPopup(`<strong>${feature.properties?.nombre ?? "Zona"}</strong>`);
                }}
              />
            </LayersControl.Overlay>
          ) : null}
          {reportsGeoJson ? (
            <LayersControl.Overlay checked name="Reportes">
              <GeoJSON
                key={`reports-${reportsGeoJson.features.length}`}
                data={reportsGeoJson}
                pointToLayer={reportPoint}
                onEachFeature={(feature, layer) => {
                  const props = feature.properties ?? {};
                  layer.bindPopup(
                    `<strong>${props.categoria ?? "Reporte"}</strong><br/>Estado: ${props.estado ?? "-"}<br/>Zona: ${props.zona ?? "Sin zona"}`
                  );
                }}
              />
            </LayersControl.Overlay>
          ) : null}
          <LayersControl.Overlay checked name="Concentracion">
            <LayerGroup>
              {heatmap.map((point) => (
                <CircleMarker
                  key={`${point.latitud}-${point.longitud}-${point.intensidad}`}
                  center={[point.latitud, point.longitud]}
                  radius={Math.max(6, Math.min(24, point.intensidad * 4))}
                  pathOptions={{ color: "#f97316", fillColor: "#f97316", fillOpacity: 0.28, weight: 1 }}
                >
                  <Popup>Intensidad: {point.intensidad}</Popup>
                </CircleMarker>
              ))}
            </LayerGroup>
          </LayersControl.Overlay>
        </LayersControl>
        <FitToData data={zonesGeoJson?.features.length ? zonesGeoJson : reportsGeoJson} />
      </MapContainer>
    </section>
  );
}
