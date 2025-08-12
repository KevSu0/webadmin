// TypeScript interfaces for Camera World e-commerce platform
import { Timestamp } from 'firebase/firestore';

// User interfaces
export interface User {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  role: 'admin' | 'customer';
  addresses: Address[];
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface UserRegistration {
  email: string;
  password: string;
  displayName: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Product interfaces
export interface Product {
  id: string;
  name: string;
  description: string;
  features: string[];
  price: number;
  offerPrice?: number;
  categoryID: string;
  imageUrls: string[];
  images: string[];
  stock: number;
  isSecondhand: boolean;
  condition?: string;
  specialistPhone: string;
  status: 'active' | 'inactive' | 'draft';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface ProductFormData {
  name: string;
  description: string;
  features: string[];
  price: number;
  offerPrice?: number;
  categoryID: string;
  stock: number;
  isSecondhand: boolean;
  condition?: string;
  specialistPhone: string;
  images: File[];
}

// Category interfaces
export interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  status: 'active' | 'inactive' | 'pending';
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Order interfaces
export interface Order {
  id: string;
  userId: string;
  products: OrderItem[];
  shippingAddress: Address;
  totalAmount: number;
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'processing';
  paymentMethod: string;
  trackingNumber?: string;
  createdAt: Timestamp;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

// Address interface
export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  email?: string;
}

// Cart interfaces
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

// Filter interfaces
export interface ProductFilters {
  categories: string[];
  condition: 'all' | 'new' | 'secondhand';
  minPrice?: number;
  maxPrice?: number;
  sortBy: 'price-asc' | 'price-desc' | 'newest';
}

// API Response interfaces
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Loading state interface
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// Pagination interface
export interface PaginationState {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Admin role verification interface
export interface UserRole {
  uid: string;
  email: string;
  role: 'admin' | 'customer';
  displayName: string;
}

// Image upload interface
export interface ImageUploadProgress {
  file: File;
  progress: number;
  url?: string;
  error?: string;
}

// Search interface
export interface SearchParams {
  query: string;
  filters?: ProductFilters;
  page?: number;
  limit?: number;
}

// Statistics interface for admin dashboard
export interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
}