import { toast } from 'sonner';
import { testConnection } from './firebase';

// Error types for better categorization
export enum ErrorType {
  NETWORK = 'network',
  PERMISSION = 'permission',
  AUTHENTICATION = 'authentication',
  FIRESTORE = 'firestore',
  TIMEOUT = 'timeout',
  ABORTED = 'aborted',
  UNKNOWN = 'unknown'
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface ErrorInfo {
  type: ErrorType;
  severity: ErrorSeverity;
  message: string;
  retryable: boolean;
  userMessage: string;
}

// Categorize errors based on Firebase error codes and messages
export const categorizeError = (error: any): ErrorInfo => {
  const errorMessage = error?.message || error?.toString() || 'Unknown error';
  const errorCode = error?.code || '';

  // Network and connection errors
  if (
    errorMessage.includes('ERR_ABORTED') ||
    errorMessage.includes('net::ERR_ABORTED') ||
    errorCode === 'unavailable' ||
    errorMessage.includes('network') ||
    errorMessage.includes('offline')
  ) {
    return {
      type: ErrorType.NETWORK,
      severity: ErrorSeverity.MEDIUM,
      message: errorMessage,
      retryable: true,
      userMessage: 'Connection issue detected. Retrying...'
    };
  }

  // Timeout errors
  if (
    errorMessage.includes('timeout') ||
    errorCode === 'deadline-exceeded'
  ) {
    return {
      type: ErrorType.TIMEOUT,
      severity: ErrorSeverity.MEDIUM,
      message: errorMessage,
      retryable: true,
      userMessage: 'Request timed out. Retrying with shorter timeout...'
    };
  }

  // Permission errors
  if (
    errorCode === 'permission-denied' ||
    errorMessage.includes('permission')
  ) {
    return {
      type: ErrorType.PERMISSION,
      severity: ErrorSeverity.HIGH,
      message: errorMessage,
      retryable: false,
      userMessage: 'Access denied. Please check your permissions.'
    };
  }

  // Authentication errors
  if (
    errorCode === 'unauthenticated' ||
    errorMessage.includes('auth') ||
    errorMessage.includes('token')
  ) {
    return {
      type: ErrorType.AUTHENTICATION,
      severity: ErrorSeverity.HIGH,
      message: errorMessage,
      retryable: false,
      userMessage: 'Authentication required. Please sign in again.'
    };
  }

  // Firestore specific errors
  if (
    errorCode === 'not-found' ||
    errorCode === 'already-exists' ||
    errorCode === 'invalid-argument'
  ) {
    return {
      type: ErrorType.FIRESTORE,
      severity: ErrorSeverity.LOW,
      message: errorMessage,
      retryable: false,
      userMessage: 'Data operation failed. Please try again.'
    };
  }

  // Aborted requests
  if (
    errorCode === 'aborted' ||
    errorMessage.includes('aborted')
  ) {
    return {
      type: ErrorType.ABORTED,
      severity: ErrorSeverity.MEDIUM,
      message: errorMessage,
      retryable: true,
      userMessage: 'Request was cancelled. Retrying...'
    };
  }

  // Default unknown error
  return {
    type: ErrorType.UNKNOWN,
    severity: ErrorSeverity.MEDIUM,
    message: errorMessage,
    retryable: true,
    userMessage: 'An unexpected error occurred. Retrying...'
  };
};

// Recovery strategies for different error types
export const getRecoveryStrategy = (errorInfo: ErrorInfo) => {
  switch (errorInfo.type) {
    case ErrorType.NETWORK:
      return {
        retryDelay: 2000,
        maxRetries: 3,
        exponentialBackoff: true,
        fallback: async () => {
          console.log('🔄 Testing connection before retry...');
          return await testConnection();
        }
      };

    case ErrorType.TIMEOUT:
      return {
        retryDelay: 1000,
        maxRetries: 2,
        exponentialBackoff: false,
        fallback: async () => {
          console.log('⏱️ Reducing timeout for next attempt...');
          return true;
        }
      };

    case ErrorType.ABORTED:
      return {
        retryDelay: 3000, // Longer delay to prevent cascading aborts
        maxRetries: 2,
        exponentialBackoff: true,
        fallback: async () => {
          console.log('🛑 Request was aborted, waiting before retry...');
          return true;
        }
      };

    case ErrorType.PERMISSION:
    case ErrorType.AUTHENTICATION:
      return {
        retryDelay: 0,
        maxRetries: 0,
        exponentialBackoff: false,
        fallback: async () => {
          console.log('🔐 Authentication/Permission error - no retry');
          return false;
        }
      };

    default:
      return {
        retryDelay: 1500,
        maxRetries: 2,
        exponentialBackoff: true,
        fallback: async () => {
          console.log('❓ Unknown error - attempting basic retry...');
          return true;
        }
      };
  }
};

// Enhanced error handler with recovery strategies
export const handleErrorWithRecovery = async (
  error: any,
  operation: string,
  showToast: boolean = true
): Promise<{ shouldRetry: boolean; delay: number; strategy: any }> => {
  const errorInfo = categorizeError(error);
  const strategy = getRecoveryStrategy(errorInfo);

  console.error(`❌ ${operation} failed:`, {
    type: errorInfo.type,
    severity: errorInfo.severity,
    message: errorInfo.message,
    retryable: errorInfo.retryable
  });

  // Show user-friendly toast notification
  if (showToast) {
    if (errorInfo.severity === ErrorSeverity.CRITICAL || errorInfo.severity === ErrorSeverity.HIGH) {
      toast.error(errorInfo.userMessage);
    } else {
      toast.warning(errorInfo.userMessage);
    }
  }

  // Execute fallback strategy
  const canProceed = await strategy.fallback();

  return {
    shouldRetry: errorInfo.retryable && canProceed,
    delay: strategy.retryDelay,
    strategy
  };
};

// Graceful degradation for offline scenarios
export const getOfflineFallback = (operation: string) => {
  const fallbacks = {
    'user-data': () => {
      console.log('📱 Using cached user data...');
      return null; // Return cached data if available
    },
    'products': () => {
      console.log('📦 Using cached product data...');
      return []; // Return empty array or cached products
    },
    'orders': () => {
      console.log('📋 Using cached order data...');
      return []; // Return empty array or cached orders
    },
    'categories': () => {
      console.log('🏷️ Using cached category data...');
      return []; // Return empty array or cached categories
    }
  };

  return fallbacks[operation as keyof typeof fallbacks] || (() => null);
};

// Connection health monitoring
let connectionHealth = {
  consecutiveFailures: 0,
  lastSuccessfulConnection: Date.now(),
  isHealthy: true
};

export const updateConnectionHealth = (success: boolean) => {
  if (success) {
    connectionHealth.consecutiveFailures = 0;
    connectionHealth.lastSuccessfulConnection = Date.now();
    connectionHealth.isHealthy = true;
  } else {
    connectionHealth.consecutiveFailures++;
    connectionHealth.isHealthy = connectionHealth.consecutiveFailures < 3;
  }
};

export const getConnectionHealth = () => ({ ...connectionHealth });

// Circuit breaker pattern for preventing cascading failures
let circuitBreakerState = {
  isOpen: false,
  failureCount: 0,
  lastFailureTime: 0,
  timeout: 30000 // 30 seconds
};

export const shouldAllowRequest = (): boolean => {
  const now = Date.now();
  
  // If circuit is open, check if timeout has passed
  if (circuitBreakerState.isOpen) {
    if (now - circuitBreakerState.lastFailureTime > circuitBreakerState.timeout) {
      console.log('🔄 Circuit breaker: Attempting to close circuit...');
      circuitBreakerState.isOpen = false;
      circuitBreakerState.failureCount = 0;
      return true;
    }
    console.log('⛔ Circuit breaker: Request blocked');
    return false;
  }
  
  return true;
};

export const recordRequestResult = (success: boolean) => {
  if (success) {
    circuitBreakerState.failureCount = 0;
    circuitBreakerState.isOpen = false;
  } else {
    circuitBreakerState.failureCount++;
    circuitBreakerState.lastFailureTime = Date.now();
    
    // Open circuit if too many failures
    if (circuitBreakerState.failureCount >= 5) {
      console.log('⛔ Circuit breaker: Opening circuit due to consecutive failures');
      circuitBreakerState.isOpen = true;
    }
  }
};