import { auth, db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  limit 
} from 'firebase/firestore';
import { signInAnonymously, signOut } from 'firebase/auth';
import { toast } from 'sonner';

interface SecurityTestResult {
  operation: string;
  success: boolean;
  error?: string;
  authenticated: boolean;
}

// Test basic read operations without authentication
export const testUnauthenticatedRead = async (): Promise<SecurityTestResult[]> => {
  const results: SecurityTestResult[] = [];
  
  console.log('🔍 Testing unauthenticated read operations...');
  
  // Ensure user is signed out
  if (auth.currentUser) {
    await signOut(auth);
  }
  
  // Test reading public collections
  const publicCollections = ['products', 'categories', 'settings'];
  
  for (const collectionName of publicCollections) {
    try {
      const collectionRef = collection(db, collectionName);
      const q = query(collectionRef, limit(1));
      await getDocs(q);
      
      results.push({
        operation: `Read ${collectionName} collection`,
        success: true,
        authenticated: false
      });
      
      console.log(`✅ Successfully read ${collectionName} without authentication`);
    } catch (error: any) {
      results.push({
        operation: `Read ${collectionName} collection`,
        success: false,
        error: error.message,
        authenticated: false
      });
      
      console.error(`❌ Failed to read ${collectionName} without authentication:`, error.message);
    }
  }
  
  return results;
};

// Test authenticated operations
export const testAuthenticatedOperations = async (): Promise<SecurityTestResult[]> => {
  const results: SecurityTestResult[] = [];
  
  console.log('🔐 Testing authenticated operations...');
  
  try {
    // Sign in anonymously for testing
    await signInAnonymously(auth);
    console.log('✅ Anonymous authentication successful');
    
    // Test reading user-specific data
    const userCollections = ['users', 'orders', 'cart'];
    
    for (const collectionName of userCollections) {
      try {
        const collectionRef = collection(db, collectionName);
        const q = query(collectionRef, limit(1));
        await getDocs(q);
        
        results.push({
          operation: `Read ${collectionName} collection`,
          success: true,
          authenticated: true
        });
        
        console.log(`✅ Successfully read ${collectionName} with authentication`);
      } catch (error: any) {
        results.push({
          operation: `Read ${collectionName} collection`,
          success: false,
          error: error.message,
          authenticated: true
        });
        
        console.error(`❌ Failed to read ${collectionName} with authentication:`, error.message);
      }
    }
    
    // Test writing to user document
    if (auth.currentUser) {
      try {
        const userDocRef = doc(db, 'users', auth.currentUser.uid);
        await setDoc(userDocRef, {
          testField: 'security-test',
          timestamp: new Date().toISOString()
        }, { merge: true });
        
        results.push({
          operation: 'Write to user document',
          success: true,
          authenticated: true
        });
        
        console.log('✅ Successfully wrote to user document');
        
        // Clean up test data
        await updateDoc(userDocRef, {
          testField: null
        });
        
      } catch (error: any) {
        results.push({
          operation: 'Write to user document',
          success: false,
          error: error.message,
          authenticated: true
        });
        
        console.error('❌ Failed to write to user document:', error.message);
      }
    }
    
  } catch (authError: any) {
    results.push({
      operation: 'Anonymous authentication',
      success: false,
      error: authError.message,
      authenticated: false
    });
    
    console.error('❌ Anonymous authentication failed:', authError.message);
  }
  
  return results;
};

// Test specific security rule scenarios
export const testSecurityRuleScenarios = async (): Promise<SecurityTestResult[]> => {
  const results: SecurityTestResult[] = [];
  
  console.log('🛡️ Testing specific security rule scenarios...');
  
  // Test 1: Try to read another user's data (should fail)
  if (auth.currentUser) {
    try {
      const otherUserDocRef = doc(db, 'users', 'fake-user-id-12345');
      await getDoc(otherUserDocRef);
      
      results.push({
        operation: 'Read other user data (should fail)',
        success: false, // This should actually fail for good security
        error: 'Security rule allowed unauthorized access',
        authenticated: true
      });
      
      console.warn('⚠️ Security concern: Could read other user data');
    } catch (error: any) {
      results.push({
        operation: 'Read other user data (should fail)',
        success: true, // Success means security is working
        authenticated: true
      });
      
      console.log('✅ Security rule correctly blocked unauthorized access');
    }
  }
  
  // Test 2: Try to write to restricted collections
  const restrictedCollections = ['admin', 'system', 'config'];
  
  for (const collectionName of restrictedCollections) {
    try {
      const docRef = doc(db, collectionName, 'test-doc');
      await setDoc(docRef, { test: true });
      
      results.push({
        operation: `Write to ${collectionName} (should fail)`,
        success: false, // This should fail for good security
        error: 'Security rule allowed unauthorized write',
        authenticated: true
      });
      
      console.warn(`⚠️ Security concern: Could write to ${collectionName}`);
    } catch (error: any) {
      results.push({
        operation: `Write to ${collectionName} (should fail)`,
        success: true, // Success means security is working
        authenticated: true
      });
      
      console.log(`✅ Security rule correctly blocked write to ${collectionName}`);
    }
  }
  
  return results;
};

// Run comprehensive security rules test
export const runSecurityRulesTest = async (): Promise<{
  passed: number;
  failed: number;
  results: SecurityTestResult[];
  recommendations: string[];
}> => {
  console.log('🔒 Starting comprehensive Firestore security rules test...');
  
  const allResults: SecurityTestResult[] = [];
  const recommendations: string[] = [];
  
  try {
    // Test unauthenticated operations
    const unauthResults = await testUnauthenticatedRead();
    allResults.push(...unauthResults);
    
    // Test authenticated operations
    const authResults = await testAuthenticatedOperations();
    allResults.push(...authResults);
    
    // Test security scenarios
    const securityResults = await testSecurityRuleScenarios();
    allResults.push(...securityResults);
    
    // Analyze results and provide recommendations
    const failedUnauthReads = unauthResults.filter(r => !r.success && !r.authenticated);
    const failedAuthReads = authResults.filter(r => !r.success && r.authenticated);
    
    if (failedUnauthReads.length > 0) {
      recommendations.push('Consider allowing anonymous read access to public collections (products, categories)');
    }
    
    if (failedAuthReads.length > 0) {
      recommendations.push('Ensure authenticated users can read their own data and necessary collections');
    }
    
    const securityConcerns = securityResults.filter(r => r.error?.includes('Security rule allowed'));
    if (securityConcerns.length > 0) {
      recommendations.push('Review security rules - some operations that should be blocked are being allowed');
    }
    
    // Count results
    const passed = allResults.filter(r => r.success).length;
    const failed = allResults.filter(r => !r.success).length;
    
    console.log(`📊 Security test completed: ${passed} passed, ${failed} failed`);
    
    return {
      passed,
      failed,
      results: allResults,
      recommendations
    };
    
  } catch (error: any) {
    console.error('❌ Security rules test failed:', error);
    throw error;
  } finally {
    // Clean up - sign out
    if (auth.currentUser) {
      await signOut(auth);
    }
  }
};

// Display security test results
export const displaySecurityTestResults = (testResults: {
  passed: number;
  failed: number;
  results: SecurityTestResult[];
  recommendations: string[];
}) => {
  const { passed, failed, results, recommendations } = testResults;
  
  console.log('\n🔒 FIRESTORE SECURITY RULES TEST RESULTS');
  console.log('=' .repeat(50));
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${results.length}`);
  
  if (failed > 0) {
    console.log('\n❌ FAILED OPERATIONS:');
    results.filter(r => !r.success).forEach(result => {
      console.log(`  • ${result.operation}: ${result.error}`);
    });
  }
  
  if (recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    recommendations.forEach(rec => {
      console.log(`  • ${rec}`);
    });
  }
  
  // Show toast notification
  if (failed === 0) {
    toast.success(`Security rules test passed! (${passed}/${results.length})`);
  } else {
    toast.warning(`Security rules test completed with ${failed} issues`);
  }
};

// Quick security check for common issues
export const quickSecurityCheck = async (): Promise<boolean> => {
  console.log('⚡ Running quick security check...');
  
  try {
    // Test basic read access to products (should work)
    const productsRef = collection(db, 'products');
    const productsQuery = query(productsRef, limit(1));
    await getDocs(productsQuery);
    console.log('✅ Basic read access working');
    
    return true;
  } catch (error: any) {
    console.error('❌ Basic read access failed:', error.message);
    
    if (error.code === 'permission-denied') {
      console.log('🔒 Permission denied - check Firestore security rules');
      toast.error('Firestore access denied. Check security rules.');
    }
    
    return false;
  }
};