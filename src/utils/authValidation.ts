// Authentication validation utilities

// Email validation regex
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Password requirements
const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_REGEX = {
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumbers: /\d/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/
};

export interface ValidationResult {
  isValid: boolean;
  message?: string;
}

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

// Email validation
export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, message: 'Please enter a valid email address' };
  }
  
  return { isValid: true };
};

// Password strength validation
export const validatePasswordStrength = (password: string): PasswordStrength => {
  const feedback: string[] = [];
  let score = 0;
  
  if (!password) {
    return {
      score: 0,
      feedback: ['Password is required'],
      isValid: false
    };
  }
  
  // Length check
  if (password.length < PASSWORD_MIN_LENGTH) {
    feedback.push(`Password must be at least ${PASSWORD_MIN_LENGTH} characters long`);
  } else {
    score += 1;
  }
  
  // Character type checks
  if (!PASSWORD_REGEX.hasUpperCase.test(password)) {
    feedback.push('Add at least one uppercase letter');
  } else {
    score += 1;
  }
  
  if (!PASSWORD_REGEX.hasLowerCase.test(password)) {
    feedback.push('Add at least one lowercase letter');
  } else {
    score += 1;
  }
  
  if (!PASSWORD_REGEX.hasNumbers.test(password)) {
    feedback.push('Add at least one number');
  } else {
    score += 1;
  }
  
  if (!PASSWORD_REGEX.hasSpecialChar.test(password)) {
    feedback.push('Add at least one special character (!@#$%^&*)');
  } else {
    score += 1;
  }
  
  // Additional security checks
  if (password.length > 12) {
    score += 1;
  }
  
  const isValid = score >= 4 && password.length >= PASSWORD_MIN_LENGTH;
  
  return {
    score: Math.min(score, 5),
    feedback,
    isValid
  };
};

// Password confirmation validation
export const validatePasswordConfirmation = (password: string, confirmPassword: string): ValidationResult => {
  if (!confirmPassword) {
    return { isValid: false, message: 'Please confirm your password' };
  }
  
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Passwords do not match' };
  }
  
  return { isValid: true };
};

// Display name validation
export const validateDisplayName = (displayName: string): ValidationResult => {
  if (!displayName) {
    return { isValid: false, message: 'Full name is required' };
  }
  
  if (displayName.trim().length < 2) {
    return { isValid: false, message: 'Full name must be at least 2 characters long' };
  }
  
  if (displayName.trim().length > 50) {
    return { isValid: false, message: 'Full name must be less than 50 characters' };
  }
  
  return { isValid: true };
};

// Phone validation (optional)
export const validatePhone = (phone: string): ValidationResult => {
  if (!phone) {
    return { isValid: true }; // Phone is optional
  }
  
  // Remove all non-digit characters for validation
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length < 10 || cleanPhone.length > 15) {
    return { isValid: false, message: 'Please enter a valid phone number' };
  }
  
  return { isValid: true };
};

// Firebase Auth error mapping
export const getFirebaseErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    // Authentication errors
    'auth/invalid-credential': 'Invalid email or password. Please check your credentials and try again.',
    'auth/user-not-found': 'No account found with this email address. Please check your email or create a new account.',
    'auth/wrong-password': 'Incorrect password. Please try again or reset your password.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Please contact support for assistance.',
    'auth/too-many-requests': 'Too many failed login attempts. Please wait a few minutes before trying again.',
    
    // Registration errors
    'auth/email-already-in-use': 'An account with this email already exists. Please sign in instead or use a different email.',
    'auth/weak-password': 'Password is too weak. Please choose a stronger password with at least 8 characters.',
    'auth/operation-not-allowed': 'Email/password accounts are not enabled. Please contact support.',
    
    // Network errors
    'auth/network-request-failed': 'Network error. Please check your internet connection and try again.',
    'auth/timeout': 'Request timed out. Please try again.',
    
    // General errors
    'auth/invalid-api-key': 'Configuration error. Please contact support.',
    'auth/app-deleted': 'Application error. Please contact support.',
    'auth/invalid-user-token': 'Your session has expired. Please sign in again.',
    'auth/user-token-expired': 'Your session has expired. Please sign in again.',
    'auth/null-user': 'No user is currently signed in.',
    'auth/requires-recent-login': 'This operation requires recent authentication. Please sign in again.',
    
    // Custom errors
    'auth/admin-restricted': 'Access denied. Admin privileges are required to access this area.',
    'auth/customer-restricted': 'This area is restricted to customers only.'
  };
  
  return errorMessages[errorCode] || 'An unexpected error occurred. Please try again or contact support if the problem persists.';
};

// Get password strength color and text
export const getPasswordStrengthDisplay = (strength: PasswordStrength): { color: string; text: string; bgColor: string } => {
  if (strength.score === 0) {
    return { color: 'text-gray-500', text: 'Enter password', bgColor: 'bg-gray-200' };
  } else if (strength.score <= 2) {
    return { color: 'text-red-600', text: 'Weak', bgColor: 'bg-red-200' };
  } else if (strength.score <= 3) {
    return { color: 'text-yellow-600', text: 'Fair', bgColor: 'bg-yellow-200' };
  } else if (strength.score <= 4) {
    return { color: 'text-blue-600', text: 'Good', bgColor: 'bg-blue-200' };
  } else {
    return { color: 'text-green-600', text: 'Strong', bgColor: 'bg-green-200' };
  }
};

// Comprehensive form validation
export const validateRegistrationForm = (formData: {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  phone?: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Validate email
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message!;
  }
  
  // Validate display name
  const nameValidation = validateDisplayName(formData.displayName);
  if (!nameValidation.isValid) {
    errors.displayName = nameValidation.message!;
  }
  
  // Validate password
  const passwordValidation = validatePasswordStrength(formData.password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.feedback[0] || 'Password does not meet requirements';
  }
  
  // Validate password confirmation
  const confirmValidation = validatePasswordConfirmation(formData.password, formData.confirmPassword);
  if (!confirmValidation.isValid) {
    errors.confirmPassword = confirmValidation.message!;
  }
  
  // Validate phone (if provided)
  if (formData.phone) {
    const phoneValidation = validatePhone(formData.phone);
    if (!phoneValidation.isValid) {
      errors.phone = phoneValidation.message!;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Login form validation
export const validateLoginForm = (email: string, password: string): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  // Validate email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.message!;
  }
  
  // Basic password validation for login
  if (!password) {
    errors.password = 'Password is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};