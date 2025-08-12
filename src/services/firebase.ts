// Ultra-minimal Firebase configuration - NO persistent connections
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
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
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);
  
  if (missingFields.length > 0) {
    console.error('Missing Firebase configuration fields:', missingFields);
    throw new Error(`Missing Firebase configuration: ${missingFields.join(', ')}`);
  }
};

// Validate before initializing
validateConfig();

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Export Firestore utilities
export { doc } from 'firebase/firestore';

// NO offline persistence or complex configurations to avoid ERR_ABORTED errors
// Using only basic Firestore operations

// Simple network status
let isOnline = navigator.onLine;

// Basic network monitoring without complex listeners
const updateNetworkStatus = () => {
  const wasOnline = isOnline;
  isOnline = navigator.onLine;
  
  if (wasOnline !== isOnline) {
    console.log(isOnline ? '🌐 Network restored' : '📴 Network lost');
  }
};

// Simple network event handlers
if (typeof window !== 'undefined') {
  window.addEventListener('online', updateNetworkStatus);
  window.addEventListener('offline', updateNetworkStatus);
}

// Basic connection status utility
export const getConnectionStatus = () => ({
  isOnline: navigator.onLine
});

// Ultra-simple connection test - just check navigator.onLine
export const testConnection = async (): Promise<boolean> => {
  return navigator.onLine;
};

console.log('🚀 Firebase initialized with ultra-minimal configuration - NO persistent connections');

export default app;