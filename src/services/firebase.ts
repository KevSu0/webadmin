// Firebase configuration with robust connection management
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  connectFirestoreEmulator,
  getDoc,
  enableNetwork,
  doc as firestoreDoc // alias to avoid conflict
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { setLogLevel } from 'firebase/app';

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

// Enable debug logging for Firebase
setLogLevel('debug');

// Initialize Firebase - ensure single instance
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);

// Initialize Firestore with long-polling fallback (useFetchStreams not available in current SDK)
export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,   // Fall back to long-polling if needed
  // Force long-polling if auto-detect doesn't work:
  // experimentalForceLongPolling: true,
  localCache: persistentLocalCache({ 
    tabManager: persistentMultipleTabManager() 
  })
});

export const storage = getStorage(app);

// Use emulators in development - DISABLED to use live Firebase services
// if (import.meta.env.DEV) {
//   try {
//     console.log('Connecting to Firebase emulators...');
//     connectAuthEmulator(auth, 'http://127.0.0.1:9099');
//     connectFirestoreEmulator(db, '127.0.0.1', 8080);
//     connectStorageEmulator(storage, '127.0.0.1', 9199');
//     console.log('🔥 Successfully connected to Firebase emulators');
//   } catch (error) {
//     console.error('Error connecting to Firebase emulators:', error);
//   }
// }
console.log('🔥 Using live Firebase services (emulators disabled)');

// Modern cache is configured in initializeFirestore above
console.log('🔥 Firestore initialized with persistent local cache and multiple tab support');

// Export Firestore utilities
export { firestoreDoc as doc };

// Write operation error handling utilities
export const handleFirestoreWriteError = (error: any, operation: string) => {
  console.error(`Firestore ${operation} failed:`, {
    code: error.code,
    message: error.message,
    details: error
  });
  
  if (error.code === 'invalid-argument') {
    console.warn('Invalid argument error - check for:', {
      oversizedDoc: 'Document size > 1MB',
      undefinedFields: 'Undefined values in document data',
      invalidFieldTypes: 'Unsupported field types',
      invalidDocumentPath: 'Invalid document path or ID'
    });
  }
  
  throw error;
};

// Safe write operation wrapper
export const safeFirestoreWrite = async <T>(operation: () => Promise<T>, operationName: string): Promise<T> => {
  try {
    // Check if online before attempting write
    if (!navigator.onLine) {
      throw new Error('offline - write operation skipped');
    }
    
    return await operation();
  } catch (error: any) {
    handleFirestoreWriteError(error, operationName);
    throw error; // Re-throw after logging
  }
};

// Network management utilities
export const enableFirestoreNetwork = async () => {
  try {
    await enableNetwork(db);
    console.log('✅ Firestore network enabled');
  } catch (error) {
    console.error('❌ Failed to enable Firestore network:', error);
    throw error;
  }
};

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