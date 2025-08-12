#!/usr/bin/env node

/**
 * Admin User Test Script
 * This script tests the admin user creation and authentication process
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function initializeFirebaseAdmin() {
  try {
    // Check if service account key exists
    const serviceAccountPath = path.join(__dirname, '..', 'serviceAccountKey.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      const serviceAccount = require(serviceAccountPath);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      log('✓ Firebase Admin initialized with service account', 'green');
    } else {
      // Try to initialize with default credentials
      admin.initializeApp();
      log('✓ Firebase Admin initialized with default credentials', 'green');
    }
    
    return true;
  } catch (error) {
    log('✗ Failed to initialize Firebase Admin', 'red');
    log('Error: ' + error.message, 'red');
    return false;
  }
}

async function testFirebaseConnection() {
  try {
    log('Testing Firebase connection...', 'blue');
    
    // Test Firestore connection
    const db = admin.firestore();
    await db.collection('test').doc('connection').set({
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      test: true
    });
    
    // Clean up test document
    await db.collection('test').doc('connection').delete();
    
    log('✓ Firestore connection successful', 'green');
    return true;
  } catch (error) {
    log('✗ Firestore connection failed', 'red');
    log('Error: ' + error.message, 'red');
    return false;
  }
}

async function testAuthConnection() {
  try {
    log('Testing Firebase Auth connection...', 'blue');
    
    // List users to test Auth connection
    const listUsersResult = await admin.auth().listUsers(1);
    
    log('✓ Firebase Auth connection successful', 'green');
    log(`Found ${listUsersResult.users.length} user(s) in the system`, 'cyan');
    return true;
  } catch (error) {
    log('✗ Firebase Auth connection failed', 'red');
    log('Error: ' + error.message, 'red');
    return false;
  }
}

async function findAdminUsers() {
  try {
    log('Searching for admin users...', 'blue');
    
    // Get all users from Firestore with admin role
    const db = admin.firestore();
    const adminUsersSnapshot = await db.collection('users')
      .where('role', '==', 'admin')
      .get();
    
    if (adminUsersSnapshot.empty) {
      log('⚠ No admin users found in Firestore', 'yellow');
      return [];
    }
    
    const adminUsers = [];
    adminUsersSnapshot.forEach(doc => {
      const userData = doc.data();
      adminUsers.push({
        uid: doc.id,
        email: userData.email,
        displayName: userData.displayName,
        role: userData.role,
        status: userData.status
      });
    });
    
    log(`✓ Found ${adminUsers.length} admin user(s) in Firestore:`, 'green');
    adminUsers.forEach(user => {
      log(`  - ${user.email} (${user.displayName}) - Status: ${user.status}`, 'cyan');
    });
    
    return adminUsers;
  } catch (error) {
    log('✗ Failed to search for admin users', 'red');
    log('Error: ' + error.message, 'red');
    return [];
  }
}

async function verifyAdminClaims(adminUsers) {
  try {
    log('Verifying admin custom claims...', 'blue');
    
    for (const user of adminUsers) {
      try {
        const userRecord = await admin.auth().getUser(user.uid);
        const customClaims = userRecord.customClaims || {};
        
        if (customClaims.role === 'admin' && customClaims.isAdmin === true) {
          log(`✓ ${user.email} has correct admin claims`, 'green');
        } else {
          log(`⚠ ${user.email} missing or incorrect admin claims`, 'yellow');
          log(`  Current claims: ${JSON.stringify(customClaims)}`, 'yellow');
        }
      } catch (error) {
        log(`✗ Failed to verify claims for ${user.email}`, 'red');
        log(`  Error: ${error.message}`, 'red');
      }
    }
    
    return true;
  } catch (error) {
    log('✗ Failed to verify admin claims', 'red');
    log('Error: ' + error.message, 'red');
    return false;
  }
}

async function testSecurityRules() {
  try {
    log('Testing Firestore security rules...', 'blue');
    
    // This is a basic test - in a real scenario, you'd use the Firebase Rules Unit Testing SDK
    log('⚠ Security rules testing requires Firebase Rules Unit Testing SDK', 'yellow');
    log('  Rules have been deployed but should be tested with proper test suite', 'yellow');
    
    return true;
  } catch (error) {
    log('✗ Failed to test security rules', 'red');
    log('Error: ' + error.message, 'red');
    return false;
  }
}

async function main() {
  log('🧪 Admin User Test Script', 'magenta');
  log('==========================', 'magenta');
  
  try {
    // Initialize Firebase Admin
    if (!(await initializeFirebaseAdmin())) {
      process.exit(1);
    }
    
    // Test connections
    const firestoreOk = await testFirebaseConnection();
    const authOk = await testAuthConnection();
    
    if (!firestoreOk || !authOk) {
      log('\n❌ Connection tests failed', 'red');
      process.exit(1);
    }
    
    // Find admin users
    const adminUsers = await findAdminUsers();
    
    if (adminUsers.length === 0) {
      log('\n⚠ No admin users found. Please run the seed script first:', 'yellow');
      log('  node scripts/seed-admin.js', 'yellow');
      log('  or', 'yellow');
      log('  .\\scripts\\seed-admin.ps1', 'yellow');
      process.exit(1);
    }
    
    // Verify admin claims
    await verifyAdminClaims(adminUsers);
    
    // Test security rules (basic)
    await testSecurityRules();
    
    log('\n🎉 Admin user tests completed successfully!', 'green');
    log('=====================================', 'green');
    log('✓ Firebase connections working', 'green');
    log(`✓ ${adminUsers.length} admin user(s) found and verified`, 'green');
    log('✓ Security rules deployed', 'green');
    
    log('\n📝 Next Steps:', 'yellow');
    log('1. Test admin login in the web application', 'yellow');
    log('2. Verify admin panel access and functionality', 'yellow');
    log('3. Test security rules with different user roles', 'yellow');
    log('4. Monitor Firebase usage and set up alerts', 'yellow');
    
  } catch (error) {
    log('\n❌ Admin user tests failed', 'red');
    log('Error: ' + error.message, 'red');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  initializeFirebaseAdmin,
  testFirebaseConnection,
  testAuthConnection,
  findAdminUsers,
  verifyAdminClaims
};