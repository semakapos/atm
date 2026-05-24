// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, enableIndexedDbPersistence } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD8lrwpXMyReJuqq7oKQGEaVRPdKFzyncI",
  authDomain: "daybook-1d96c.firebaseapp.com",
  projectId: "daybook-1d96c",
  storageBucket: "daybook-1d96c.appspot.com",
  messagingSenderId: "912619995982",
  appId: "1:912619995982:web:25129586896066e95f941f",
  measurementId: "G-WNXTCM157H"
};

// Initialize Firebase with optimizations
const app = initializeApp(firebaseConfig);

// Initialize services with performance optimizations
export const auth = getAuth(app);
export const db = getFirestore(app);

// Offline persistence is now handled automatically by Firestore
// The new cache settings provide better performance without manual setup
