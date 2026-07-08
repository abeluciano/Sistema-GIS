import { env } from "./env.js";

let cachedAuth = null;

function normalizePrivateKey(value) {
  return value?.replace(/\\n/g, "\n");
}

export async function resolveFirebaseAuth() {
  if (cachedAuth) return cachedAuth;

  if (!env.FIREBASE_PROJECT_ID || !env.FIREBASE_CLIENT_EMAIL || !env.FIREBASE_PRIVATE_KEY) {
    return null;
  }

  const [{ cert, getApps, initializeApp }, { getAuth }] = await Promise.all([
    import("firebase-admin/app"),
    import("firebase-admin/auth")
  ]);

  if (getApps().length === 0) {
    initializeApp({
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: normalizePrivateKey(env.FIREBASE_PRIVATE_KEY)
      })
    });
  }

  cachedAuth = getAuth();
  return cachedAuth;
}

export function createConfiguredFirebaseAuthLoader() {
  return async () => resolveFirebaseAuth();
}
