// Categories service functions
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { firestoreUtils, getDocumentById, getCollectionData } from './firestoreUtils';
import { Category } from '../types';

// Get all categories with offline support
export const getCategories = async (): Promise<Category[]> => {
  try {
    const q = query(collection(db, 'categories'), orderBy('name', 'asc'));
    const snapshot = await getDocs(q);
    const categories: Category[] = [];
    
    snapshot.forEach((doc) => {
      categories.push({ id: doc.id, ...doc.data() } as Category);
    });
    
    return categories;
  } catch (error: any) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

// Get single category by ID with offline support
export const getCategory = async (categoryId: string): Promise<Category | null> => {
  try {
    const category = await getDocumentById<Omit<Category, 'id'>>('categories', categoryId);
    return category ? { id: categoryId, ...category } : null;
  } catch (error) {
    console.error('Error fetching category:', error);
    throw error;
  }
};

// Upload category image to Firebase Storage
export const uploadCategoryImage = async (image: File): Promise<string> => {
  try {
    const imageRef = ref(storage, `categories/${Date.now()}_${image.name}`);
    const snapshot = await uploadBytes(imageRef, image);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading category image:', error);
    throw error;
  }
};

// Create new category
export const createCategory = async (categoryData: {
  name: string;
  description: string;
  image?: File;
}): Promise<string> => {
  try {
    let imageUrl = '';
    
    // Upload image if provided
    if (categoryData.image) {
      imageUrl = await uploadCategoryImage(categoryData.image);
    }
    
    // Create category document
    const docRef = await addDoc(collection(db, 'categories'), {
      name: categoryData.name,
      description: categoryData.description,
      imageUrl,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Update existing category
export const updateCategory = async (
  categoryId: string,
  categoryData: {
    name?: string;
    description?: string;
    image?: File;
  }
): Promise<void> => {
  try {
    const docRef = doc(db, 'categories', categoryId);
    const updateData: any = {
      updatedAt: serverTimestamp()
    };
    
    if (categoryData.name !== undefined) {
      updateData.name = categoryData.name;
    }
    
    if (categoryData.description !== undefined) {
      updateData.description = categoryData.description;
    }
    
    // Upload new image if provided
    if (categoryData.image) {
      // Get existing category to delete old image
      const existingCategory = await getCategory(categoryId);
      
      // Upload new image
      const newImageUrl = await uploadCategoryImage(categoryData.image);
      updateData.imageUrl = newImageUrl;
      
      // Delete old image if it exists
      if (existingCategory?.imageUrl) {
        try {
          const oldImageRef = ref(storage, existingCategory.imageUrl);
          await deleteObject(oldImageRef);
        } catch (error) {
          console.warn('Error deleting old category image:', error);
        }
      }
    }
    
    await updateDoc(docRef, updateData);
  } catch (error: any) {
    console.error('Error updating category:', error);
    throw error;
  }
};

// Delete category and its image
export const deleteCategory = async (categoryId: string): Promise<void> => {
  try {
    // Get category data first to delete image
    const category = await getCategory(categoryId);
    
    if (category?.imageUrl) {
      try {
        const imageRef = ref(storage, category.imageUrl);
        await deleteObject(imageRef);
      } catch (error) {
        console.warn('Error deleting category image:', error);
      }
    }
    
    // Delete category document
    await deleteDoc(doc(db, 'categories', categoryId));
  } catch (error: any) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Check if category has products
export const categoryHasProducts = async (categoryId: string): Promise<boolean> => {
  try {
    const { getProductsByCategory } = await import('./products');
    const products = await getProductsByCategory(categoryId);
    return products.length > 0;
  } catch (error: any) {
    console.error('Error checking category products:', error);
    throw error;
  }
};