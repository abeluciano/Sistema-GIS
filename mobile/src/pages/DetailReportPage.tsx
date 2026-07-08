import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { useLocation } from "react-router-dom";
import type { CitizenReport } from "../services/api";

export function DetailReportPage() {
  const location = useLocation();
  const report = (location.state as { report?: CitizenReport } | null)?.report;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Detalle de reporte</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <main className="page-body">
          {report ? (
            <section className="detail-panel">
              <h2>{report.categoria_nombre ?? `Reporte #${report.id}`}</h2>
              <p><strong>Estado:</strong> {report.estado}</p>
              <p><strong>Urgencia:</strong> {report.urgencia}</p>
              <p><strong>Descripción:</strong> {report.descripcion}</p>
              <p><strong>Ubicación:</strong> {report.latitud ?? "-"}, {report.longitud ?? "-"}</p>
              <p><strong>Fecha:</strong> {new Date(report.created_at).toLocaleString()}</p>
            </section>
          ) : (
            <section className="detail-panel">
              <h2>Reporte no cargado</h2>
              <p>Vuelve a la lista de reportes para abrir el detalle.</p>
            </section>
          )}
        </main>
      </IonContent>
    </IonPage>
  );
}
