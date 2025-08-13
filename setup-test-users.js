// Complete test user setup script
// 1. Deploy temporary Firestore rules
// 2. Create test users
// 3. Restore original rules

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Test users to create
const testUsers = [
  {
    email: 'admin@cameraworld.com',
    password: 'admin123',
    displayName: 'Admin User',
    role: 'admin'
  },
  {
    email: 'customer@test.com',
    password: 'customer123',
    displayName: 'Test Customer',
    role: 'customer'
  }
];

function executeCommand(command, description) {
  try {
    console.log(`🔄 ${description}...`);
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} completed`);
    return result;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

function backupOriginalRules() {
  if (existsSync('firestore.rules') && !existsSync('firestore.rules.backup')) {
    const originalRules = readFileSync('firestore.rules', 'utf8');
    writeFileSync('firestore.rules.backup', originalRules);
    console.log('✅ Original rules backed up');
  }
}

async function deployTemporaryRules() {
  try {
    // Copy temp rules to main rules file
    const tempRules = readFileSync('firestore.rules.temp', 'utf8');
    writeFileSync('firestore.rules', tempRules);
    
    // Deploy the temporary rules
    executeCommand('firebase deploy --only firestore:rules', 'Deploying temporary Firestore rules');
    
    // Wait a bit for rules to propagate
    console.log('⏳ Waiting for rules to propagate...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('❌ Failed to deploy temporary rules:', error.message);
    throw error;
  }
}

function restoreOriginalRules() {
  try {
    if (existsSync('firestore.rules.backup')) {
      const originalRules = readFileSync('firestore.rules.backup', 'utf8');
      writeFileSync('firestore.rules', originalRules);
      
      // Deploy the original rules
      executeCommand('firebase deploy --only firestore:rules', 'Restoring original Firestore rules');
      
      console.log('✅ Original rules restored');
    }
  } catch (error) {
    console.error('❌ Failed to restore original rules:', error.message);
    throw error;
  }
}

async function createTestUser(userInfo) {
  try {
    console.log(`Creating user: ${userInfo.email}`);
    
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      userInfo.email, 
      userInfo.password
    );
    
    const user = userCredential.user;
    console.log(`✅ User created with UID: ${user.uid}`);
    
    // Create user document in Firestore
    const userDoc = {
      email: userInfo.email,
      displayName: userInfo.displayName,
      role: userInfo.role,
      status: 'active',
      phone: '',
      addresses: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(doc(db, 'users', user.uid), userDoc);
    console.log(`✅ User document created in Firestore`);
    
    // Sign out the user
    await signOut(auth);
    
    return {
      uid: user.uid,
      email: userInfo.email,
      role: userInfo.role
    };
  } catch (error) {
    if (error.code === 'auth/email-already-exists') {
      console.log(`⚠️ User ${userInfo.email} already exists`);
      return { email: userInfo.email, role: userInfo.role, exists: true };
    } else {
      console.error(`❌ Failed to create user ${userInfo.email}:`, error.message);
      throw error;
    }
  }
}

async function setupTestUsers() {
  console.log('🔐 Setting up Test Users for Camera World');
  console.log('========================================');
  
  try {
    // Step 1: Backup original rules
    backupOriginalRules();
    
    // Step 2: Deploy temporary rules
    await deployTemporaryRules();
    
    // Step 3: Create test users
    console.log('\n👥 Creating test users...');
    const createdUsers = [];
    
    for (const userInfo of testUsers) {
      const result = await createTestUser(userInfo);
      createdUsers.push(result);
      console.log(''); // Empty line for readability
    }
    
    // Step 4: Restore original rules
    console.log('\n🔒 Restoring security rules...');
    restoreOriginalRules();
    
    console.log('\n🎉 Test user setup completed!');
    console.log('==============================');
    console.log('\nTest Credentials:');
    console.log('Admin Login:');
    console.log('  Email: admin@cameraworld.com');
    console.log('  Password: admin123');
    console.log('\nCustomer Login:');
    console.log('  Email: customer@test.com');
    console.log('  Password: customer123');
    console.log('\nYou can now test login at:');
    console.log('  Admin: http://localhost:5173/admin/login');
    console.log('  Customer: http://localhost:5173/login');
    
  } catch (error) {
    console.error('\n❌ Test user setup failed:', error.message);
    
    // Try to restore original rules even if setup failed
    try {
      console.log('\n🔄 Attempting to restore original rules...');
      restoreOriginalRules();
    } catch (restoreError) {
      console.error('❌ Failed to restore original rules:', restoreError.message);
    }
    
    process.exit(1);
  }
}

setupTestUsers();