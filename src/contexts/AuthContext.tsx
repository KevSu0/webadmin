// Authentication context using real-time Firebase listeners
import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { User } from '../types';
import { getUserData, logout as signOutUser } from '../services/auth';

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

  const fetchUserData = useCallback(async (user: FirebaseUser) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`🔍 Fetching user data for UID: ${user.uid}`);
      const userData = await getUserData(user.uid);
      if (userData) {
        setCurrentUser(userData);
        console.log('✅ User data fetched successfully');
      } else {
        console.warn('📄 User document not found in Firestore. Creating a basic user profile.');
        // This can happen if user registration was interrupted.
        // We create a basic profile to ensure the app doesn't crash.
        const basicUser: User = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || 'New User',
          phone: user.phoneNumber || '',
          role: 'customer',
          addresses: [],
        };
        setCurrentUser(basicUser);
      }
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
      });
    } finally {
      setLoading(false);
    }
  }, []);

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