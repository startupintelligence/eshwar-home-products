/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly PUBLIC_FIREBASE_API_KEY?: string;
  readonly PUBLIC_FIREBASE_AUTH_DOMAIN?: string;
  readonly PUBLIC_FIREBASE_PROJECT_ID?: string;
  readonly PUBLIC_FIREBASE_APP_ID?: string;
  readonly PUBLIC_GA4_ID?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly PUBLIC_GOOGLE_MAPS_API_KEY?: string;
}
