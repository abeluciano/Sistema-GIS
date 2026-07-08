import { Capacitor } from "@capacitor/core";
import { FirebaseAuthentication } from "@capacitor-firebase/authentication";
import { getRedirectResult, GoogleAuthProvider, onAuthStateChanged, signInWithCredential, signInWithPopup, signOut, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { firebaseAuth, googleProvider } from "../firebase/config";
import { syncProfile } from "../services/api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function readErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string") return message;
  }
  return String(error);
}

function toGoogleLoginError(error: unknown) {
  const message = readErrorMessage(error);
  if (/DEVELOPER_ERROR|ApiException:\s*10|status code:\s*10|\b10\b/i.test(message)) {
    return new Error("Firebase Android no esta autorizado. Agrega SHA-1/SHA-256 y descarga un google-services.json actualizado.");
  }
  if (/12501|cancel/i.test(message)) {
    return new Error("Inicio de sesion cancelado.");
  }
  if (/No credentials available/i.test(message)) {
    return new Error("No se encontraron cuentas Google disponibles en el dispositivo.");
  }
  return new Error(`No se pudo iniciar sesion con Google. ${message}`);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) {
      getRedirectResult(firebaseAuth)
        .then((credential) => {
          if (credential?.user) return syncProfile(credential.user);
          return undefined;
        })
        .catch(() => undefined);
    }

    return onAuthStateChanged(firebaseAuth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) await syncProfile(currentUser).catch(() => undefined);
    });
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    async loginWithGoogle() {
      if (Capacitor.isNativePlatform()) {
        try {
          const result = await FirebaseAuthentication.signInWithGoogle({ useCredentialManager: false });
          const idToken = result.credential?.idToken ?? null;
          const accessToken = result.credential?.accessToken ?? null;
          if (!idToken && !accessToken) {
            throw new Error("No se recibieron credenciales de Google.");
          }

          const credential = GoogleAuthProvider.credential(idToken, accessToken);
          const userCredential = await signInWithCredential(firebaseAuth, credential);
          await syncProfile(userCredential.user);
        } catch (error) {
          throw toGoogleLoginError(error);
        }
        return;
      }

      try {
        const credential = await signInWithPopup(firebaseAuth, googleProvider);
        await syncProfile(credential.user);
      } catch (error) {
        throw toGoogleLoginError(error);
      }
    },
    async logout() {
      if (Capacitor.isNativePlatform()) {
        await FirebaseAuthentication.signOut().catch(() => undefined);
      }
      await signOut(firebaseAuth);
    }
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
