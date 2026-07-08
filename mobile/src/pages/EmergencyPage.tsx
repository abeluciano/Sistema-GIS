import { IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { Ambulance, Flame, Phone, Shield } from "lucide-react";

const contacts = [
  { label: "Serenazgo", phone: "tel:000000000", icon: Shield },
  { label: "Comisaría", phone: "tel:105", icon: Phone },
  { label: "Bomberos", phone: "tel:116", icon: Flame },
  { label: "Ambulancia", phone: "tel:106", icon: Ambulance }
];

export function EmergencyPage() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Emergencia</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <main className="page-body">
          <section className="notice-band">
            Esta sección complementa el reporte ciudadano cuando necesitas atención inmediata.
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
