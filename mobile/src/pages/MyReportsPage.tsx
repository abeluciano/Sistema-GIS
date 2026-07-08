import { IonBadge, IonButton, IonButtons, IonContent, IonHeader, IonItem, IonLabel, IonList, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { ChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getMyReports, type CitizenReport } from "../services/api";

export function MyReportsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<CitizenReport[]>([]);

  useEffect(() => {
    if (user) getMyReports(user).then(setReports).catch(() => setReports([]));
  }, [user]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => navigate("/home")} aria-label="Volver">
              <ChevronLeft size={24} />
            </IonButton>
          </IonButtons>
          <IonTitle>Mis reportes</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList inset>
          {reports.map((report) => (
            <IonItem key={report.id} button onClick={() => navigate(`/mis-reportes/${report.id}`, { state: { report } })}>
              <IonLabel>
                <h2>{report.categoria_nombre ?? `Reporte #${report.id}`}</h2>
                <p>{new Date(report.created_at).toLocaleString()} - Urgencia {report.urgencia}</p>
              </IonLabel>
              <IonBadge>{report.estado}</IonBadge>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
}
