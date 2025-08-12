// Create test users using Firebase Admin SDK to bypass security rules
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
let app;
try {
  // Try to use service account key if available
  const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');
  try {
    const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin initialized with service account');
  } catch (error) {
    // Fallback to default credentials
    app = admin.initializeApp();
    console.log('✅ Firebase Admin initialized with default credentials');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  console.log('\nPlease ensure you have:');
  console.log('1. A serviceAccountKey.json file in the project root, OR');
  console.log('2. GOOGLE_APPLICATION_CREDENTIALS environment variable set, OR');
  console.log('3. Default credentials configured (gcloud auth application-default login)');
  process.exit(1);
}

const auth = admin.auth();
const db = admin.firestore();

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

async function createTestUser(userInfo) {
  try {
    console.log(`Creating user: ${userInfo.email}`);
    
    let userRecord;
    try {
      // Try to create new user
      userRecord = await auth.createUser({
        email: userInfo.email,
        password: userInfo.password,
        displayName: userInfo.displayName,
        emailVerified: true
      });
      console.log(`✅ User created with UID: ${userRecord.uid}`);
    } catch (error) {
      if (error.code === 'auth/email-already-exists') {
        console.log(`⚠️ User ${userInfo.email} already exists, updating...`);
        userRecord = await auth.getUserByEmail(userInfo.email);
        await auth.updateUser(userRecord.uid, {
          displayName: userInfo.displayName,
          emailVerified: true
        });
        console.log(`✅ User updated with UID: ${userRecord.uid}`);
      } else {
        throw error;
      }
    }
    
    // Set custom claims for admin role
    if (userInfo.role === 'admin') {
      await auth.setCustomUserClaims(userRecord.uid, {
        admin: true,
        role: 'admin'
      });
      console.log('✅ Admin custom claims set');
    } else {
      await auth.setCustomUserClaims(userRecord.uid, {
        role: 'customer'
      });
      console.log('✅ Customer custom claims set');
    }
    
    // Create user document in Firestore using Admin SDK (bypasses security rules)
    const userDoc = {
      email: userInfo.email,
      displayName: userInfo.displayName,
      role: userInfo.role,
      status: 'active',
      phone: '',
      addresses: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    
    await db.collection('users').doc(userRecord.uid).set(userDoc, { merge: true });
    console.log('✅ User document created in Firestore');
    
    return {
      uid: userRecord.uid,
      email: userInfo.email,
      role: userInfo.role
    };
  } catch (error) {
    console.error(`❌ Failed to create user ${userInfo.email}:`, error.message);
    throw error;
  }
}

async function createAllTestUsers() {
  console.log('🔐 Creating Test Users for Camera World (Admin SDK)');
  console.log('================================================');
  
  try {
    const createdUsers = [];
    
    for (const userInfo of testUsers) {
      const result = await createTestUser(userInfo);
      createdUsers.push(result);
      console.log(''); // Empty line for readability
    }
    
    console.log('🎉 Test user creation completed!');
    console.log('================================');
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
    console.error('❌ Failed to create test users:', error.message);
    process.exit(1);
  }
}

createAllTestUsers();