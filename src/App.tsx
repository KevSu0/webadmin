import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import NetworkStatusMonitor from './components/NetworkStatusMonitor';
import OfflineIndicator from './components/OfflineIndicator';
import './services/connectionNotifications'; // Initialize connection notifications

// Admin Components
import AdminLayout from './admin/components/AdminLayout';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/Products';
import ProductForm from './pages/admin/ProductForm';
import AdminCategories from './pages/admin/Categories';
import AdminOrders from './admin/pages/AdminOrders';

// Customer Components
import CustomerLayout from './customer/components/CustomerLayout';
import Home from './customer/pages/Home';
import Products from './customer/pages/Products';
import ProductDetail from './customer/pages/ProductDetail';
import Cart from './customer/pages/Cart';
import Checkout from './customer/pages/Checkout';
import Profile from './customer/pages/Profile';
import Login from './customer/pages/Login';
import Register from './customer/pages/Register';

// Shared Components
import ProtectedRoute from './shared/components/ProtectedRoute';
import AdminRoute from './shared/components/AdminRoute';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/*"
                element={
                  <AdminRoute>
                    <AdminLayout>
                      <Routes>
                        <Route index element={<AdminDashboard />} />
                        <Route path="products" element={<AdminProducts />} />
                        <Route path="products/new" element={<ProductForm />} />
                        <Route path="products/edit/:id" element={<ProductForm />} />
                        <Route path="categories" element={<AdminCategories />} />
                        <Route path="orders" element={<AdminOrders />} />
                        <Route path="*" element={<Navigate to="/admin" replace />} />
                      </Routes>
                    </AdminLayout>
                  </AdminRoute>
                }
              />

              {/* Customer Routes */}
              <Route
                path="/*"
                element={
                  <CustomerLayout>
                    <Routes>
                      <Route index element={<Home />} />
                      <Route path="products" element={<Products />} />
                      <Route path="products/:id" element={<ProductDetail />} />
                      <Route path="cart" element={<Cart />} />
                      <Route path="login" element={<Login />} />
                      <Route path="register" element={<Register />} />
                      <Route
                        path="checkout"
                        element={
                          <ProtectedRoute>
                            <Checkout />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="profile"
                        element={
                          <ProtectedRoute>
                            <Profile />
                          </ProtectedRoute>
                        }
                      />
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                  </CustomerLayout>
                }
              />
            </Routes>

            {/* Network Status Monitor */}
            <NetworkStatusMonitor 
              position="top-right" 
              showDetails={true} 
              onRetry={() => window.location.reload()}
              draggable={true}
              minimizable={true}
              closable={true}
            />
            
            {/* Offline Mode Indicator */}
            <OfflineIndicator 
              position="bottom" 
              showDetails={true} 
            />
            
            {/* Toast Notifications */}
            <Toaster position="top-right" />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
