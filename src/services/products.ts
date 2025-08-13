// Products service functions
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  DocumentSnapshot
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';
import { firestoreUtils, getDocumentById, getCollectionData } from './firestoreUtils';
import { Product, ProductFormData, ProductFilters } from '../types';

// Get all products with optional filtering and pagination
export const getProducts = async (
  filters?: ProductFilters,
  pageSize: number = 20,
  lastDoc?: DocumentSnapshot
): Promise<{ products: Product[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    let q = query(collection(db, 'products'));

    // Apply filters
    if (filters) {
      if (filters.categories.length > 0) {
        q = query(q, where('categoryID', 'in', filters.categories));
      }
      
      if (filters.condition !== 'all') {
        q = query(q, where('isSecondhand', '==', filters.condition === 'secondhand'));
      }
      
      if (filters.minPrice !== undefined) {
        q = query(q, where('price', '>=', filters.minPrice));
      }
      
      if (filters.maxPrice !== undefined) {
        q = query(q, where('price', '<=', filters.maxPrice));
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'price-asc':
          q = query(q, orderBy('price', 'asc'));
          break;
        case 'price-desc':
          q = query(q, orderBy('price', 'desc'));
          break;
        case 'newest':
        default:
          q = query(q, orderBy('createdAt', 'desc'));
          break;
      }
    } else {
      q = query(q, orderBy('createdAt', 'desc'));
    }

    // Apply pagination
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    q = query(q, limit(pageSize));

    const snapshot = await getDocs(q);
    const products: Product[] = [];
    let newLastDoc: DocumentSnapshot | null = null;

    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
      newLastDoc = doc;
    });

    return { products, lastDoc: newLastDoc };
  } catch (error: any) {
    console.error('Error getting products:', error);
    throw error;
  }
};

// Get single product by ID with offline support
export const getProduct = async (productId: string): Promise<Product | null> => {
  try {
    const product = await getDocumentById<Omit<Product, 'id'>>('products', productId);
    return product ? { id: productId, ...product } : null;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

// Search products by name or description with offline support
export const searchProducts = async (searchTerm: string): Promise<Product[]> => {
  try {
    const response = await fetch(`/api/products/search?term=${searchTerm}`);
    if (!response.ok) {
        throw new Error('Failed to search products');
    }
    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

// Upload product images to Firebase Storage
export const uploadProductImages = async (images: File[]): Promise<string[]> => {
  try {
    const uploadPromises = images.map(async (image) => {
      const imageRef = ref(storage, `products/${Date.now()}_${image.name}`);
      const snapshot = await uploadBytes(imageRef, image);
      return await getDownloadURL(snapshot.ref);
    });
    
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};

// Create new product
export const createProduct = async (productData: ProductFormData): Promise<string> => {
  try {
    // Upload images first
    const imageUrls = await uploadProductImages(productData.images);
    
    // Create product document
    const docRef = await addDoc(collection(db, 'products'), {
      name: productData.name,
      description: productData.description,
      features: productData.features,
      price: productData.price,
      offerPrice: productData.offerPrice,
      categoryID: productData.categoryID,
      imageUrls,
      stock: productData.stock,
      isSecondhand: productData.isSecondhand,
      condition: productData.condition,
      specialistPhone: productData.specialistPhone,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating product:', error);
    throw error;
  }
};

// Update existing product
export const updateProduct = async (
  productId: string,
  productData: Partial<ProductFormData>,
  newImages?: File[]
): Promise<void> => {
  try {
    const docRef = doc(db, 'products', productId);
    const updateData: any = {
      ...productData,
      updatedAt: serverTimestamp()
    };
    
    // Upload new images if provided
    if (newImages && newImages.length > 0) {
      const newImageUrls = await uploadProductImages(newImages);
      
      // Get existing product to merge image URLs
      const existingProduct = await getProduct(productId);
      if (existingProduct) {
        updateData.imageUrls = [...existingProduct.imageUrls, ...newImageUrls];
      } else {
        updateData.imageUrls = newImageUrls;
      }
    }
    
    await updateDoc(docRef, updateData);
  } catch (error: any) {
    console.error('Error updating product:', error);
    throw error;
  }
};

// Delete product and its images
export const deleteProduct = async (productId: string): Promise<void> => {
  try {
    // Get product data first to delete images
    const product = await getProduct(productId);
    
    if (product) {
      // Delete images from storage
      const deleteImagePromises = product.imageUrls.map(async (imageUrl) => {
        try {
          const imageRef = ref(storage, imageUrl);
          await deleteObject(imageRef);
        } catch (error) {
          console.warn('Error deleting image:', error);
        }
      });
      
      await Promise.all(deleteImagePromises);
    }
    
    // Delete product document
    await deleteDoc(doc(db, 'products', productId));
  } catch (error: any) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Get products by category
export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, 'products'),
      where('categoryID', '==', categoryId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const products: Product[] = [];
    
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    
    return products;
  } catch (error: any) {
    console.error('Error getting products by category:', error);
    throw error;
  }
};

// Get featured products (products with offer prices)
export const getFeaturedProducts = async (limitCount: number = 8): Promise<Product[]> => {
  try {
    const q = query(
      collection(db, 'products'),
      where('offerPrice', '>', 0),
      orderBy('offerPrice', 'asc'),
      limit(limitCount)
    );
    
    const snapshot = await getDocs(q);
    const products: Product[] = [];
    
    snapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as Product);
    });
    
    return products;
  } catch (error: any) {
    console.error('Error getting featured products:', error);
    throw error;
  }
};