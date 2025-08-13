// Customer layout component
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { 
  ShoppingCartIcon,
  UserIcon,
  MagnifyingGlassIcon,
  Bars3Icon as MenuIcon,
  XMarkIcon as XIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface CustomerLayoutProps {
  children: React.ReactNode;
}

const CustomerLayout: React.FC<CustomerLayoutProps> = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/');
    } catch (_error) {
      toast.error('Error logging out');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-2xl font-bold text-gray-900">
                Camera World
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-4">
              <Link to="/" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                Home
              </Link>
              <Link to="/products" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                Products
              </Link>
              {/* Desktop Search Bar */}
              <div className="flex-1 max-w-xs">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search products..."
                  />
                </div>
              </div>
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Cart */}
              <Link to="/cart" className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors">
                <ShoppingCartIcon className="h-6 w-6" />
                {cart.totalItems > 0 && (
                  <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                    {cart.totalItems}
                  </span>
                )}
              </Link>

              {/* User Menu (Desktop) */}
              <div className="hidden sm:flex items-center space-x-2">
                {currentUser ? (
                  <div className="relative group">
                    <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors">
                      <UserIcon className="h-6 w-6" />
                      <span className="text-sm font-medium hidden lg:inline">
                        {currentUser.displayName || 'Account'}
                      </span>
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Profile
                      </Link>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Sign out
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link to="/login" className="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                      Sign in
                    </Link>
                    <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                      Sign up
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <div className="flex items-center md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500">
                  <span className="sr-only">Open main menu</span>
                  {isMenuOpen ? <XIcon className="block h-6 w-6" /> : <MenuIcon className="block h-6 w-6" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/" className="text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium">Home</Link>
              <Link to="/products" className="text-gray-700 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium">Products</Link>
              <div className="px-3 py-2">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input type="text" className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm" placeholder="Search products..." />
                </div>
              </div>
            </div>
            <div className="pt-4 pb-3 border-t border-gray-200">
              {currentUser ? (
                <div className="px-2 space-y-1">
                  <div className="flex items-center px-3 py-2">
                    <UserIcon className="h-8 w-8 text-gray-500"/>
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800">{currentUser.displayName}</div>
                      <div className="text-sm font-medium text-gray-500">{currentUser.email}</div>
                    </div>
                  </div>
                  <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Profile</Link>
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="px-2 space-y-1">
                  <Link to="/login" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Sign in</Link>
                  <Link to="/register" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50">Sign up</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold mb-4">Camera World</h3>
              <p className="text-gray-400 mb-4">
                Your trusted partner for all photography needs. From professional cameras to accessories, we have everything to capture your perfect moments.
              </p>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/products" className="text-gray-400 hover:text-white transition-colors">Products</Link></li>
                <li><Link to="/cart" className="text-gray-400 hover:text-white transition-colors">Cart</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-4 uppercase tracking-wider">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@cameraworld.com</li>
                <li>Phone: (555) 123-4567</li>
                <li>Address: 123 Photography St</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 Camera World. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;