import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { signIn, verifyAdminAccess, sendPasswordReset } from '../../services/auth';
import { validateLoginForm } from '../../utils/authValidation';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (currentUser) {
      verifyAdminAccess(currentUser.uid).then((response) => {
        if (response.success) {
          navigate('/admin/dashboard');
        }
      });
    }
  }, [currentUser, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    
    // Validate form
    const validation = validateLoginForm(email, password);
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      return;
    }
    
    setIsLoading(true);

    try {
      // Sign in with Firebase Auth
      const firebaseUser = await signIn(email, password);
      
      // Verify admin role
      const adminVerification = await verifyAdminAccess(firebaseUser.uid);
      
      if (!adminVerification.success) {
        const errorMsg = adminVerification.message || 'Access denied. Admin privileges required.';
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      toast.success('Welcome back, Admin!');
      navigate('/admin/dashboard');
    } catch (error) {
      const err = error as { message?: string, code?: string };
      const errorMessage = err.message || 'Login failed. Please try again';
      
      setError(errorMessage);
      toast.error(errorMessage);
      
      // Set field-specific errors if applicable
      if (error.message.includes('email')) {
        setFieldErrors({ email: error.message });
      } else if (error.message.includes('password')) {
        setFieldErrors({ password: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleForgotPassword = async () => {
    if (!email) {
      toast.error('Please enter your email address first');
      return;
    }
    
    setResetLoading(true);
    
    try {
      const result = await sendPasswordReset(email);
      if (result.success) {
        toast.success(result.message!);
        setShowForgotPassword(false);
      } else {
        toast.error(result.message!);
      }
    } catch (error) {
      const err = error as { message?: string };
      toast.error(err.message || 'Failed to send password reset email');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access Camera World admin panel
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) {
                      setFieldErrors({ ...fieldErrors, email: '' });
                    }
                    if (error) setError('');
                  }}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                    fieldErrors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="admin@cameraworld.com"
                  disabled={isLoading}
                />
              </div>
              {fieldErrors.email && (
                <div className="mt-1 flex items-center space-x-1 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{fieldErrors.email}</span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) {
                      setFieldErrors({ ...fieldErrors, password: '' });
                    }
                    if (error) setError('');
                  }}
                  className={`block w-full pl-10 pr-10 py-2 border rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
                    fieldErrors.password ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter your password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
              {fieldErrors.password && (
                <div className="mt-1 flex items-center space-x-1 text-red-600">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{fieldErrors.password}</span>
                </div>
              )}
            </div>

            {/* Forgot Password Link */}
            <div className="flex items-center justify-between">
              <div></div>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
                disabled={isLoading}
              >
                Forgot your password?
              </button>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign in to Admin Panel'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reset Admin Password</h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter your admin email address and we'll send you a link to reset your password.
              </p>
              <div className="space-y-4">
                <div>
                  <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Admin Email Address
                  </label>
                  <input
                    id="reset-email"
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@cameraworld.com"
                    disabled={resetLoading}
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleForgotPassword}
                    disabled={resetLoading || !email}
                    className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {resetLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                  <button
                    onClick={() => setShowForgotPassword(false)}
                    disabled={resetLoading}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            Camera World Admin Panel &copy; 2024
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;