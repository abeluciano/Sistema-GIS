import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { AlertTriangle, FileText, LogOut, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Inicio ciudadano</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <main className="page-body">
          <section className="hero-band">
            <p>Hola, {user?.displayName ?? "ciudadano"}</p>
            <h2>Reportes georreferenciados para una ciudad mas segura</h2>
          </section>

          <div className="action-grid">
            <IonButton className="action-button primary" onClick={() => navigate("/nuevo-reporte")}>
              <PlusCircle size={22} />
              <span>Nuevo reporte</span>
            </IonButton>
            <IonButton className="action-button" fill="outline" onClick={() => navigate("/mis-reportes")}>
              <FileText size={22} />
              <span>Mis reportes</span>
            </IonButton>
            <IonButton className="action-button danger" fill="outline" onClick={() => navigate("/emergencia")}>
              <AlertTriangle size={22} />
              <span>Emergencia</span>
            </IonButton>
            <IonButton className="action-button" fill="clear" onClick={logout}>
              <LogOut size={22} />
              <span>Cerrar sesion</span>
            </IonButton>
          </div>
        </main>
      </IonContent>
    </IonPage>
  );
}
