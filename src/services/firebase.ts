// Firebase configuration with robust connection management
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import {
  getFirestore,
  enableIndexedDbPersistence,
  connectFirestoreEmulator,
  getDoc,
  doc as firestoreDoc // alias to avoid conflict
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate configuration
const validateConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);
  
  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration fields:', missingFields);
    throw new Error(`Missing Firebase configuration: ${missingFields.join(', ')}`);
  }
};

validateConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Use emulators in development
if (import.meta.env.DEV) {
  try {
    console.log('Connecting to Firebase emulators...');
    connectAuthEmulator(auth, 'http://127.0.0.1:9099');
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    console.log('🔥 Successfully connected to Firebase emulators');
  } catch (error) {
    console.error('Error connecting to Firebase emulators:', error);
  }
}

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db)
  .then(() => console.log('🔥 Firestore offline persistence enabled'))
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore offline persistence failed: multiple tabs open?');
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore offline persistence not available in this browser.');
    } else {
      console.error('Firestore offline persistence error:', err);
    }
  });

// Export Firestore utilities
export { firestoreDoc as doc };

// Reliable connection status utility
export const getConnectionStatus = () => ({
  isOnline: navigator.onLine,
});

// Reliable connection test
export const testConnection = async (): Promise<boolean> => {
  try {
    // Attempt to read a non-existent document from Firestore root.
    // This is a lightweight operation that verifies connectivity.
    await getDoc(firestoreDoc(db, '_internal/health-check'));
    console.log('✅ Firebase connection successful.');
    return true;
  } catch (error) {
    console.error('❌ Firebase connection test failed:', error);
    return false;
  }
};

console.log('🚀 Firebase initialized with robust connection management');

export default app;