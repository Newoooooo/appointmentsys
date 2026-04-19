// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, browserLocalPersistence, setPersistence } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCmVJaUfbsN408yL4QzTa-nn8bC24vMA2g",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "dreamandsnaptest.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "dreamandsnaptest",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "dreamandsnaptest.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "385809984885",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:385809984885:web:357c58036964477f26773c",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-CBXLNK4PCD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics (optional - only in browser environment)
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Initialize Auth with persistent local session ("remember me")
const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch(console.error);

export { app, analytics, db, auth };
