import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import NetworkStatusMonitor from './components/NetworkStatusMonitor';
import OfflineIndicator from './components/OfflineIndicator';
import './services/connectionNotifications'; // Initialize connection notifications

// Layouts and Route Guards
import AdminLayout from './admin/components/AdminLayout';
import CustomerLayout from './customer/components/CustomerLayout';
import ProtectedRoute from './shared/components/ProtectedRoute';
import AdminRoute from './shared/components/AdminRoute';

// Loading Component
const LoadingFallback = () => (
  <div className="flex justify-center items-center h-screen w-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

// Lazy-loaded Admin Components
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('./pages/admin/Products'));
const ProductForm = lazy(() => import('./pages/admin/ProductForm'));
const AdminCategories = lazy(() => import('./pages/admin/Categories'));
const AdminOrders = lazy(() => import('./admin/pages/AdminOrders'));

// Lazy-loaded Customer Components
const Home = lazy(() => import('./customer/pages/Home'));
const Products = lazy(() => import('./customer/pages/Products'));
const ProductDetail = lazy(() => import('./customer/pages/ProductDetail'));
const Cart = lazy(() => import('./customer/pages/Cart'));
const Checkout = lazy(() => import('./customer/pages/Checkout'));
const Profile = lazy(() => import('./customer/pages/Profile'));
const Login = lazy(() => import('./customer/pages/Login'));
const Register = lazy(() => import('./customer/pages/Register'));

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Suspense fallback={<LoadingFallback />}>
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

              {/* Network Status Monitor & Other Overlays */}
              <NetworkStatusMonitor
                position="top-right"
                showDetails={true}
                onRetry={() => window.location.reload()}
                draggable={true}
                minimizable={true}
                closable={true}
              />
              <OfflineIndicator
                position="bottom"
                showDetails={true}
              />
              <Toaster position="top-right" />
            </div>
          </Suspense>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
