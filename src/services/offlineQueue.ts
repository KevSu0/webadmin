// Simplified offline queue system for graceful degradation
import { getConnectionStatus } from './firebase';
import { showDataSyncNotification, showOfflineModeNotification } from './connectionNotifications';

interface QueuedOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  documentId?: string;
  data?: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  priority: 'high' | 'medium' | 'low';
  metadata?: {
    userAction?: string;
    context?: string;
  };
}

interface QueueStats {
  totalOperations: number;
  pendingOperations: number;
  failedOperations: number;
  syncedOperations: number;
  lastSyncAttempt: number | null;
  isProcessing: boolean;
}

class OfflineQueueManager {
  private queue: QueuedOperation[] = [];
  private isProcessing = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private storageKey = 'firestore_offline_queue';
  private stats: QueueStats = {
    totalOperations: 0,
    pendingOperations: 0,
    failedOperations: 0,
    syncedOperations: 0,
    lastSyncAttempt: null,
    isProcessing: false
  };

  constructor() {
    this.loadQueueFromStorage();
    this.initializeConnectionListener();
    this.startPeriodicSync();
  }

  // Initialize connection listener
  private initializeConnectionListener(): void {
    window.addEventListener('online', () => {
      if (this.queue.length > 0) {
        console.log('🔄 Connection restored, processing offline queue');
        this.processQueue();
      }
    });
  }

  // Start periodic sync attempts
  private startPeriodicSync(): void {
    this.syncInterval = setInterval(() => {
      if (this.queue.length > 0 && !this.isProcessing && navigator.onLine) {
        this.processQueue();
      }
    }, 30000); // Try every 30 seconds
  }

  // Add operation to queue
  public enqueue(operation: Omit<QueuedOperation, 'id' | 'timestamp' | 'retryCount'>): string {
    const queuedOp: QueuedOperation = {
      ...operation,
      id: this.generateOperationId(),
      timestamp: Date.now(),
      retryCount: 0
    };

    // Insert based on priority
    const insertIndex = this.findInsertIndex(queuedOp.priority);
    this.queue.splice(insertIndex, 0, queuedOp);

    this.stats.totalOperations++;
    this.stats.pendingOperations++;

    this.saveQueueToStorage();
    
    console.log(`📝 Queued ${operation.type} operation for ${operation.collection}`, queuedOp);
    
    // Show user notification
    const actionText = this.getActionText(operation.type, operation.collection);
    showOfflineModeNotification(actionText);

    // Try to process immediately if online
    if (navigator.onLine) {
      setTimeout(() => this.processQueue(), 100);
    }

    return queuedOp.id;
  }

  // Process the queue
  public async processQueue(): Promise<void> {
    if (this.isProcessing || this.queue.length === 0) {
      return;
    }

    this.isProcessing = true;
    this.stats.isProcessing = true;
    this.stats.lastSyncAttempt = Date.now();

    console.log(`🔄 Processing offline queue (${this.queue.length} operations)`);

    const processedOperations: string[] = [];
    const failedOperations: string[] = [];

    // Process operations in order
    for (const operation of [...this.queue]) {
      try {
        await this.executeOperation(operation);
        processedOperations.push(operation.id);
        this.stats.syncedOperations++;
        this.stats.pendingOperations--;
        
        console.log(`✅ Successfully synced operation ${operation.id}`);
        
      } catch (error) {
        console.error(`❌ Failed to sync operation ${operation.id}:`, error);
        
        operation.retryCount++;
        
        if (operation.retryCount >= operation.maxRetries) {
          failedOperations.push(operation.id);
          this.stats.failedOperations++;
          this.stats.pendingOperations--;
          
          console.error(`💀 Operation ${operation.id} exceeded max retries`);
        }
      }
    }

    // Remove processed and failed operations
    this.queue = this.queue.filter(op => 
      !processedOperations.includes(op.id) && !failedOperations.includes(op.id)
    );

    this.saveQueueToStorage();
    this.isProcessing = false;
    this.stats.isProcessing = false;

    // Show sync results
    if (processedOperations.length > 0) {
      showDataSyncNotification('success', `Synced ${processedOperations.length} offline changes`);
    }
    
    if (failedOperations.length > 0) {
      showDataSyncNotification('error', `Failed to sync ${failedOperations.length} changes`);
    }

    console.log(`🏁 Queue processing complete. Synced: ${processedOperations.length}, Failed: ${failedOperations.length}, Remaining: ${this.queue.length}`);
  }

  // Execute a single operation
  private async executeOperation(operation: QueuedOperation): Promise<void> {
    const { type, collection, documentId, data } = operation;

    // Import Firestore functions dynamically to avoid circular dependencies
    const { setDocument, updateDocument, deleteDocument, getDocument } = await import('./firestoreUtils');
    const { doc, db } = await import('./firebase');

    switch (type) {
      case 'create':
        if (documentId && data) {
          const docRef = doc(db, collection, documentId);
          await setDocument(docRef, data);
        } else {
          throw new Error(`Invalid ${type} operation: missing documentId or data`);
        }
        break;
        
      case 'update':
        if (documentId && data) {
          const docRef = doc(db, collection, documentId);
          await updateDocument(docRef, data);
        } else {
          throw new Error(`Invalid ${type} operation: missing documentId or data`);
        }
        break;
        
      case 'delete':
        if (documentId) {
          const docRef = doc(db, collection, documentId);
          await deleteDocument(docRef);
        } else {
          throw new Error('Invalid delete operation: missing documentId');
        }
        break;
        
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
  }

  // Generate unique operation ID
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Find insert index based on priority
  private findInsertIndex(priority: 'high' | 'medium' | 'low'): number {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const targetPriority = priorityOrder[priority];

    for (let i = 0; i < this.queue.length; i++) {
      if (priorityOrder[this.queue[i].priority] > targetPriority) {
        return i;
      }
    }
    
    return this.queue.length;
  }

  // Get action text for notifications
  private getActionText(type: string, collection: string): string {
    const actionMap = {
      create: 'New',
      update: 'Updated',
      delete: 'Deleted'
    };
    
    const collectionMap = {
      users: 'user data',
      products: 'product',
      categories: 'category',
      orders: 'order'
    };
    
    const action = actionMap[type as keyof typeof actionMap] || type;
    const item = collectionMap[collection as keyof typeof collectionMap] || collection;
    
    return `${action} ${item}`;
  }

  // Save queue to localStorage
  private saveQueueToStorage(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify({
        queue: this.queue,
        stats: this.stats
      }));
    } catch (error) {
      console.error('Failed to save offline queue to storage:', error);
    }
  }

  // Load queue from localStorage
  private loadQueueFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const { queue, stats } = JSON.parse(stored);
        this.queue = queue || [];
        this.stats = { ...this.stats, ...stats };
        
        console.log(`📦 Loaded ${this.queue.length} operations from offline queue`);
      }
    } catch (error) {
      console.error('Failed to load offline queue from storage:', error);
      this.queue = [];
    }
  }

  // Get queue statistics
  public getStats(): QueueStats {
    return { ...this.stats };
  }

  // Get queue contents
  public getQueue(): QueuedOperation[] {
    return [...this.queue];
  }

  // Clear queue (for testing or manual intervention)
  public clearQueue(): void {
    this.queue = [];
    this.stats = {
      totalOperations: 0,
      pendingOperations: 0,
      failedOperations: 0,
      syncedOperations: 0,
      lastSyncAttempt: null,
      isProcessing: false
    };
    this.saveQueueToStorage();
    
    console.log('🗑️ Offline queue cleared');
  }

  // Remove specific operation
  public removeOperation(operationId: string): boolean {
    const index = this.queue.findIndex(op => op.id === operationId);
    if (index !== -1) {
      this.queue.splice(index, 1);
      this.stats.pendingOperations--;
      this.saveQueueToStorage();
      return true;
    }
    return false;
  }

  // Cleanup
  public cleanup(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }
}

// Export singleton instance
export const offlineQueue = new OfflineQueueManager();

// Utility functions for common operations
export const queueCreateOperation = (
  collection: string,
  documentId: string,
  data: any,
  priority: 'high' | 'medium' | 'low' = 'medium',
  userAction?: string
): string => {
  return offlineQueue.enqueue({
    type: 'create',
    collection,
    documentId,
    data,
    maxRetries: 3,
    priority,
    metadata: { userAction }
  });
};

export const queueUpdateOperation = (
  collection: string,
  documentId: string,
  data: any,
  priority: 'high' | 'medium' | 'low' = 'medium',
  userAction?: string
): string => {
  return offlineQueue.enqueue({
    type: 'update',
    collection,
    documentId,
    data,
    maxRetries: 3,
    priority,
    metadata: { userAction }
  });
};

export const queueDeleteOperation = (
  collection: string,
  documentId: string,
  priority: 'high' | 'medium' | 'low' = 'medium',
  userAction?: string
): string => {
  return offlineQueue.enqueue({
    type: 'delete',
    collection,
    documentId,
    maxRetries: 3,
    priority,
    metadata: { userAction }
  });
};

export default offlineQueue;