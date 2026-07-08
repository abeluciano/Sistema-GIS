import { env } from "./env.js";

let cachedAuth = null;

function normalizePrivateKey(value) {
  return value?.replace(/\\n/g, "\n");
}

export async function resolveFirebaseAuth() {
  if (cachedAuth) return cachedAuth;

  if (!env.FIREBASE_PROJECT_ID) {
    return null;
  }

  const [{ cert, getApps, initializeApp }, { getAuth }] = await Promise.all([
    import("firebase-admin/app"),
    import("firebase-admin/auth")
  ]);

  if (getApps().length === 0) {
    const hasServiceAccount = env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY;
    initializeApp(hasServiceAccount ? {
      credential: cert({
        projectId: env.FIREBASE_PROJECT_ID,
        clientEmail: env.FIREBASE_CLIENT_EMAIL,
        privateKey: normalizePrivateKey(env.FIREBASE_PRIVATE_KEY)
      })
    } : {
      projectId: env.FIREBASE_PROJECT_ID
    });
  }

  cachedAuth = getAuth();
  return cachedAuth;
}

export function createConfiguredFirebaseAuthLoader() {
  return async () => resolveFirebaseAuth();
}
