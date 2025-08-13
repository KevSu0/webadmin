import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  Home,
  Package,
  FolderOpen,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Bell
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { verifyAdminAccess } from '../../services/auth';
import { AdminStats } from '../../types';
import { toast } from 'sonner';
import FirebaseTestPanel from '../../components/FirebaseTestPanel';
import SecurityRulesTest from '../../components/SecurityRulesTest';

const AdminDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState<AdminStats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0
  });
  const [loading, setLoading] = useState(true);
  
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation items
  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home, current: location.pathname === '/admin/dashboard' },
    { name: 'Products', href: '/admin/products', icon: Package, current: location.pathname.startsWith('/admin/products') },
    { name: 'Categories', href: '/admin/categories', icon: FolderOpen, current: location.pathname.startsWith('/admin/categories') },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart, current: location.pathname.startsWith('/admin/orders') },
    { name: 'Customers', href: '/admin/customers', icon: Users, current: location.pathname.startsWith('/admin/customers') },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3, current: location.pathname.startsWith('/admin/analytics') },
    { name: 'Settings', href: '/admin/settings', icon: Settings, current: location.pathname.startsWith('/admin/settings') },
  ];

  // Verify admin access on mount
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (!currentUser) {
        navigate('/admin/login');
        return;
      }

      const verification = await verifyAdminAccess(currentUser.uid);
      if (!verification.success) {
        toast.error('Access denied. Admin privileges required.');
        await logout();
        navigate('/admin/login');
        return;
      }

      setLoading(false);
    };

    checkAdminAccess();
  }, [currentUser, navigate, logout]);

  // Load dashboard statistics
  useEffect(() => {
    const loadStats = async () => {
      try {
        // TODO: Implement actual stats fetching from Firestore
        // For now, using mock data
        setStats({
          totalProducts: 156,
          totalOrders: 89,
          totalRevenue: 45230,
          totalCustomers: 234
        });
      } catch (error) {
        console.error('Error loading stats:', error);
        toast.error('Failed to load dashboard statistics');
      }
    };

    if (!loading) {
      loadStats();
    }
  }, [loading]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/admin/login');
    } catch (_error) {
      toast.error('Error logging out');
    }
  };

  const handleNavigation = (href: string) => {
    navigate(href);
    setSidebarOpen(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 flex z-40 md:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent navigation={navigation} onNavigate={handleNavigation} onLogout={handleLogout} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <SidebarContent navigation={navigation} onNavigate={handleNavigation} onLogout={handleLogout} />
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Top bar */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h1 className="text-2xl font-semibold text-gray-900">
                Camera World Admin
              </h1>
            </div>
            <div className="ml-4 flex items-center md:ml-6 space-x-4">
              <button className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <Bell className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {currentUser?.displayName?.charAt(0) || 'A'}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {currentUser?.displayName || 'Admin'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          {location.pathname === '/admin/dashboard' ? (
            <DashboardOverview stats={stats} />
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

// Sidebar content component
interface SidebarContentProps {
  navigation: Array<{
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    current: boolean;
  }>;
  onNavigate: (href: string) => void;
  onLogout: () => void;
}

const SidebarContent: React.FC<SidebarContentProps> = ({ navigation, onNavigate, onLogout }) => {
  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-indigo-600">
        <h1 className="text-xl font-bold text-white">Camera World</h1>
      </div>
      
      {/* Navigation */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                onClick={() => onNavigate(item.href)}
                className={`${
                  item.current
                    ? 'bg-indigo-100 text-indigo-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                } group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left transition-colors duration-150`}
              >
                <Icon
                  className={`${
                    item.current ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'
                  } mr-3 flex-shrink-0 h-6 w-6`}
                />
                {item.name}
              </button>
            );
          })}
        </nav>
        
        {/* Logout button */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <button
            onClick={onLogout}
            className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900 w-full text-left transition-colors duration-150"
          >
            <LogOut className="text-gray-400 group-hover:text-gray-500 mr-3 flex-shrink-0 h-6 w-6" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

// Dashboard overview component
interface DashboardOverviewProps {
  stats: AdminStats;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ stats }) => {
  const statCards = [
    {
      name: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: 'Revenue',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: BarChart3,
      color: 'bg-purple-500',
      change: '+15%',
      changeType: 'positive'
    },
    {
      name: 'Customers',
      value: stats.totalCustomers,
      icon: Users,
      color: 'bg-orange-500',
      change: '+5%',
      changeType: 'positive'
    }
  ];

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Stats */}
        <div className="mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.name} className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`${card.color} p-3 rounded-md`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">
                            {card.name}
                          </dt>
                          <dd className="flex items-baseline">
                            <div className="text-2xl font-semibold text-gray-900">
                              {card.value}
                            </div>
                            <div className="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                              {card.change}
                            </div>
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Firebase Connection Test Panel */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">System Status</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FirebaseTestPanel />
            <SecurityRulesTest />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer">
              <div className="p-6">
                <div className="flex items-center">
                  <Package className="h-8 w-8 text-indigo-600" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Add New Product</h3>
                    <p className="text-sm text-gray-500">Create a new product listing</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer">
              <div className="p-6">
                <div className="flex items-center">
                  <FolderOpen className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">Manage Categories</h3>
                    <p className="text-sm text-gray-500">Organize product categories</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow duration-200 cursor-pointer">
              <div className="p-6">
                <div className="flex items-center">
                  <ShoppingCart className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">View Orders</h3>
                    <p className="text-sm text-gray-500">Manage customer orders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;