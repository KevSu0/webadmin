// Authentication context using real-time Firebase listeners
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';
import { auth, enableFirestoreNetwork } from '../services/firebase';
import { User } from '../types';
import { getUserData, logout as signOutUser } from '../services/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const bootstrapUser = useCallback(async (uid: string) => {
    try {
      // Make sure network is enabled (no-op if already)
      await enableFirestoreNetwork();

      const userData = await getUserData(uid);
      if (!userData) {
        // Only attempt write if online
        if (!navigator.onLine) {
          throw new Error('Offline - postpone user creation');
        }
        
        console.warn('📄 User document not found. Creating basic user profile.');
        const basicUser: User = {
          uid: uid,
          email: auth.currentUser?.email || '',
          displayName: auth.currentUser?.displayName || 'New User',
          phone: auth.currentUser?.phoneNumber || '',
          role: 'customer',
          addresses: [],
          status: 'active',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        };
        
        await setDoc(doc(db, 'users', uid), basicUser);
        console.log('✅ Basic user profile created');
        return basicUser;
      }
      return userData;
    } catch (error) {
      console.warn('User bootstrap skipped:', (error as Error).message);
      // Queue a retry when navigator.onLine flips to true
      const retryOnline = () => {
        console.log('🔄 Retrying user bootstrap after coming online');
        bootstrapUser(uid);
      };
      window.addEventListener('online', retryOnline, { once: true });
      throw error;
    }
  }, []);

  const fetchUserData = useCallback(async (user: FirebaseUser) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`🔍 Fetching user data for UID: ${user.uid}`);
      const userData = await bootstrapUser(user.uid);
      setCurrentUser(userData);
      console.log('✅ User data fetched successfully');
    } catch (err) {
      console.error('❌ Error fetching user data:', err);
      setError('Failed to load user profile.');
      // Fallback to prevent app crash
      setCurrentUser({
        uid: user.uid,
        email: user.email || '',
        displayName: 'Error Loading Profile',
        role: 'customer',
        addresses: [],
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } finally {
      setLoading(false);
    }
  }, [bootstrapUser]);

  const refetchUser = useCallback(async () => {
    if (firebaseUser) {
      await fetchUserData(firebaseUser);
    }
  }, [firebaseUser, fetchUserData]);

  const logout = async () => {
    try {
      await signOutUser();
      // onAuthStateChanged will handle the state updates
    } catch (error) {
      console.error('Error signing out:', error);
      setError('Failed to sign out.');
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed. User:', user ? user.uid : 'null');
      setFirebaseUser(user);
      
      if (user) {
        await fetchUserData(user);
      } else {
        setCurrentUser(null);
        setLoading(false);
        setError(null);
      }
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('Cleaning up auth state listener.');
      unsubscribe();
    };
  }, [fetchUserData]);

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    loading,
    error,
    logout,
    refetchUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};