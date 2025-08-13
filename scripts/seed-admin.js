#!/usr/bin/env node

/**
 * Admin User Seed Script
 * This script creates an admin user with email/password and sets up their role in Firestore
 */

const admin = require('firebase-admin');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

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

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePassword(password) {
  return password.length >= 6;
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
    log('\nPlease ensure you have:', 'yellow');
    log('1. A serviceAccountKey.json file in the project root, OR', 'yellow');
    log('2. GOOGLE_APPLICATION_CREDENTIALS environment variable set, OR', 'yellow');
    log('3. Default credentials configured (gcloud auth application-default login)', 'yellow');
    return false;
  }
}

async function createAdminUser(email, password, displayName) {
  try {
    log('Creating admin user...', 'blue');
    
    // Create user with email and password
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
      displayName: displayName || 'Admin User',
      emailVerified: true
    });
    
    log(`✓ Admin user created with UID: ${userRecord.uid}`, 'green');
    
    // Set custom claims for admin role
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: 'admin',
      isAdmin: true
    });
    
    log('✓ Admin custom claims set', 'green');
    
    // Create user document in Firestore
    const userDoc = {
      email: email,
      displayName: displayName || 'Admin User',
      role: 'admin',
      status: 'active',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await admin.firestore().collection('users').doc(userRecord.uid).set(userDoc);
    
    log('✓ Admin user document created in Firestore', 'green');
    
    return {
      uid: userRecord.uid,
      email: email,
      displayName: displayName || 'Admin User'
    };
  } catch (error) {
    log('✗ Failed to create admin user', 'red');
    
    if (error.code === 'auth/email-already-exists') {
      log('Email already exists. Trying to update existing user...', 'yellow');
      return await updateExistingUser(email, displayName);
    } else {
      log('Error: ' + error.message, 'red');
      throw error;
    }
  }
}

async function updateExistingUser(email, displayName) {
  try {
    // Get user by email
    const userRecord = await admin.auth().getUserByEmail(email);
    
    // Update user
    await admin.auth().updateUser(userRecord.uid, {
      displayName: displayName || 'Admin User',
      emailVerified: true
    });
    
    // Set custom claims for admin role
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      role: 'admin',
      isAdmin: true
    });
    
    log('✓ Admin custom claims updated', 'green');
    
    // Update user document in Firestore
    const userDoc = {
      email: email,
      displayName: displayName || 'Admin User',
      role: 'admin',
      status: 'active',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await admin.firestore().collection('users').doc(userRecord.uid).set(userDoc, { merge: true });
    
    log('✓ Admin user document updated in Firestore', 'green');
    
    return {
      uid: userRecord.uid,
      email: email,
      displayName: displayName || 'Admin User'
    };
  } catch (error) {
    log('✗ Failed to update existing user', 'red');
    log('Error: ' + error.message, 'red');
    throw error;
  }
}

async function main() {
  log('🔐 Admin User Seed Script', 'magenta');
  log('=========================', 'magenta');
  
  try {
    // Initialize Firebase Admin
    if (!(await initializeFirebaseAdmin())) {
      process.exit(1);
    }
    
    log('\nThis script will create an admin user for your Camera World application.', 'cyan');
    log('Please provide the following information:', 'cyan');
    
    // Get admin email
    let email;
    do {
      email = await question('\nAdmin Email: ');
      if (!validateEmail(email)) {
        log('Please enter a valid email address.', 'red');
      }
    } while (!validateEmail(email));
    
    // Get admin password
    let password;
    do {
      password = await question('Admin Password (min 6 characters): ');
      if (!validatePassword(password)) {
        log('Password must be at least 6 characters long.', 'red');
      }
    } while (!validatePassword(password));
    
    // Get display name (optional)
    const displayName = await question('Display Name (optional, press Enter to skip): ') || 'Admin User';
    
    log('\nCreating admin user...', 'blue');
    
    // Create admin user
    const adminUser = await createAdminUser(email, password, displayName);
    
    log('\n🎉 Admin user created successfully!', 'green');
    log('=====================================', 'green');
    log(`UID: ${adminUser.uid}`, 'cyan');
    log(`Email: ${adminUser.email}`, 'cyan');
    log(`Display Name: ${adminUser.displayName}`, 'cyan');
    log(`Role: admin`, 'cyan');
    
    log('\n📝 Next Steps:', 'yellow');
    log('1. You can now log in to the admin panel with these credentials', 'yellow');
    log('2. The user has been granted admin privileges in both Auth and Firestore', 'yellow');
    log('3. Make sure to keep these credentials secure', 'yellow');
    
  } catch (error) {
    log('\n❌ Failed to create admin user', 'red');
    log('Error: ' + error.message, 'red');
    process.exit(1);
  } finally {
    rl.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  createAdminUser,
  updateExistingUser
};
