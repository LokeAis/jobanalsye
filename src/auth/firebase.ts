import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';

/**
 * Client-side Firebase initialization. The web config below is NOT secret
 * (it's safe to expose in the browser), but we read it from Vite env vars so
 * the same build can target different Firebase projects without code changes.
 *
 * Set these in a .env file (see .env.example):
 *   VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN, VITE_FIREBASE_PROJECT_ID,
 *   VITE_FIREBASE_APP_ID  (storageBucket/messagingSenderId optional)
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

/** True when the build has Firebase config; lets the UI degrade gracefully. */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: FirebaseApp | undefined;
let authInstance: Auth | undefined;

export const getFirebaseAuth = (): Auth | null => {
  if (!isFirebaseConfigured) return null;
  if (!authInstance) {
    app = initializeApp(firebaseConfig);
    authInstance = getAuth(app);
  }
  return authInstance;
};

export const googleProvider = new GoogleAuthProvider();
