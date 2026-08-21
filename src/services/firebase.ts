import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { FirebaseConfig } from '../types';

const STORAGE_KEY_FIREBASE_CONFIG = 'nexservice_firebase_custom_config_v1';

// Official NexService Firebase Project Credentials
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyCaDtz0s9_yHQ8bExi0_JfKtYrX2vbG1m4",
  authDomain: "nexservice-app.firebaseapp.com",
  projectId: "nexservice-app",
  storageBucket: "nexservice-app.firebasestorage.app",
  messagingSenderId: "81611240708",
  appId: "1:81611240708:web:64ea6d3e67bb8f79340c51",
  measurementId: "G-RWZR3SREKP"
};

/**
 * Retrieves the active Firebase configuration
 */
export function getFirebaseConfig(): FirebaseConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading custom firebase config from localStorage:', e);
  }

  // Check Vite env variables, else use DEFAULT_FIREBASE_CONFIG
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || DEFAULT_FIREBASE_CONFIG.apiKey;
  const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || DEFAULT_FIREBASE_CONFIG.projectId;

  return {
    apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || DEFAULT_FIREBASE_CONFIG.authDomain,
    projectId,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || DEFAULT_FIREBASE_CONFIG.storageBucket,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || DEFAULT_FIREBASE_CONFIG.messagingSenderId,
    appId: import.meta.env.VITE_FIREBASE_APP_ID || DEFAULT_FIREBASE_CONFIG.appId,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || DEFAULT_FIREBASE_CONFIG.measurementId,
  };
}

export function saveCustomFirebaseConfig(config: FirebaseConfig): boolean {
  try {
    localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
    return true;
  } catch (e) {
    console.error('Failed to save Firebase config:', e);
    return false;
  }
}

export function clearCustomFirebaseConfig(): void {
  localStorage.removeItem(STORAGE_KEY_FIREBASE_CONFIG);
}

// Initialize Firebase App instance
let app: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

export function initializeFirebase(): { app: FirebaseApp | null; db: Firestore | null; auth: Auth | null; isConfigured: boolean } {
  const config = getFirebaseConfig();

  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    dbInstance = getFirestore(app);
    authInstance = getAuth(app);
    return { app, db: dbInstance, auth: authInstance, isConfigured: true };
  } catch (error) {
    console.warn('Firebase initialization notice:', error);
    return { app: null, db: null, auth: null, isConfigured: false };
  }
}

const initialized = initializeFirebase();
export const db = initialized.db;
export const auth = initialized.auth;
export const isFirebaseConnected = initialized.isConfigured;
