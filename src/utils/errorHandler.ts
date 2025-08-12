import { FirebaseError } from 'firebase/app';
import { toast } from 'sonner';

// Network error types
export interface NetworkError {
  code: string;
  message: string;
  isNetworkError: boolean;
  isRetryable: boolean;
}

// Common Firebase error codes and their user-friendly messages
const FIREBASE_ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  'auth/user-not-found': 'No account found with this email address.',
  'auth/wrong-password': 'Incorrect password. Please try again.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password should be at least 6 characters long.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
  'auth/network-request-failed': 'Network error. Please check your connection.',
  
  // Firestore errors
  'firestore/permission-denied': 'You don\'t have permission to access this data.',
  'firestore/not-found': 'The requested document was not found.',
  'firestore/already-exists': 'This document already exists.',
  'firestore/resource-exhausted': 'Too many requests. Please try again later.',
  'firestore/failed-precondition': 'Operation failed due to invalid conditions.',
  'firestore/aborted': 'Operation was aborted. Please try again.',
  'firestore/out-of-range': 'Invalid data range provided.',
  'firestore/unimplemented': 'This operation is not supported.',
  'firestore/internal': 'Internal server error. Please try again.',
  'firestore/unavailable': 'Service temporarily unavailable. Please try again.',
  'firestore/data-loss': 'Data corruption detected.',
  'firestore/unauthenticated': 'Please sign in to continue.',
  'firestore/deadline-exceeded': 'Request timeout. Please try again.',
  'firestore/cancelled': 'Operation was cancelled.',
  
  // Storage errors
  'storage/object-not-found': 'File not found.',
  'storage/bucket-not-found': 'Storage bucket not found.',
  'storage/project-not-found': 'Project not found.',
  'storage/quota-exceeded': 'Storage quota exceeded.',
  'storage/unauthenticated': 'Please sign in to upload files.',
  'storage/unauthorized': 'You don\'t have permission to access this file.',
  'storage/retry-limit-exceeded': 'Upload failed after multiple attempts.',
  'storage/invalid-checksum': 'File upload was corrupted.',
  'storage/canceled': 'Upload was cancelled.',
  'storage/invalid-event-name': 'Invalid upload event.',
  'storage/invalid-url': 'Invalid file URL.',
  'storage/invalid-argument': 'Invalid upload parameters.',
  'storage/no-default-bucket': 'No default storage bucket configured.',
  'storage/cannot-slice-blob': 'File processing error.',
  'storage/server-file-wrong-size': 'File size mismatch.'
};

// Network-related error codes that should trigger retry logic
const RETRYABLE_ERROR_CODES = [
  'firestore/unavailable',
  'firestore/deadline-exceeded',
  'firestore/aborted',
  'firestore/internal',
  'auth/network-request-failed',
  'storage/retry-limit-exceeded'
];

// Network error patterns
const NETWORK_ERROR_PATTERNS = [
  /network/i,
  /connection/i,
  /timeout/i,
  /offline/i,
  /unavailable/i,
  /failed to fetch/i,
  /net::/i,
  /err_network/i,
  /err_internet_disconnected/i
];

/**
 * Determines if an error is network-related
 */
export const isNetworkError = (error: any): boolean => {
  if (!error) return false;
  
  // Check Firebase error codes
  if (error.code && RETRYABLE_ERROR_CODES.includes(error.code)) {
    return true;
  }
  
  // Check error message patterns
  const message = error.message || error.toString();
  return NETWORK_ERROR_PATTERNS.some(pattern => pattern.test(message));
};

/**
 * Determines if an error is retryable
 */
export const isRetryableError = (error: any): boolean => {
  if (!error) return false;
  
  // Network errors are generally retryable
  if (isNetworkError(error)) return true;
  
  // Check specific Firebase error codes
  if (error.code && RETRYABLE_ERROR_CODES.includes(error.code)) {
    return true;
  }
  
  return false;
};

/**
 * Converts Firebase errors to user-friendly messages
 */
export const getErrorMessage = (error: any): string => {
  if (!error) return 'An unknown error occurred.';
  
  // Handle Firebase errors
  if (error.code && FIREBASE_ERROR_MESSAGES[error.code]) {
    return FIREBASE_ERROR_MESSAGES[error.code];
  }
  
  // Handle network errors
  if (isNetworkError(error)) {
    return 'Network connection issue. Please check your internet connection and try again.';
  }
  
  // Handle generic errors
  if (error.message) {
    // Clean up technical error messages
    let message = error.message;
    
    // Remove Firebase prefixes
    message = message.replace(/^Firebase: /, '');
    message = message.replace(/^Error: /, '');
    
    // Capitalize first letter
    message = message.charAt(0).toUpperCase() + message.slice(1);
    
    return message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Creates a standardized NetworkError object
 */
export const createNetworkError = (error: any): NetworkError => {
  return {
    code: error.code || 'unknown',
    message: getErrorMessage(error),
    isNetworkError: isNetworkError(error),
    isRetryable: isRetryableError(error)
  };
};

/**
 * Handles errors with appropriate user feedback
 */
export const handleError = (error: any, context?: string): NetworkError => {
  const networkError = createNetworkError(error);
  
  // Log error for debugging
  console.error(`Error${context ? ` in ${context}` : ''}:`, error);
  
  // Show user-friendly toast notification
  if (networkError.isNetworkError) {
    toast.error('Connection Issue', {
      description: networkError.message + (networkError.isRetryable ? ' Retrying...' : '')
    });
  } else {
    toast.error('Error', {
      description: networkError.message
    });
  }
  
  return networkError;
};

/**
 * Handles success messages
 */
export const handleSuccess = (message: string, description?: string): void => {
  toast.success(message, {
    description
  });
};

/**
 * Handles info messages
 */
export const handleInfo = (message: string, description?: string): void => {
  toast.info(message, {
    description
  });
};

/**
 * Handles warning messages
 */
export const handleWarning = (message: string, description?: string): void => {
  toast.warning(message, {
    description
  });
};

export default {
  isNetworkError,
  isRetryableError,
  getErrorMessage,
  createNetworkError,
  handleError,
  handleSuccess,
  handleInfo,
  handleWarning
};