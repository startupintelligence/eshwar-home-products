import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const config = {
  apiKey: import.meta.env.PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: import.meta.env.PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: import.meta.env.PUBLIC_FIREBASE_PROJECT_ID ?? "",
  appId: import.meta.env.PUBLIC_FIREBASE_APP_ID ?? "",
};

export const firebaseReady = Object.values(config).every(Boolean);
const app = firebaseReady ? (getApps()[0] ?? initializeApp(config)) : null;

export const auth = app ? getAuth(app) : null;
export const db = app ? getFirestore(app) : null;
