import { db, auth } from '../services/firebase';
import { collection, getDocs, connectFirestoreEmulator } from 'firebase/firestore';
import { connectAuthEmulator } from 'firebase/auth';
import { handleError, handleSuccess, handleInfo } from './errorHandler';

/**
 * Test Firebase connection and services
 */
export const testFirebaseConnection = async (): Promise<{
  auth: boolean;
  firestore: boolean;
  overall: boolean;
  errors: string[];
}> => {
  const results = {
    auth: false,
    firestore: false,
    overall: false,
    errors: [] as string[]
  };

  console.log('🔥 Testing Firebase connection...');
  handleInfo('Testing Firebase Connection', 'Checking authentication and database connectivity...');

  // Test Firebase Auth
  try {
    console.log('Testing Firebase Auth...');
    
    // Check if auth is initialized
    if (auth && auth.app) {
      console.log('✅ Firebase Auth initialized successfully');
      console.log('Auth config:', {
        apiKey: auth.app.options.apiKey ? '✅ Present' : '❌ Missing',
        authDomain: auth.app.options.authDomain ? '✅ Present' : '❌ Missing',
        projectId: auth.app.options.projectId ? '✅ Present' : '❌ Missing'
      });
      results.auth = true;
    } else {
      throw new Error('Firebase Auth not properly initialized');
    }
  } catch (error: any) {
    console.error('❌ Firebase Auth test failed:', error);
    results.errors.push(`Auth: ${error.message}`);
  }

  // Test Firestore
  try {
    console.log('Testing Firestore connection...');
    
    // Check if Firestore is initialized
    if (db && db.app) {
      console.log('✅ Firestore initialized successfully');
      console.log('Firestore config:', {
        projectId: db.app.options.projectId ? '✅ Present' : '❌ Missing',
        databaseURL: db.app.options.databaseURL ? '✅ Present' : '❌ Missing'
      });
      
      // Try to perform a simple read operation
      console.log('Testing Firestore read operation...');
      const testCollection = collection(db, 'connection-test');
      
      // This will test the connection without requiring any documents to exist
      await getDocs(testCollection);
      console.log('✅ Firestore read operation successful');
      results.firestore = true;
    } else {
      throw new Error('Firestore not properly initialized');
    }
  } catch (error: any) {
    console.error('❌ Firestore test failed:', error);
    results.errors.push(`Firestore: ${error.message}`);
    
    // Check for common connection issues
    if (error.message?.includes('Failed to get document because the client is offline')) {
      results.errors.push('Firestore: Client appears to be offline');
    } else if (error.message?.includes('net::ERR_ABORTED')) {
      results.errors.push('Firestore: Network request was aborted');
    } else if (error.code === 'unavailable') {
      results.errors.push('Firestore: Service temporarily unavailable');
    }
  }

  // Overall result
  results.overall = results.auth && results.firestore;

  // Log final results
  console.log('🔥 Firebase Connection Test Results:');
  console.log('Auth:', results.auth ? '✅ Connected' : '❌ Failed');
  console.log('Firestore:', results.firestore ? '✅ Connected' : '❌ Failed');
  console.log('Overall:', results.overall ? '✅ All services connected' : '❌ Some services failed');

  if (results.errors.length > 0) {
    console.log('Errors encountered:');
    results.errors.forEach(error => console.log(`  - ${error}`));
  }

  // Show user feedback
  if (results.overall) {
    handleSuccess('Firebase Connected', 'All Firebase services are working properly');
  } else {
    handleError(new Error(results.errors.join(', ')), 'Firebase connection test');
  }

  return results;
};

/**
 * Test network connectivity
 */
export const testNetworkConnectivity = async (): Promise<boolean> => {
  try {
    console.log('🌐 Testing network connectivity...');
    
    // Test basic internet connectivity
    const response = await fetch('https://www.google.com/favicon.ico', {
      method: 'HEAD',
      mode: 'no-cors',
      cache: 'no-cache'
    });
    
    console.log('✅ Network connectivity test passed');
    return true;
  } catch (error) {
    console.error('❌ Network connectivity test failed:', error);
    handleError(error, 'network connectivity test');
    return false;
  }
};

/**
 * Comprehensive Firebase and network test
 */
export const runComprehensiveTest = async () => {
  console.log('🚀 Starting comprehensive Firebase and network test...');
  
  // Test network first
  const networkOk = await testNetworkConnectivity();
  
  // Test Firebase services
  const firebaseResults = await testFirebaseConnection();
  
  // Summary
  console.log('\n📊 Test Summary:');
  console.log('Network:', networkOk ? '✅ Connected' : '❌ Failed');
  console.log('Firebase Auth:', firebaseResults.auth ? '✅ Connected' : '❌ Failed');
  console.log('Firestore:', firebaseResults.firestore ? '✅ Connected' : '❌ Failed');
  
  const allPassed = networkOk && firebaseResults.overall;
  console.log('Overall Status:', allPassed ? '✅ All tests passed' : '❌ Some tests failed');
  
  if (allPassed) {
    handleSuccess('All Tests Passed', 'Firebase and network connectivity are working properly');
  } else {
    const failedServices = [];
    if (!networkOk) failedServices.push('Network');
    if (!firebaseResults.auth) failedServices.push('Firebase Auth');
    if (!firebaseResults.firestore) failedServices.push('Firestore');
    
    handleError(
      new Error(`Failed services: ${failedServices.join(', ')}`),
      'comprehensive test'
    );
  }
  
  return {
    network: networkOk,
    firebase: firebaseResults,
    overall: allPassed
  };
};

export default {
  testFirebaseConnection,
  testNetworkConnectivity,
  runComprehensiveTest
};