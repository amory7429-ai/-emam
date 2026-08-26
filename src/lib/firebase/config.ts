// Firebase configuration — lazy-initialized, client-only
// Prevents initialization during SSG/build time

import { type FirebaseApp } from 'firebase/app';
import type { Auth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function getApp(): FirebaseApp {
  if (app) return app;
  // Dynamic import to prevent SSG execution
  throw new Error(
    'Firebase not initialized. Call initializeFirebaseClient() first.'
  );
}

function getAuthInstance(): Auth {
  if (auth) return auth;
  throw new Error(
    'Firebase Auth not initialized. Call initializeFirebaseClient() first.'
  );
}

function getFirestoreInstance(): Firestore {
  if (db) return db;
  throw new Error(
    'Firebase Firestore not initialized. Call initializeFirebaseClient() first.'
  );
}

// Safe lazy initializer — only runs in browser
let initPromise: Promise<void> | null = null;

export async function initializeFirebaseClient(): Promise<void> {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (typeof window === 'undefined') return; // Skip on server
    if (app) return; // Already initialized

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey || apiKey === 'your_api_key_here') {
      // No Firebase config — run in degraded mode (no auth)
      return;
    }

    const { initializeApp, getApps } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
    const { getFirestore } = await import('firebase/firestore');

    if (getApps().length > 0) {
      app = getApps()[0];
    } else {
      app = initializeApp({
        apiKey,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      });
    }

    auth = getAuth(app);
    db = getFirestore(app);
  })();

  return initPromise;
}

// Getters that auto-initialize on first call (client only)
export function getFirebaseApp(): FirebaseApp | null {
  if (app) return app;
  if (typeof window !== 'undefined') {
    initializeFirebaseClient();
  }
  return null;
}

export function getFirebaseAuth(): Auth | null {
  if (auth) return auth;
  if (typeof window !== 'undefined') {
    initializeFirebaseClient();
  }
  return null;
}

export function getFirebaseDb(): Firestore | null {
  if (db) return db;
  if (typeof window !== 'undefined') {
    initializeFirebaseClient();
  }
  return null;
}

export const firebase = {
  get app() { return getFirebaseApp(); },
  get auth() { return getFirebaseAuth(); },
  get db() { return getFirebaseDb(); },
};
