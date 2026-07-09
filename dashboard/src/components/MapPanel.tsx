import L from "leaflet";
import "leaflet.heat";
import { createLayerComponent } from "@react-leaflet/core";
import { useEffect } from "react";
import { GeoJSON, LayersControl, MapContainer, TileLayer, useMap } from "react-leaflet";
import type { HeatPoint } from "../services/api";

type MapPanelProps = {
  reportsGeoJson?: GeoJSON.FeatureCollection;
  zonesGeoJson?: GeoJSON.FeatureCollection;
  zoneConcentration?: GeoJSON.FeatureCollection;
  heatmap: HeatPoint[];
};

type HeatLayerProps = {
  points: HeatPoint[];
};

const HeatLayer = createLayerComponent<L.HeatLayer, HeatLayerProps>(
  ({ points }, context) => ({
    instance: L.heatLayer(
      points.map((point) => [point.latitud, point.longitud, point.intensidad]),
      {
        radius: 28,
        blur: 22,
        minOpacity: 0.28,
        gradient: { 0.15: "#2563eb", 0.45: "#22c55e", 0.7: "#facc15", 1: "#dc2626" }
      }
    ),
    context
  }),
  (instance, props) => {
    instance.setLatLngs(props.points.map((point) => [point.latitud, point.longitud, point.intensidad]));
  }
);

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

function concentrationStyle(feature?: GeoJSON.Feature) {
  const classification = feature?.properties?.clasificacion;
  const fillColor = classification === "hotspot"
    ? "#dc2626"
    : classification === "coldspot"
      ? "#2563eb"
      : "#9ca3af";
  return { color: fillColor, weight: 2, fillColor, fillOpacity: 0.32 };
}

export function MapPanel({ reportsGeoJson, zonesGeoJson, zoneConcentration, heatmap }: MapPanelProps) {
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
          {zoneConcentration ? (
            <LayersControl.Overlay name="Hotspots y coldspots">
              <GeoJSON
                key={`concentration-${JSON.stringify(zoneConcentration.features.map((feature) => feature.properties))}`}
                data={zoneConcentration}
                style={concentrationStyle}
                onEachFeature={(feature, layer) => {
                  const props = feature.properties ?? {};
                  layer.bindPopup(
                    `<strong>${props.nombre ?? "Zona"}</strong><br/>Reportes: ${props.total ?? 0}<br/>Clasificacion: ${props.clasificacion ?? "neutral"}<br/>Puntuacion z: ${props.z_score ?? 0}`
                  );
                }}
              />
            </LayersControl.Overlay>
          ) : null}
          <LayersControl.Overlay checked name="Concentracion">
            <HeatLayer points={heatmap} />
          </LayersControl.Overlay>
        </LayersControl>
        <FitToData data={zonesGeoJson?.features.length ? zonesGeoJson : reportsGeoJson} />
      </MapContainer>
      <div className="map-legend" aria-label="Leyenda de concentracion">
        <span><i className="legend-hotspot" />Hotspot</span>
        <span><i className="legend-neutral" />Neutral</span>
        <span><i className="legend-coldspot" />Coldspot</span>
      </div>
    </section>
  );
}
