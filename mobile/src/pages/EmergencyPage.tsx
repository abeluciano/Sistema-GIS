import { IonButton, IonButtons, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { Ambulance, ChevronLeft, Flame, Phone, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const contacts = [
  { label: "Serenazgo", phone: "tel:000000000", icon: Shield },
  { label: "Comisaria", phone: "tel:105", icon: Phone },
  { label: "Bomberos", phone: "tel:116", icon: Flame },
  { label: "Ambulancia", phone: "tel:106", icon: Ambulance }
];

export function EmergencyPage() {
  const navigate = useNavigate();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton fill="clear" onClick={() => navigate("/home")} aria-label="Volver">
              <ChevronLeft size={24} />
            </IonButton>
          </IonButtons>
          <IonTitle>Emergencia</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <main className="page-body">
          <section className="notice-band">
            Esta seccion complementa el reporte ciudadano cuando necesitas atencion inmediata.
          </section>
          <div className="emergency-grid">
            {contacts.map((contact) => {
              const Icon = contact.icon;
              return (
                <IonButton key={contact.label} className="emergency-button" href={contact.phone}>
                  <Icon size={22} />
                  <span>{contact.label}</span>
                </IonButton>
              );
            })}
          </div>
        </main>
      </IonContent>
    </IonPage>
  );
}
