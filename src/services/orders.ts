// Orders service functions
import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  DocumentSnapshot
} from 'firebase/firestore';
import { db } from './firebase';
import { firestoreUtils, getDocumentById, getCollectionData } from './firestoreUtils';
import { Order, Cart, Address } from '../types';

// Create new order from cart
export const createOrder = async (
  userId: string,
  cart: Cart,
  shippingAddress: Address,
  paymentMethod: string
): Promise<string> => {
  try {
    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => {
      const price = item.product.offerPrice > 0 ? item.product.offerPrice : item.product.price;
      return sum + (price * item.quantity);
    }, 0);
    
    const shippingCost = subtotal > 1000 ? 0 : 50; // Free shipping over $1000
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + shippingCost + tax;
    
    // Create order document
    const orderData = {
      userId,
      items: cart.items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.imageUrls[0] || '',
        price: item.product.offerPrice > 0 ? item.product.offerPrice : item.product.price,
        quantity: item.quantity,
        subtotal: (item.product.offerPrice > 0 ? item.product.offerPrice : item.product.price) * item.quantity
      })),
      shippingAddress,
      paymentMethod,
      subtotal,
      shippingCost,
      tax,
      total,
      status: 'pending',
      trackingNumber: '',
      estimatedDelivery: null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, 'orders'), orderData);
    return docRef.id;
  } catch (error: any) {
    console.error('Error creating order:', error);
    throw error;
  }
};

// Get orders for a specific user
export const getUserOrders = async (
  userId: string,
  pageSize: number = 10,
  lastDoc?: DocumentSnapshot
): Promise<{ orders: Order[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    let q = query(
      collection(db, 'orders'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    q = query(q, limit(pageSize));
    
    const snapshot = await getDocs(q);
    const orders: Order[] = [];
    let newLastDoc: DocumentSnapshot | null = null;
    
    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
      newLastDoc = doc;
    });
    
    return { orders, lastDoc: newLastDoc };
  } catch (error: any) {
    console.error('Error getting user orders:', error);
    throw error;
  }
};

// Get all orders (admin)
export const getAllOrders = async (
  pageSize: number = 20,
  lastDoc?: DocumentSnapshot,
  status?: string
): Promise<{ orders: Order[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    let q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    
    if (status && status !== 'all') {
      q = query(collection(db, 'orders'), where('status', '==', status), orderBy('createdAt', 'desc'));
    }
    
    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }
    q = query(q, limit(pageSize));
    
    const snapshot = await getDocs(q);
    const orders: Order[] = [];
    let newLastDoc: DocumentSnapshot | null = null;
    
    snapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() } as Order);
      newLastDoc = doc;
    });
    
    return { orders, lastDoc: newLastDoc };
  } catch (error: any) {
    console.error('Error getting all orders:', error);
    throw error;
  }
};

// Get single order by ID
export const getOrder = async (orderId: string): Promise<Order | null> => {
  try {
    const order = await getDocumentById<Omit<Order, 'id'>>('orders', orderId);
    return order ? { id: orderId, ...order } : null;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (
  orderId: string,
  status: Order['status'],
  trackingNumber?: string,
  estimatedDelivery?: Date
): Promise<void> => {
  try {
    const docRef = doc(db, 'orders', orderId);
    const updateData: any = {
      status,
      updatedAt: serverTimestamp()
    };
    
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    
    if (estimatedDelivery) {
      updateData.estimatedDelivery = estimatedDelivery;
    }
    
    await updateDoc(docRef, updateData);
  } catch (error: any) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

// Get order statistics (admin)
export const getOrderStatistics = async (): Promise<{
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}> => {
  try {
    const snapshot = await getDocs(collection(db, 'orders'));
    
    let totalOrders = 0;
    let pendingOrders = 0;
    let processingOrders = 0;
    let shippedOrders = 0;
    let deliveredOrders = 0;
    let cancelledOrders = 0;
    let totalRevenue = 0;
    
    snapshot.forEach((doc) => {
      const order = doc.data() as Order;
      totalOrders++;
      
      switch (order.status) {
        case 'pending':
          pendingOrders++;
          break;
        case 'processing':
          processingOrders++;
          break;
        case 'shipped':
          shippedOrders++;
          break;
        case 'delivered':
          deliveredOrders++;
          totalRevenue += order.total;
          break;
        case 'cancelled':
          cancelledOrders++;
          break;
      }
    });
    
    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue
    };
  } catch (error: any) {
    console.error('Error getting order statistics:', error);
    throw error;
  }
};

// Search orders by order ID or customer email
export const searchOrders = async (searchTerm: string): Promise<Order[]> => {
  try {
    // This is a basic implementation. For better search,
    // consider using Algolia or similar search service
    const orders = await getCollectionData<Order>('orders');
    const searchLower = searchTerm.toLowerCase();
    
    const filteredOrders = orders.filter(order => 
      order.id.toLowerCase().includes(searchLower) ||
      order.shippingAddress.email?.toLowerCase().includes(searchLower) ||
      order.trackingNumber?.toLowerCase().includes(searchLower)
    );
    
    return filteredOrders.sort((a, b) => {
      const aTime = a.createdAt?.toMillis() || 0;
      const bTime = b.createdAt?.toMillis() || 0;
      return bTime - aTime;
    });
  } catch (error: any) {
    console.error('Error searching orders:', error);
    throw error;
  }
};