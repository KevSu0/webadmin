// Ultra-simplified Authentication context - NO persistent listeners
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, signOut } from 'firebase/auth';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { User } from '../types';

interface AuthContextType {
  currentUser: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
  checkAuthState: () => Promise<void>;
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

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setFirebaseUser(null);
      setError(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  // Ultra-simple user data fetch - no timeouts or complex logic
  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<void> => {
    try {
      setError(null);
      console.log(`🔍 Fetching user data for UID: ${firebaseUser.uid}`);
      
      // Direct Firestore get() call - no timeout wrapper
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as Omit<User, 'uid'>;
        const user = {
          uid: firebaseUser.uid,
          ...userData
        };
        
        setCurrentUser(user);
        console.log('✅ User data fetched successfully');
      } else {
        console.warn('📄 User document not found in Firestore');
        // Create basic user object from Firebase auth data
        const basicUser: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          phone: '',
          role: 'customer', // Default role
          addresses: [],
          status: 'active',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        };
        setCurrentUser(basicUser);
      }
    } catch (error: any) {
      console.error('❌ Error fetching user data:', error);
      
      // Fallback: create basic user from Firebase auth
      const basicUser: User = {
        uid: firebaseUser.uid,
        email: firebaseUser.email || '',
        displayName: firebaseUser.displayName || '',
        phone: '',
        role: 'customer',
        addresses: [],
        status: 'active',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };
      setCurrentUser(basicUser);
      setError(null); // Don't show error, use fallback
    }
  };
  
  // Manual refetch function
  const refetchUser = async (): Promise<void> => {
    if (firebaseUser) {
      setLoading(true);
      await fetchUserData(firebaseUser);
      setLoading(false);
    }
  };
  
  // Manual auth state check - NO persistent listeners
  const checkAuthState = async (): Promise<void> => {
    try {
      setLoading(true);
      const firebaseUser = auth.currentUser;
      console.log('🔍 Manual auth check:', firebaseUser ? `User ${firebaseUser.uid}` : 'No user');
      
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        await fetchUserData(firebaseUser);
      } else {
        setCurrentUser(null);
        setError(null);
      }
    } catch (error) {
      console.error('Manual auth check error:', error);
      setCurrentUser(null);
      setError('Authentication check failed');
    } finally {
      setLoading(false);
    }
  };
  
  // Simple one-time auth check on mount - NO listeners
  useEffect(() => {
    checkAuthState();
  }, []);

  const value: AuthContextType = {
    currentUser,
    firebaseUser,
    loading,
    error,
    logout,
    refetchUser,
    checkAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};