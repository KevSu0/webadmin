// Authentication service functions
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, getConnectionStatus, testConnection } from './firebase';
import { User, UserRegistration, UserRole, ApiResponse } from '../types';
import { handleError, handleSuccess, createNetworkError } from '../utils/errorHandler';
import { getFirebaseErrorMessage, validateEmail, validatePasswordStrength } from '../utils/authValidation';

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<FirebaseUser> => {
  try {
    // Basic validation before attempting sign in
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.message);
    }
    
    if (!password) {
      throw new Error('Password is required');
    }
    
    // Check connection status before attempting sign in
    const connectionStatus = getConnectionStatus();
    if (!connectionStatus.isOnline) {
      throw createNetworkError(new Error('No internet connection. Please check your network and try again.'));
    }
    
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log('Sign in successful for user:', result.user.uid);
    return result.user;
  } catch (error: any) {
    console.error('Error signing in:', error);
    
    // Handle network errors
    if (error.code === 'network-request-failed' || error.message.includes('network')) {
      console.warn('Network error detected during sign in');
    }
    
    // Create user-friendly error message
    const friendlyMessage = error.code ? getFirebaseErrorMessage(error.code) : error.message;
    const enhancedError = new Error(friendlyMessage);
    enhancedError.name = error.code || 'SignInError';
    
    throw enhancedError;
  }
};

// Register new user with retry logic
export const registerUser = async (userData: UserRegistration, retryCount = 0): Promise<FirebaseUser> => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000;
  
  try {
    console.log('Attempting to register user:', userData.email);
    
    // Check connection status before attempting registration
    const connectionStatus = getConnectionStatus();
    if (!connectionStatus.isOnline) {
      throw createNetworkError(new Error('No internet connection. Please check your network and try again.'));
    }
    
    // Validate input data
    const emailValidation = validateEmail(userData.email);
    if (!emailValidation.isValid) {
      throw new Error(emailValidation.message);
    }
    
    const passwordValidation = validatePasswordStrength(userData.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.feedback[0] || 'Password does not meet requirements');
    }
    
    if (!userData.displayName || userData.displayName.trim().length < 2) {
      throw new Error('Full name must be at least 2 characters long');
    }
    
    // Create Firebase Auth user
    const result = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );
    
    console.log('Firebase Auth user created successfully:', result.user.uid);

    // Create user document in Firestore with retry logic
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
    
    // Handle network/connection errors with retry
    const networkErrorCodes = ['unavailable', 'network-request-failed', 'timeout', 'cancelled'];
    const isNetworkError = networkErrorCodes.includes(error.code) || error.message.includes('offline') || error.message.includes('network');
    
    if (isNetworkError && retryCount < MAX_RETRIES) {
      console.log(`Retrying user registration (${retryCount + 1}/${MAX_RETRIES})...`);
      
      if (retryCount < MAX_RETRIES) {
        return new Promise((resolve, reject) => {
          setTimeout(async () => {
            try {
              const result = await registerUser(userData, retryCount + 1);
              resolve(result);
            } catch (retryError) {
              reject(retryError);
            }
          }, RETRY_DELAY * (retryCount + 1));
        });
      }
    }
    
    // Create user-friendly error message
    const friendlyMessage = error.code ? getFirebaseErrorMessage(error.code) : error.message;
    const enhancedError = new Error(friendlyMessage);
    enhancedError.name = error.code || 'RegistrationError';
    
    handleError(enhancedError, 'user registration');
    throw enhancedError;
  }
};

// Helper function to create user document with retry logic
const createUserDocument = async (uid: string, userData: any, retryCount = 0): Promise<void> => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;
  
  try {
    // Check connection status before attempting to create document
    const connectionStatus = getConnectionStatus();
    if (!connectionStatus.isOnline) {
      throw createNetworkError(new Error('No internet connection. Unable to create user profile.'));
    }
    
    await setDoc(doc(db, 'users', uid), userData);
    console.log('User document created in Firestore');
  } catch (error: any) {
    console.error('Error creating user document:', error);
    
    // Handle network errors with enhanced retry logic
    const networkErrorCodes = ['unavailable', 'network-request-failed', 'timeout', 'cancelled'];
    const isNetworkError = networkErrorCodes.includes(error.code) || error.message.includes('offline') || error.message.includes('network');
    
    if (isNetworkError && retryCount < MAX_RETRIES) {
      console.log(`Retrying user document creation (${retryCount + 1}/${MAX_RETRIES})...`);
      
      // Wait before retrying
      
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            await createUserDocument(uid, userData, retryCount + 1);
            resolve();
          } catch (retryError) {
            reject(retryError);
          }
        }, RETRY_DELAY * (retryCount + 1));
      });
    }
    
    throw error;
  }
};

// Get user data from Firestore with retry logic
export const getUserData = async (uid: string, retryCount = 0): Promise<User | null> => {
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 1000;
  
  try {
    // Check connection status before attempting to fetch data
    const connectionStatus = getConnectionStatus();
    if (!connectionStatus.isOnline && retryCount === 0) {
      console.warn('Offline - attempting to fetch user data from cache');
    }
    
    const userDoc = await getDoc(doc(db, 'users', uid));
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return {
        uid,
        ...userData
      } as User;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error fetching user data:', error);
    
    // Handle network errors with enhanced retry logic
    const networkErrorCodes = ['unavailable', 'network-request-failed', 'timeout', 'cancelled'];
    const isNetworkError = networkErrorCodes.includes(error.code) || error.message.includes('offline') || error.message.includes('network');
    
    if (isNetworkError && retryCount < MAX_RETRIES) {
      console.log(`Retrying user data fetch (${retryCount + 1}/${MAX_RETRIES})...`);
      
      // Test connection before retrying
      await testConnection();
      
      return new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const result = await getUserData(uid, retryCount + 1);
            resolve(result);
          } catch (retryError) {
            reject(retryError);
          }
        }, RETRY_DELAY * (retryCount + 1));
      });
    }
    
    // If we're offline and have exhausted retries, throw a more user-friendly error
    if (!getConnectionStatus().isOnline) {
      throw createNetworkError(new Error('Unable to fetch user data. Please check your internet connection and try again.'));
    }
    
    throw error;
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
      return {
        success: false,
        error: 'User not found',
        message: 'Unable to verify user credentials'
      };
    }
    
    if (userRole.role !== 'admin') {
      return {
        success: false,
        error: 'Access denied',
        message: 'Admin privileges required'
      };
    }
    
    return {
      success: true,
      data: userRole,
      message: 'Admin access verified'
    };
  } catch (error) {
    console.error('Error verifying admin access:', error);
    return {
      success: false,
      error: 'Verification failed',
      message: 'Unable to verify admin access'
    };
  }
};

// Create admin user (for initial setup)
export const createAdminUser = async (userData: UserRegistration): Promise<ApiResponse<FirebaseUser>> => {
  try {
    const result = await createUserWithEmailAndPassword(
      auth,
      userData.email,
      userData.password
    );

    // Create admin user document in Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      email: userData.email,
      displayName: userData.displayName,
      phone: userData.phone || '',
      role: 'admin', // Admin role
      addresses: [],
      createdAt: serverTimestamp()
    });

    return {
      success: true,
      data: result.user,
      message: 'Admin user created successfully'
    };
  } catch (error) {
    console.error('Error creating admin user:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      message: 'Failed to create admin user'
    };
  }
};

// Sign out
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (uid: string, updates: Partial<User>): Promise<void> => {
  try {
    await setDoc(doc(db, 'users', uid), updates, { merge: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Send password reset email
export const sendPasswordReset = async (email: string): Promise<ApiResponse<void>> => {
  try {
    // Validate email format
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return {
        success: false,
        error: 'Invalid email',
        message: emailValidation.message!
      };
    }
    
    await sendPasswordResetEmail(auth, email);
    
    return {
      success: true,
      message: 'Password reset email sent successfully. Please check your inbox and follow the instructions to reset your password.'
    };
  } catch (error: any) {
    console.error('Error sending password reset email:', error);
    
    const friendlyMessage = error.code ? getFirebaseErrorMessage(error.code) : 'Failed to send password reset email';
    
    return {
      success: false,
      error: error.code || 'PasswordResetError',
      message: friendlyMessage
    };
  }
};

// Check if email exists (for better UX)
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    // This is a workaround since Firebase doesn't provide a direct way to check if email exists
    // We'll try to send a password reset email and catch the error
    await sendPasswordResetEmail(auth, email);
    return true;
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      return false;
    }
    // For other errors, assume email exists to avoid revealing information
    return true;
  }
};