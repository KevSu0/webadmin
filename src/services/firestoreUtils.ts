// Ultra-simplified Firestore utilities - NO retry logic or persistent connections
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  collection, 
  query, 
  getDocs, 
  where, 
  orderBy, 
  limit,
  DocumentReference,
  CollectionReference,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';

// Ultra-simple Firestore operations - NO withRetry wrapper
export const firestoreUtils = {
  // Get a single document
  getDocument: async <T>(docRef: DocumentReference): Promise<T | null> => {
    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() } as T;
        return data;
      }
      return null;
    } catch (error: any) {
      console.error('Error getting document:', error);
      throw error;
    }
  },
  
  // Set a document
  setDocument: async <T>(docRef: DocumentReference, data: T): Promise<void> => {
    try {
      await setDoc(docRef, data);
      console.log('✅ Document saved successfully');
    } catch (error: any) {
      console.error('Error setting document:', error);
      throw error;
    }
  },
  
  // Update a document
  updateDocument: async (docRef: DocumentReference, data: any): Promise<void> => {
    try {
      await updateDoc(docRef, data);
      console.log('✅ Document updated successfully');
    } catch (error: any) {
      console.error('Error updating document:', error);
      throw error;
    }
  },
  
  // Delete a document
  deleteDocument: async (docRef: DocumentReference): Promise<void> => {
    try {
      await deleteDoc(docRef);
      console.log('✅ Document deleted successfully');
    } catch (error: any) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },
  
  // Get multiple documents from a collection
  getCollection: async <T>(
    collectionRef: CollectionReference,
    constraints: QueryConstraint[] = []
  ): Promise<T[]> => {
    try {
      const q = query(collectionRef, ...constraints);
      const querySnapshot = await getDocs(q);
      
      const results: T[] = [];
      querySnapshot.forEach((doc) => {
        results.push({ id: doc.id, ...doc.data() } as T);
      });
      
      return results;
    } catch (error: any) {
      console.error('Error getting collection:', error);
      throw error;
    }
  }
};

// Helper functions for common operations
export const createDocRef = (collectionName: string, docId?: string) => {
  return docId ? doc(db, collectionName, docId) : doc(collection(db, collectionName));
};

export const createCollectionRef = (collectionName: string) => {
  return collection(db, collectionName);
};

// Simple helper functions - NO retry logic
export const getDocumentById = async <T>(collectionName: string, docId: string): Promise<T | null> => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error: any) {
    console.error(`Error getting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
};

export const getCollectionData = async <T>(collectionName: string): Promise<T[]> => {
  try {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    
    const results: T[] = [];
    querySnapshot.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() } as T);
    });
    
    return results;
  } catch (error: any) {
    console.error(`Error getting collection ${collectionName}:`, error);
    throw error;
  }
};

// NO withRetry function - removed completely
console.log('🚀 Ultra-simplified Firestore utilities loaded - NO retry logic or persistent connections');