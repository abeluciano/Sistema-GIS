import { IonButton, IonContent, IonPage, IonText } from "@ionic/react";
import { LogIn } from "lucide-react";
import { useState } from "react";
import { AppLogo } from "../components/AppLogo";
import { useAuth } from "../hooks/useAuth";

export function WelcomePage() {
  const { loginWithGoogle } = useAuth();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    setLoginError(null);
    setSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "No se pudo iniciar sesion con Google.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <IonPage>
      <IonContent fullscreen>
        <main className="welcome-screen">
          <AppLogo />
          <h1>Sistema GIS Ciudadano</h1>
          <IonText>
            Reporta incidentes ciudadanos georreferenciados y ayuda a mejorar la seguridad de tu comunidad.
          </IonText>
          <IonButton expand="block" size="large" disabled={submitting} onClick={handleLogin}>
            <LogIn size={20} />
            <span>{submitting ? "Abriendo Google" : "Loguearme con Google"}</span>
          </IonButton>
          {loginError && (
            <IonText color="danger" className="login-error">
              {loginError}
            </IonText>
          )}
        </main>
      </IonContent>
    </IonPage>
  );
}
