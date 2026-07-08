import { IonButton, IonContent, IonPage, IonText } from "@ionic/react";
import { LogIn } from "lucide-react";
import { AppLogo } from "../components/AppLogo";
import { useAuth } from "../hooks/useAuth";

export function WelcomePage() {
  const { loginWithGoogle } = useAuth();

  return (
    <IonPage>
      <IonContent fullscreen>
        <main className="welcome-screen">
          <AppLogo />
          <h1>Sistema GIS Ciudadano</h1>
          <IonText>
            Reporta incidentes ciudadanos georreferenciados y ayuda a mejorar la seguridad de tu comunidad.
          </IonText>
          <IonButton expand="block" size="large" onClick={loginWithGoogle}>
            <LogIn size={20} />
            <span>Loguearme con Google</span>
          </IonButton>
        </main>
      </IonContent>
    </IonPage>
  );
}
