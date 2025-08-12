// Simplified connection notification system for user feedback
import { toast } from 'sonner';

interface NotificationState {
  lastNotification: 'online' | 'offline' | null;
  notificationTimeout: NodeJS.Timeout | null;
  isOfflineNotificationShown: boolean;
  reconnectionAttempts: number;
}

class ConnectionNotificationManager {
  private state: NotificationState = {
    lastNotification: null,
    notificationTimeout: null,
    isOfflineNotificationShown: false,
    reconnectionAttempts: 0
  };

  private isInitialized = false;

  // Initialize notification system
  public initialize(): void {
    if (this.isInitialized) return;

    console.log('🔔 Initializing connection notifications');
    
    // Listen to browser online/offline events
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    this.isInitialized = true;
  }

  // Handle online event
  private handleOnline(): void {
    console.log('🔔 Connection notification: Online');
    
    // Prevent duplicate notifications
    if (this.state.lastNotification === 'online') {
      return;
    }

    // Only show recovery notification if we were previously offline
    if (this.state.isOfflineNotificationShown || this.state.reconnectionAttempts > 0) {
      toast.success('🌐 Connection restored', {
        description: 'You\'re back online and ready to go!',
        duration: 3000,
        id: 'connection-restored'
      });
      
      this.state.isOfflineNotificationShown = false;
      this.state.reconnectionAttempts = 0;
    }

    this.state.lastNotification = 'online';
  }

  // Handle offline event
  private handleOffline(): void {
    console.log('🔔 Connection notification: Offline');
    
    // Prevent duplicate notifications
    if (this.state.lastNotification === 'offline') {
      return;
    }

    if (!this.state.isOfflineNotificationShown) {
      toast.error('📡 Connection lost', {
        description: 'You\'re currently offline. Some features may be limited.',
        duration: 5000,
        id: 'connection-lost',
        action: {
          label: 'Retry',
          onClick: () => this.retryConnection()
        }
      });
      
      this.state.isOfflineNotificationShown = true;
    }

    this.state.lastNotification = 'offline';
  }

  // Manual retry connection
  private async retryConnection(): Promise<void> {
    try {
      this.state.reconnectionAttempts++;
      
      toast.loading('🔄 Checking connection...', {
        description: 'Please wait while we check your connection',
        duration: 3000,
        id: 'manual-retry'
      });
      
      // Simple connection check - just wait and check navigator.onLine
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (navigator.onLine) {
        toast.dismiss('manual-retry');
        this.handleOnline();
      } else {
        toast.error('Still offline', {
          description: 'Please check your internet connection and try again.',
          duration: 3000,
          id: 'retry-failed'
        });
      }
      
    } catch (error) {
      console.error('Manual retry failed:', error);
      
      toast.error('Retry failed', {
        description: 'Unable to check connection. Please try again.',
        duration: 5000,
        id: 'retry-failed'
      });
    }
  }

  // Show data sync notification
  public showDataSyncNotification(type: 'success' | 'error' | 'warning', message: string): void {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️'
    };
    
    const toastFn = type === 'success' ? toast.success : type === 'error' ? toast.error : toast.warning;
    
    toastFn(`${icons[type]} ${message}`, {
      duration: 3000,
      id: `data-sync-${Date.now()}`
    });
  }

  // Show offline mode notification
  public showOfflineModeNotification(action: string): void {
    toast.info('💾 Offline mode', {
      description: `${action} - limited functionality while offline.`,
      duration: 4000,
      id: 'offline-mode'
    });
  }

  // Show cache notification
  public showCacheNotification(type: 'hit' | 'miss' | 'updated'): void {
    if (type === 'hit') {
      toast.info('📦 Loading cached data', {
        description: 'Showing previously loaded content',
        duration: 2000,
        id: 'cache-hit'
      });
    } else if (type === 'updated') {
      toast.success('🔄 Data updated', {
        description: 'Fresh data loaded successfully',
        duration: 2000,
        id: 'cache-updated'
      });
    }
  }

  // Cleanup
  public cleanup(): void {
    if (this.state.notificationTimeout) {
      clearTimeout(this.state.notificationTimeout);
    }
    
    // Remove event listeners
    window.removeEventListener('online', this.handleOnline.bind(this));
    window.removeEventListener('offline', this.handleOffline.bind(this));
    
    // Dismiss all connection-related toasts
    toast.dismiss('connection-lost');
    toast.dismiss('connection-restored');
    toast.dismiss('connecting');
    toast.dismiss('reconnecting');
    toast.dismiss('connection-failed');
    toast.dismiss('manual-retry');
    
    this.state = {
      lastNotification: null,
      notificationTimeout: null,
      isOfflineNotificationShown: false,
      reconnectionAttempts: 0
    };
    
    this.isInitialized = false;
  }

  // Get current notification state
  public getState(): NotificationState {
    return { ...this.state };
  }
}

// Export singleton instance
export const connectionNotifications = new ConnectionNotificationManager();

// Auto-initialize when imported
connectionNotifications.initialize();

// Export utility functions
export const showDataSyncNotification = (type: 'success' | 'error' | 'warning', message: string) => {
  connectionNotifications.showDataSyncNotification(type, message);
};

export const showOfflineModeNotification = (action: string) => {
  connectionNotifications.showOfflineModeNotification(action);
};

export const showCacheNotification = (type: 'hit' | 'miss' | 'updated') => {
  connectionNotifications.showCacheNotification(type);
};

export default connectionNotifications;