import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeApp, type FirebaseApp } from "firebase/app";

function env(name: string) {
  return import.meta.env[name] as string | undefined;
}

const firebaseConfig = {
  apiKey: env("VITE_FIREBASE_API_KEY"),
  authDomain: env("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: env("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: env("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: env("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: env("VITE_FIREBASE_APP_ID"),
  measurementId: env("VITE_FIREBASE_MEASUREMENT_ID")
};

const hasFirebaseConfig = Boolean(firebaseConfig.apiKey && !firebaseConfig.apiKey.startsWith("replace_"));

export const dashboardFirebaseApp: FirebaseApp | null = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;

if (dashboardFirebaseApp) {
  isSupported()
    .then((supported) => {
      if (supported) getAnalytics(dashboardFirebaseApp);
    })
    .catch(() => undefined);
}
