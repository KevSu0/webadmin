// Simplified Authentication service functions leveraging Firebase's native capabilities
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
  fetchSignInMethodsForEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, UserRegistration, UserRole, ApiResponse } from '../types';
import { handleError } from '../utils/errorHandler';
import { getFirebaseErrorMessage, validateEmail, validatePasswordStrength } from '../utils/authValidation';

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    // Basic validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.message);
    }
    if (!password) {
      throw new Error('Password is required');
    }
    
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Sign in successful for user:', result.user.uid);
    return result.user;
  } catch (error: any) {
    console.error('Error signing in:', error);
    const friendlyMessage = getFirebaseErrorMessage(error.code);
    const enhancedError = new Error(friendlyMessage);
    enhancedError.name = error.code || 'SignInError';
    throw enhancedError;
  }
};

// Register new user
export const registerUser = async (userData: UserRegistration): Promise<FirebaseUser> => {
  try {
    console.log('Attempting to register user:', userData.email);

    // Validate input data
    const emailValidation = validateEmail(userData.email);
    if (!emailValidation.isValid) throw new Error(emailValidation.message);

    const passwordValidation = validatePasswordStrength(userData.password);
    if (!passwordValidation.isValid) throw new Error(passwordValidation.feedback[0] || 'Password does not meet requirements');

    if (!userData.displayName || userData.displayName.trim().length < 2) {
      throw new Error('Full name must be at least 2 characters long');
    }
    
    // Create Firebase Auth user
    const result = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    console.log('Firebase Auth user created successfully:', result.user.uid);

    // Create user document in Firestore
    await createUserDocument(result.user.uid, {
      email: userData.email,
      displayName: userData.displayName.trim(),
      phone: userData.phone || '',
      role: 'customer', // Default role
      addresses: [],
      createdAt: serverTimestamp()
    });
    
    console.log('User registration completed successfully');
    return result.user;
  } catch (error: any) {
    console.error('Error registering user:', error);
    const friendlyMessage = getFirebaseErrorMessage(error.code);
    const enhancedError = new Error(friendlyMessage);
    enhancedError.name = error.code || 'RegistrationError';
    handleError(enhancedError, 'user registration');
    throw enhancedError;
  }
};

// Helper function to create user document in Firestore
const createUserDocument = async (uid: string, userData: any): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', uid), userData);
    console.log('User document created in Firestore');
  } catch (error: any) {
    console.error('Error creating user document:', error);
    // This will be caught by the calling function (registerUser)
    throw new Error('Failed to create user profile. Please try again.');
  }
};

// Get user data from Firestore.
// Firestore's offline cache will handle this seamlessly when offline.
export const getUserData = async (uid: string): Promise<User | null> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      return { uid, ...userDoc.data() } as User;
    }
    
    console.warn(`User document not found for UID: ${uid}`);
    return null;
  } catch (error: any) {
    console.error('Error fetching user data:', error);
    // Don't throw network errors if offline, let the cache handle it.
    // Re-throw other critical errors.
    if (error.code !== 'unavailable') {
      throw new Error('Could not fetch user data.');
    }
    return null; // Return null on network error, UI should handle this state.
  }
};

// Check if user is admin
export const checkAdminRole = async (uid: string): Promise<boolean> => {
  try {
    const userData = await getUserData(uid);
    return userData?.role === 'admin';
  } catch (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
};

// Get user role information
export const getUserRole = async (uid: string): Promise<UserRole | null> => {
  try {
    const userData = await getUserData(uid);
    if (userData) {
      return {
        uid: userData.uid,
        email: userData.email,
        role: userData.role,
        displayName: userData.displayName
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
};

// Verify admin access with detailed response
export const verifyAdminAccess = async (uid: string): Promise<ApiResponse<UserRole>> => {
  try {
    const userRole = await getUserRole(uid);
    
    if (!userRole) {
      return { success: false, error: 'User not found', message: 'Unable to verify user credentials' };
    }
    
    if (userRole.role !== 'admin') {
      return { success: false, error: 'Access denied', message: 'Admin privileges required' };
    }
    
    return { success: true, data: userRole, message: 'Admin access verified' };
  } catch (error) {
    console.error('Error verifying admin access:', error);
    return { success: false, error: 'Verification failed', message: 'Unable to verify admin access' };
  }
};

// Create admin user (for initial setup)
export const createAdminUser = async (userData: UserRegistration): Promise<ApiResponse<FirebaseUser>> => {
  try {
    const result = await createUserWithEmailAndPassword(auth, userData.email, userData.password);

    // Create admin user document in Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      email: userData.email,
      displayName: userData.displayName,
      phone: userData.phone || '',
      role: 'admin', // Admin role
      addresses: [],
      createdAt: serverTimestamp()
    });

    return { success: true, data: result.user, message: 'Admin user created successfully' };
  } catch (error: any) {
    console.error('Error creating admin user:', error);
    const message = getFirebaseErrorMessage(error.code);
    return { success: false, error: error.code || 'AdminCreationError', message };
  }
};

// Sign out
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw new Error('Failed to sign out. Please try again.');
  }
};

// Update user profile
export const updateUserProfile = async (uid: string, updates: Partial<User>): Promise<void> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await setDoc(userDocRef, updates, { merge: true });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    throw new Error('Failed to update profile. Please try again.');
  }
};

// Send password reset email
export const sendPasswordReset = async (email: string): Promise<ApiResponse<void>> => {
  try {
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return { success: false, error: 'Invalid email', message: emailValidation.message! };
    }
    
    await sendPasswordResetEmail(auth, email);
    
    return {
      success: true,
      message: 'Password reset email sent successfully. Please check your inbox.'
    };
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    const friendlyMessage = getFirebaseErrorMessage(error.code);
    return { success: false, error: error.code || 'PasswordResetError', message: friendlyMessage };
  }
};

// Check if email exists using modern Firebase method
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email);
    return methods.length > 0;
  } catch (error) {
    console.error('Error checking if email exists:', error);
    // In case of error, assume it exists to prevent user from getting stuck.
    return true;
  }
};