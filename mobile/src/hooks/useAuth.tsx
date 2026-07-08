import { Capacitor } from "@capacitor/core";
import { getRedirectResult, onAuthStateChanged, signInWithPopup, signInWithRedirect, signOut, type User } from "firebase/auth";
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRedirectResult(firebaseAuth)
      .then((credential) => {
        if (credential?.user) return syncProfile(credential.user);
        return undefined;
      })
      .catch(() => undefined);

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
        await signInWithRedirect(firebaseAuth, googleProvider);
        return;
      }

      const credential = await signInWithPopup(firebaseAuth, googleProvider);
      await syncProfile(credential.user);
    },
    logout: () => signOut(firebaseAuth)
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
