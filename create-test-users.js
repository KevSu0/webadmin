// Create test users for login testing - simplified approach
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';
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
    
    // Try to create user document in Firestore
    // This might fail due to security rules, but the auth user will still exist
    try {
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
    } catch (firestoreError) {
      console.log(`⚠️ User created in Auth but Firestore document creation failed (this is expected due to security rules)`);
      console.log(`   The user can still login, and the document will be created on first login`);
    }
    
    // Sign out the user
    await signOut(auth);
    
    return {
      uid: user.uid,
      email: userInfo.email,
      role: userInfo.role
    };
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log(`⚠️ User ${userInfo.email} already exists - this is fine for testing`);
      return { email: userInfo.email, role: userInfo.role, exists: true };
    } else {
      console.error(`❌ Failed to create user ${userInfo.email}:`, error.message);
      throw error;
    }
  }
}

async function createAllTestUsers() {
  console.log('🔐 Creating Test Users for Camera World');
  console.log('=====================================');
  console.log('Note: Users will be created in Firebase Auth.');
  console.log('Firestore documents will be created automatically on first login.\n');
  
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
    console.log('\nNote: User documents will be created in Firestore automatically');
    console.log('when users first log in through the application.');
    
  } catch (error) {
    console.error('❌ Failed to create test users:', error.message);
    process.exit(1);
  }
}

createAllTestUsers();