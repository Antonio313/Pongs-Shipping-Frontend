import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAdmin } from '../context/AdminContext';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CustomerTab from '../components/admin/CustomerTab';
import PackagesTab from '../components/admin/PackagesTab';
import DeliveriesTab from '../components/admin/DeliveriesTab';
import PackageModal from '../components/admin/PackageModal';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const {
    customers,
    selectedCustomer,
    customerPreAlerts,
    loading,
    error,
    fetchCustomers,
    fetchCustomerDetails,
    setSelectedCustomer,
    clearError
  } = useAdmin();


  const [activeTab, setActiveTab] = useState('customers');
  const [selectedPreAlert, setSelectedPreAlert] = useState(null);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load customers on component mount and when user changes
  useEffect(() => {
    if (user?.role === 'A') {
      fetchCustomers();
    }
  }, [user]);

  // Handle URL tab parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['customers', 'packages', 'deliveries'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleCustomerSelect = async (customer) => {
    setSelectedCustomer(customer);
    setSelectedPreAlert(null);
    await fetchCustomerDetails(customer.user_id);
  };

  const handlePreAlertSelect = (preAlert) => {
    setSelectedPreAlert(preAlert);
  };

  const handleConfirmPreAlert = (preAlert) => {
    setSelectedPreAlert(preAlert);
    setShowPackageModal(true);
  };

  const handleCreatePackage = (result) => {
    setShowPackageModal(false);
    setSelectedPreAlert(null);
    
    if (result.success) {
      setSuccessMessage(result.message);
      // Refresh customer details to update pre-alert status
      if (selectedCustomer) {
        fetchCustomerDetails(selectedCustomer.user_id);
      }
    } else {
      // Error handling is already done in the PackageModal component
      console.error('Package creation failed:', result.error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Processing': { class: 'bg-gray-100 text-gray-800', text: 'Processing' },
      'Delivered to Overseas Warehouse': { class: 'bg-blue-100 text-blue-800', text: 'Arrived at Overseas Warehouse' },
      'In Transit to Jamaica': { class: 'bg-indigo-100 text-indigo-800', text: 'In Transit to Jamaica' },
      'Arrived in Jamaica': { class: 'bg-purple-100 text-purple-800', text: 'Arrived in Jamaica' },
      'Arrived at Selected Branch': { class: 'bg-teal-100 text-teal-800', text: 'At Local Branch' },
      'In Transit to Selected Branch': { class: 'bg-cyan-100 text-cyan-800', text: 'In Transit to Branch' },
      'Ready For Pickup': { class: 'bg-amber-100 text-amber-800', text: 'Ready for Pickup' },
      'Out for Delivery': { class: 'bg-orange-100 text-orange-800', text: 'Out for Delivery' },
      'Delivered': { class: 'bg-green-100 text-green-800', text: 'Delivered' },
      'U': { class: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      'C': { class: 'bg-green-100 text-green-800', text: 'Confirmed' }
    };

    const config = statusConfig[status] || { class: 'bg-gray-100 text-gray-800', text: status };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && customers.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-grow">
        {/* Mobile-Responsive Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-6 sm:py-8">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Admin Dashboard</h1>
                <p className="text-blue-100 text-sm sm:text-base">Manage customers, pre-alerts, and packages</p>
              </div>
              <div className="w-full md:w-auto">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center md:text-left">
                  <p className="text-sm">Welcome, {user?.first_name} {user?.last_name}</p>
                  <p className="text-sm">Role: Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Mobile-Responsive Admin Tools Section */}
          <div className="bg-white rounded-xl shadow-lg mb-6 sm:mb-8">
            <div className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Admin Tools</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <a
                  href="/admin/transfers"
                  className="bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg p-4 transition-all duration-300 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-600 text-white p-2 rounded-lg group-hover:bg-blue-700 transition-colors flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 0V4a2 2 0 00-2-2H9a2 2 0 00-2 2v3m1 0h4" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm sm:text-base">Transfer Management</h4>
                      <p className="text-xs sm:text-sm text-gray-600">Manage package transfers between locations</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Success Alert */}
          {successMessage && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <span>{successMessage}</span>
                <button onClick={() => setSuccessMessage('')} className="text-green-800 hover:text-green-900">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Error Alert */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button onClick={clearError} className="text-red-800 hover:text-red-900">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Mobile-Responsive Navigation Tabs */}
          <div className="bg-white rounded-xl shadow-lg mb-6 sm:mb-8">
            {/* Mobile Tab Selector */}
            <div className="sm:hidden border-b border-gray-200">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value)}
                className="w-full px-4 py-4 bg-transparent text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="customers">👥 Customers</option>
                <option value="packages">📦 Packages</option>
                <option value="deliveries">🚚 Deliveries</option>
              </select>
            </div>

            {/* Desktop Tab Navigation */}
            <div className="hidden sm:flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('customers')}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 font-semibold transition-all duration-300 text-sm sm:text-base ${
                  activeTab === 'customers'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>👥</span>
                  <span>Customers</span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab('packages')}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 font-semibold transition-all duration-300 text-sm sm:text-base ${
                  activeTab === 'packages'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>📦</span>
                  <span>Packages</span>
                </span>
              </button>
              <button
                onClick={() => setActiveTab('deliveries')}
                className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 font-semibold transition-all duration-300 text-sm sm:text-base ${
                  activeTab === 'deliveries'
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>🚚</span>
                  <span>Deliveries</span>
                </span>
              </button>
            </div>

            <div className="p-4 sm:p-6">
              {activeTab === 'customers' && (
                <CustomerTab
                  customers={customers}
                  selectedCustomer={selectedCustomer}
                  customerPreAlerts={customerPreAlerts}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  handleCustomerSelect={handleCustomerSelect}
                  handlePreAlertSelect={handlePreAlertSelect}
                  handleConfirmPreAlert={handleConfirmPreAlert}
                  getStatusBadge={getStatusBadge}
                  formatDate={formatDate}
                />
              )}

              {activeTab === 'packages' && (
                <PackagesTab />
              )}

              {activeTab === 'deliveries' && (
                <DeliveriesTab />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Package Creation Modal */}
      {showPackageModal && selectedPreAlert && (
        <PackageModal
          preAlert={selectedPreAlert}
          onClose={() => setShowPackageModal(false)}
          onSubmit={handleCreatePackage}
        />
      )}
    </div>
  );
}

export default AdminDashboard;