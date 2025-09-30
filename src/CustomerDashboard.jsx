import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usePreAlert } from '../context/PreAlertContext';
import { usePackages } from '../context/PackagesContext'; // Import the new context
import { preAlertsAPI } from '../services/api';
import Header from './Header';
import Footer from './Footer';

function CustomerDashboard() {
  const { user, logout } = useAuth();
  const { preAlerts, loading: preAlertsLoading, createPreAlert, updatePreAlert, deletePreAlert } = usePreAlert();
  const { packages, loading: packagesLoading, trackPackage } = usePackages(); // Use the new context
  const [showPreAlertModal, setShowPreAlertModal] = useState(false);
  const [editingPreAlert, setEditingPreAlert] = useState(null);
  const [viewingPreAlert, setViewingPreAlert] = useState(null);
  const [deletingPreAlert, setDeletingPreAlert] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [packageSearchTerm, setPackageSearchTerm] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingError, setTrackingError] = useState('');
  const [packageFilter, setPackageFilter] = useState('all'); // 'all', 'delivered', 'outstanding'
  const [preAlertFilter, setPreAlertFilter] = useState('all'); // 'all', 'pending'

  // Parse the address into comprehensive address components
  const parseAddress = (address) => {
    if (!address) return {
      address1: '3132 NW 43rd Street',
      address2: `PSC ${user?.branch || 'UNKNOWN'} ${user?.user_id < 10 ? `0${user?.user_id}` : user?.user_id}`,
      city: 'Lauderdale Lakes',
      state: 'Florida',
      zipCode: '33309',
      formatted: address
    };

    // Try to parse the formatted address
    const parts = address.split(', ');
    if (parts.length >= 4) {
      const address1 = parts[0] || '3132 NW 43rd Street';
      const address2 = parts[1] || `PSC ${user?.branch || 'UNKNOWN'} ${user?.user_id < 10 ? `0${user?.user_id}` : user?.user_id}`;
      const city = parts[2] || 'Lauderdale Lakes';
      const stateZip = parts[3] || 'Florida 33309';
      const [state, zipCode] = stateZip.split(' ');

      return { address1, address2, city, state: state || 'Florida', zipCode: zipCode || '33309', formatted: address };
    }

    // Fallback parsing for legacy addresses
    const pscIndex = address.indexOf('PSC');
    if (pscIndex === -1) {
      return {
        address1: address,
        address2: `PSC ${user?.branch || 'UNKNOWN'} ${user?.user_id < 10 ? `0${user?.user_id}` : user?.user_id}`,
        city: 'Lauderdale Lakes',
        state: 'Florida',
        zipCode: '33309',
        formatted: address
      };
    }

    const address1 = address.substring(0, pscIndex).trim();
    const address2 = address.substring(pscIndex).trim();

    return {
      address1,
      address2,
      city: 'Lauderdale Lakes',
      state: 'Florida',
      zipCode: '33309',
      formatted: address
    };
  };

  const addressInfo = parseAddress(user?.address);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Packages are loaded automatically by the context
        // We just need to wait for both prealerts and packages to load
        setLoading(true);
        
        // Simulate minimum loading time for better UX
        await Promise.all([
          new Promise(resolve => setTimeout(resolve, 1000))
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleTrackPackage = async (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setTrackingError('');
      setTrackingResult(null);
      
      const result = await trackPackage(trackingNumber.trim());
      
      if (result.success) {
        setTrackingResult(result.data);
        setTrackingNumber('');
      } else {
        setTrackingError(result.error);
      }
    }
  };

  const handleCreatePreAlert = async (preAlertData) => {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('description', preAlertData.description);
    formData.append('price', preAlertData.price);

    if (preAlertData.receipt) {
      formData.append('receipt', preAlertData.receipt);
    }

    const result = await createPreAlert(formData);

    if (result.success) {
      setShowPreAlertModal(false);
      setEditingPreAlert(null);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleEditPreAlert = async (preAlertData) => {
    // Create FormData for file upload
    const formData = new FormData();
    formData.append('description', preAlertData.description);
    formData.append('price', preAlertData.price);

    if (preAlertData.receipt) {
      formData.append('receipt', preAlertData.receipt);
    }

    const result = await updatePreAlert(editingPreAlert.prealert_id, formData);

    if (result.success) {
      setShowPreAlertModal(false);
      setEditingPreAlert(null);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleDeletePreAlert = async () => {
    if (!deletingPreAlert) return;

    const result = await deletePreAlert(deletingPreAlert.prealert_id);

    if (result.success) {
      setDeletingPreAlert(null);
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const openEditModal = (prealert) => {
    setEditingPreAlert(prealert);
    setShowPreAlertModal(true);
  };

  const openViewModal = (prealert) => {
    setViewingPreAlert(prealert);
  };

  const openDeleteConfirmation = (prealert) => {
    setDeletingPreAlert(prealert);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      // Package statuses
      'Processing': { class: 'bg-gray-100 text-gray-800', text: 'Processing' },
      'Delivered to Overseas Warehouse': { class: 'bg-blue-100 text-blue-800', text: 'Arrived at Overseas Warehouse' },
      'In Transit to Jamaica': { class: 'bg-indigo-100 text-indigo-800', text: 'In Transit to Jamaica' },
      'Arrived in Jamaica': { class: 'bg-purple-100 text-purple-800', text: 'Arrived in Jamaica' },
      'Arrived at Selected Branch': { class: 'bg-teal-100 text-teal-800', text: 'At Local Branch' },
      'In Transit to Selected Branch': { class: 'bg-cyan-100 text-cyan-800', text: 'In Transit to Branch' },
      'Ready For Pickup': { class: 'bg-amber-100 text-amber-800', text: 'Ready for Pickup' },
      'Out for Delivery': { class: 'bg-orange-100 text-orange-800', text: 'Out for Delivery' },
      'Delivered': { class: 'bg-green-100 text-green-800', text: 'Delivered' },
      // Prealert statuses
      'U': { class: 'bg-yellow-100 text-yellow-800', text: 'Unconfirmed' },
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

  // Calculate outstanding packages (all packages that are not delivered)
  const outstandingPackagesCount = packages.filter(pkg => pkg.status !== 'Delivered').length;

  // Click handlers for quick stats cards
  const handleStatsCardClick = (cardType) => {
    switch (cardType) {
      case 'total-packages':
        setActiveTab('packages');
        setPackageFilter('all');
        break;
      case 'delivered-packages':
        setActiveTab('packages');
        setPackageFilter('delivered');
        break;
      case 'pending-prealerts':
        setActiveTab('prealerts');
        setPreAlertFilter('pending');
        break;
      case 'outstanding-packages':
        setActiveTab('packages');
        setPackageFilter('outstanding');
        break;
      default:
        break;
    }
  };

  // Get filtered packages based on current filter and search
  const getFilteredPackages = () => {
    let filtered = packages;

    // Apply status filter
    switch (packageFilter) {
      case 'delivered':
        filtered = filtered.filter(pkg => pkg.status === 'Delivered');
        break;
      case 'outstanding':
        filtered = filtered.filter(pkg => pkg.status !== 'Delivered');
        break;
    }

    // Apply search filter
    if (packageSearchTerm.trim()) {
      filtered = filtered.filter(pkg =>
        pkg.tracking_number.toLowerCase().includes(packageSearchTerm.toLowerCase()) ||
        pkg.description.toLowerCase().includes(packageSearchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  // Get filtered pre-alerts based on current filter and search
  const getFilteredPreAlerts = () => {
    let filtered = preAlerts;

    // Apply status filter
    switch (preAlertFilter) {
      case 'pending':
        filtered = filtered.filter(alert => alert.status === 'U');
        break;
    }

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(alert =>
        alert.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  // Reset filters when switching tabs manually
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'packages') {
      setPackageFilter('all');
    } else if (tab === 'prealerts') {
      setPreAlertFilter('all');
    }
  };

  if (loading || preAlertsLoading || packagesLoading) {
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
              <div className="text-center md:text-left w-full md:w-auto">
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">Welcome back, {user?.first_name}!</h1>
                <p className="text-blue-100 text-sm sm:text-base">Track your shipments and manage your pre-alerts</p>
              </div>
              <div className="w-full md:w-auto flex flex-col space-y-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 sm:p-4 text-center md:text-left">
                  <p className="text-sm">Customer ID: {user?.user_id}</p>
                  <p className="text-sm">Pickup Branch: {user?.branch}</p>
                </div>
                <button
                  onClick={() => setShowPreAlertModal(true)}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 px-4 py-2 rounded-lg transition-all duration-300 flex items-center justify-center w-full md:w-auto"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm sm:text-base">Create Pre-Alert</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Enhanced User Address Information */}
          <div className="bg-gradient-to-r from-white to-blue-50 rounded-xl shadow-lg border border-blue-100 p-4 sm:p-6 mb-6 sm:mb-8 transform transition-all duration-200 hover:shadow-xl">
            <div className="flex items-center mb-4 sm:mb-6">
              <div className="bg-blue-100 p-2 sm:p-3 rounded-lg mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Your Complete Shipping Address</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Address Line 1</h3>
                <p className="text-gray-800 font-medium text-sm sm:text-base">{addressInfo.address1}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">Address Line 2 (PSC)</h3>
                <p className="text-gray-800 font-medium text-sm sm:text-base">{addressInfo.address2}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">City</h3>
                <p className="text-gray-800 font-medium text-sm sm:text-base">{addressInfo.city}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">State</h3>
                <p className="text-gray-800 font-medium text-sm sm:text-base">{addressInfo.state}</p>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                <h3 className="text-xs sm:text-sm font-medium text-gray-600 mb-1">ZIP Code</h3>
                <p className="text-gray-800 font-medium text-sm sm:text-base">{addressInfo.zipCode}</p>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-green-100 p-3 rounded-lg border border-green-200">
                <h3 className="text-xs sm:text-sm font-medium text-green-700 mb-1">Complete Address</h3>
                <p className="text-green-800 font-medium text-sm sm:text-base break-words">{addressInfo.formatted || user?.address}, Lauderdale Lakes, Florida, 33309</p>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                <h3 className="text-xs sm:text-sm font-medium text-purple-700 mb-1">Email Address</h3>
                <p className="text-purple-800 font-medium text-sm sm:text-base break-words">{user?.email}</p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                <h3 className="text-xs sm:text-sm font-medium text-purple-700 mb-1">Phone Number</h3>
                <p className="text-purple-800 font-medium text-sm sm:text-base">{user?.phone || 'Not provided'}</p>
              </div>
            </div>

            {/* Important Notice */}
            <div className="mt-4 sm:mt-6 bg-amber-50 p-3 sm:p-4 rounded-lg border border-amber-200">
              <div className="flex items-start space-x-2">
                <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <h4 className="text-amber-800 font-semibold text-sm">⚠️ Important Address Information</h4>
                  <p className="text-amber-700 text-xs sm:text-sm mt-1">
                    This is your unique shipping address for all packages. Use this exact address when shopping online to ensure proper delivery to the PSC {user?.branch} location.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile-Responsive Tracking Search */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Track Your Package</h2>
            <form onSubmit={handleTrackPackage} className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number (e.g., TRK123456789)"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 w-full sm:w-auto"
              >
                <span className="text-sm sm:text-base">Track Package</span>
              </button>
            </form>

            {/* Tracking Results */}
            {trackingResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-800 mb-4">📦 Package Tracking Results</h3>

                {/* Package Summary */}
                <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="font-mono text-lg font-semibold text-blue-600">{trackingResult.tracking_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Current Status</p>
                      <div className="mt-1">{getStatusBadge(trackingResult.status)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Package Description</p>
                      <p className="font-semibold text-gray-800">{trackingResult.description || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="font-semibold text-gray-800">{formatDateTime(trackingResult.updated_at)}</p>
                    </div>
                  </div>
                </div>

                {/* Tracking History */}
                {trackingResult.tracking_history && trackingResult.tracking_history.length > 0 && (
                  <div className="bg-white rounded-lg p-4 shadow-sm">
                    <h4 className="text-md font-semibold text-gray-800 mb-3">📋 Tracking History</h4>
                    <div className="space-y-3">
                      {trackingResult.tracking_history.map((entry, index) => (
                        <div key={index} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-b-0">
                          <div className="flex-shrink-0 mt-1">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                {getStatusBadge(entry.status)}
                              </div>
                              <div className="text-xs text-gray-500 ml-2">
                                {formatDateTime(entry.timestamp)}
                              </div>
                            </div>
                            {entry.notes && (
                              <p className="text-sm text-gray-600 mt-1">{entry.notes}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">Updated by: {entry.updated_by}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No tracking history message */}
                {(!trackingResult.tracking_history || trackingResult.tracking_history.length === 0) && (
                  <div className="bg-white rounded-lg p-4 shadow-sm text-center">
                    <div className="text-gray-400 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <p className="text-gray-500">No detailed tracking history available yet.</p>
                    <p className="text-sm text-gray-400 mt-1">Status updates will appear here as your package moves through the system.</p>
                  </div>
                )}
              </div>
            )}

            {trackingError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{trackingError}</p>
              </div>
            )}
          </div>

          {/* Mobile-Responsive Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <button
              onClick={() => handleStatsCardClick('total-packages')}
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2 group-hover:text-blue-700">{packages.length}</div>
              <div className="text-sm sm:text-base text-gray-600 group-hover:text-gray-800">Total Packages</div>
            </button>
            <button
              onClick={() => handleStatsCardClick('delivered-packages')}
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2 group-hover:text-green-700">
                {packages.filter(p => p.status === 'Delivered').length}
              </div>
              <div className="text-sm sm:text-base text-gray-600 group-hover:text-gray-800">Delivered</div>
            </button>
            <button
              onClick={() => handleStatsCardClick('pending-prealerts')}
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              <div className="text-2xl sm:text-3xl font-bold text-yellow-600 mb-2 group-hover:text-yellow-700">
                {preAlerts.filter(p => p.status === 'U').length}
              </div>
              <div className="text-sm sm:text-base text-gray-600 group-hover:text-gray-800">Pending Pre-Alerts</div>
            </button>
            <button
              onClick={() => handleStatsCardClick('outstanding-packages')}
              className="bg-white rounded-xl shadow-lg p-4 sm:p-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group"
            >
              <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2 group-hover:text-purple-700">
                {outstandingPackagesCount}
              </div>
              <div className="text-sm sm:text-base text-gray-600 group-hover:text-gray-800">Outstanding Packages</div>
            </button>
          </div>

          {/* Mobile-Responsive Navigation Tabs */}
          <div className="bg-white rounded-xl shadow-lg mb-6 sm:mb-8">
            {/* Mobile Tab Navigation - Stacked for Better UX */}
            <div className="sm:hidden border-b border-gray-200">
              <div className="grid grid-cols-3 gap-1 p-2">
                <button
                  onClick={() => handleTabChange('overview')}
                  className={`px-3 py-3 font-semibold text-xs transition-all duration-300 rounded-lg ${
                    activeTab === 'overview'
                      ? 'text-blue-600 bg-blue-50 border-2 border-blue-200'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-lg">📊</span>
                    <span>Overview</span>
                  </div>
                </button>
                <button
                  onClick={() => handleTabChange('packages')}
                  className={`px-3 py-3 font-semibold text-xs transition-all duration-300 rounded-lg ${
                    activeTab === 'packages'
                      ? 'text-blue-600 bg-blue-50 border-2 border-blue-200'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-lg">📦</span>
                    <span>Packages</span>
                    <span className="text-xs">({packages.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => handleTabChange('prealerts')}
                  className={`px-3 py-3 font-semibold text-xs transition-all duration-300 rounded-lg ${
                    activeTab === 'prealerts'
                      ? 'text-blue-600 bg-blue-50 border-2 border-blue-200'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <span className="text-lg">🚨</span>
                    <span>Pre-Alerts</span>
                    <span className="text-xs">({preAlerts.length})</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Desktop Tab Navigation */}
            <div className="hidden sm:flex border-b">
              <button
                onClick={() => handleTabChange('overview')}
                className={`px-6 py-4 font-semibold transition-all duration-300 ${
                  activeTab === 'overview'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>📊</span>
                  <span>Overview</span>
                </span>
              </button>
              <button
                onClick={() => handleTabChange('packages')}
                className={`px-6 py-4 font-semibold transition-all duration-300 ${
                  activeTab === 'packages'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>📦</span>
                  <span>Packages ({packages.length})</span>
                </span>
                {packageFilter !== 'all' && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-600 rounded-full">
                    {packageFilter === 'delivered' ? 'Delivered' : 'Outstanding'}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleTabChange('prealerts')}
                className={`px-6 py-4 font-semibold transition-all duration-300 ${
                  activeTab === 'prealerts'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600'
                }`}
              >
                <span className="flex items-center space-x-2">
                  <span>🚨</span>
                  <span>Pre-Alerts ({preAlerts.length})</span>
                </span>
                {preAlertFilter !== 'all' && (
                  <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-600 rounded-full">
                    Pending
                  </span>
                )}
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Recent Packages */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Packages</h3>
                    {packages.slice(0, 3).map((pkg) => (
                      <div key={pkg.package_id} className="bg-gray-50 rounded-lg p-4 mb-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">{pkg.tracking_number}</span>
                          {getStatusBadge(pkg.status)}
                        </div>
                        <p className="text-sm text-gray-600">{pkg.description}</p>
                        <p className="text-xs text-gray-500 mt-1">Updated: {formatDateTime(pkg.updated_at)}</p>
                      </div>
                    ))}
                  </div>

                  {/* Recent Pre-Alerts */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Pre-Alerts</h3>
                    {preAlerts.slice(0, 3).map((alert) => (
                      <div key={alert.prealert_id} className="bg-gray-50 rounded-lg p-4 mb-3">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-semibold">{alert.description}</span>
                          {getStatusBadge(alert.status)}
                        </div>
                        <p className="text-sm text-gray-600">Price: ${alert.price}</p>
                        <p className="text-xs text-gray-500 mt-1">Created: {formatDate(alert.created_at)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'packages' && (
                <div>
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 space-y-4 lg:space-y-0">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Your Packages
                      {packageFilter !== 'all' && (
                        <span className="ml-2 text-sm text-gray-600">
                          - {packageFilter === 'delivered' ? 'Delivered' : 'Outstanding'} ({getFilteredPackages().length})
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <input
                        type="text"
                        placeholder="Search packages..."
                        value={packageSearchTerm}
                        onChange={(e) => setPackageSearchTerm(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {packageFilter !== 'all' && (
                        <button
                          onClick={() => setPackageFilter('all')}
                          className="text-sm text-blue-600 hover:text-blue-800 underline whitespace-nowrap"
                        >
                          Show All Packages
                        </button>
                      )}
                    </div>
                  </div>
                  {getFilteredPackages().length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className="text-gray-600">
                        {packageFilter === 'all' ? 'No packages found' :
                         packageFilter === 'delivered' ? 'No delivered packages found' :
                         'No outstanding packages found'}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-2 text-left">Tracking #</th>
                            <th className="px-4 py-2 text-left">Description</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Weight</th>
                            <th className="px-4 py-2 text-left">Cost</th>
                            <th className="px-4 py-2 text-left">Last Updated</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getFilteredPackages().map((pkg) => (
                            <tr key={pkg.package_id} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3 font-semibold">{pkg.tracking_number}</td>
                              <td className="px-4 py-3">{pkg.description}</td>
                              <td className="px-4 py-3">{getStatusBadge(pkg.status)}</td>
                              <td className="px-4 py-3">{pkg.weight} kg</td>
                              <td className="px-4 py-3">${pkg.cost}</td>
                              <td className="px-4 py-3">{formatDateTime(pkg.updated_at)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'prealerts' && (
                <div>
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4 space-y-4 lg:space-y-0">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Your Pre-Alerts
                      {preAlertFilter !== 'all' && (
                        <span className="ml-2 text-sm text-gray-600">
                          - Pending ({getFilteredPreAlerts().length})
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <input
                        type="text"
                        placeholder="Search pre-alerts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {preAlertFilter !== 'all' && (
                        <button
                          onClick={() => setPreAlertFilter('all')}
                          className="text-sm text-blue-600 hover:text-blue-800 underline whitespace-nowrap"
                        >
                          Show All Pre-Alerts
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setEditingPreAlert(null);
                          setShowPreAlertModal(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center whitespace-nowrap"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Pre-Alert
                      </button>
                    </div>
                  </div>

                  {getFilteredPreAlerts().length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <p className="text-gray-600">
                        {searchTerm.trim() ? 'No pre-alerts match your search' :
                         preAlertFilter === 'pending' ? 'No pending pre-alerts found' :
                         'No pre-alerts found'}
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-2 text-left">Description</th>
                            <th className="px-4 py-2 text-left">Price</th>
                            <th className="px-4 py-2 text-left">Status</th>
                            <th className="px-4 py-2 text-left">Created</th>
                            <th className="px-4 py-2 text-left">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getFilteredPreAlerts().map((alert) => (
                            <tr key={alert.prealert_id} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="max-w-xs truncate" title={alert.description}>
                                  {alert.description}
                                </div>
                              </td>
                              <td className="px-4 py-3 font-semibold">${alert.price}</td>
                              <td className="px-4 py-3">{getStatusBadge(alert.status)}</td>
                              <td className="px-4 py-3 text-sm text-gray-600">
                                {formatDate(alert.created_at)}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex space-x-2">
                                  <button
                                    onClick={() => openViewModal(alert)}
                                    className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                                    title="View details"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </button>
                                  {alert.status === 'U' && (
                                    <button
                                      onClick={() => openEditModal(alert)}
                                      className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
                                      title="Edit pre-alert"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                    </button>
                                  )}
                                  {alert.status === 'U' && (
                                    <button
                                      onClick={() => openDeleteConfirmation(alert)}
                                      className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                                      title="Delete pre-alert"
                                    >
                                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Pre-Alert Modal */}
      {showPreAlertModal && (
        <PreAlertModal
          onClose={() => {
            setShowPreAlertModal(false);
            setEditingPreAlert(null);
          }}
          onSubmit={editingPreAlert ? handleEditPreAlert : handleCreatePreAlert}
          editingPreAlert={editingPreAlert}
        />
      )}

      {/* View Pre-Alert Modal */}
      {viewingPreAlert && (
        <ViewPreAlertModal
          prealert={viewingPreAlert}
          onClose={() => setViewingPreAlert(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingPreAlert && (
        <DeleteConfirmationModal
          prealert={deletingPreAlert}
          onClose={() => setDeletingPreAlert(null)}
          onConfirm={handleDeletePreAlert}
        />
      )}
    </div>
  );
}

// Pre-Alert Modal Component
function PreAlertModal({ onClose, onSubmit, editingPreAlert }) {
  const [formData, setFormData] = useState({
    description: editingPreAlert?.description || '',
    price: editingPreAlert?.price || '',
    receipt: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.receipt && !editingPreAlert) newErrors.receipt = 'Receipt upload is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    await onSubmit(formData);
    setIsSubmitting(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, receipt: file }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {editingPreAlert ? 'Edit Pre-Alert' : 'Create New Pre-Alert'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Item Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={3}
              placeholder="Describe the items in your package..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Price (USD) *
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.price ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Receipt {!editingPreAlert && '*'}
            </label>
            <input
              type="file"
              onChange={handleFileChange}
              accept="image/*,.pdf"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.receipt ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.receipt && (
              <p className="mt-1 text-sm text-red-600">{errors.receipt}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              {editingPreAlert
                ? 'Upload a new receipt to replace the existing one (PDF, JPG, PNG)'
                : 'Upload your invoice or receipt (PDF, JPG, PNG)'
              }
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
            >
              {isSubmitting
                ? (editingPreAlert ? 'Updating...' : 'Creating...')
                : (editingPreAlert ? 'Update Pre-Alert' : 'Create Pre-Alert')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Receipt Download Button Component
function ReceiptDownloadButton({ prealertId }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDownload = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await preAlertsAPI.getReceiptDownloadUrl(prealertId);
      if (response.data.success) {
        // Open the presigned URL in a new tab for download/viewing
        window.open(response.data.downloadUrl, '_blank');
      } else {
        setError('Failed to generate download link');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      setError(error.response?.data?.message || 'Failed to download receipt');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleDownload}
        disabled={isLoading}
        className="text-blue-600 hover:text-blue-800 underline flex items-center disabled:opacity-50"
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {isLoading ? 'Loading...' : 'View Receipt'}
      </button>
      {error && (
        <p className="text-red-600 text-xs mt-1">{error}</p>
      )}
    </div>
  );
}

// View Pre-Alert Modal Component
function ViewPreAlertModal({ prealert, onClose }) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status) => {
    return status === 'U' ? 'Unconfirmed' : 'Confirmed';
  };

  const getStatusBadge = (status) => {
    const isConfirmed = status === 'C';
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
        isConfirmed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
      }`}>
        {getStatusText(status)}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Pre-Alert Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <div>
              {getStatusBadge(prealert.status)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <div className="bg-gray-50 rounded-lg p-3 border">
              <p className="text-gray-800">{prealert.description}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <div className="bg-gray-50 rounded-lg p-3 border">
                <p className="text-gray-800 font-semibold">${prealert.price}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pre-Alert ID
              </label>
              <div className="bg-gray-50 rounded-lg p-3 border">
                <p className="text-gray-800 font-mono text-sm">{prealert.prealert_id}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created Date
            </label>
            <div className="bg-gray-50 rounded-lg p-3 border">
              <p className="text-gray-800">{formatDate(prealert.created_at)}</p>
            </div>
          </div>

          {prealert.invoice_url && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receipt
              </label>
              <div className="bg-gray-50 rounded-lg p-3 border">
                <ReceiptDownloadButton prealertId={prealert.prealert_id} />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-6">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Delete Confirmation Modal Component
function DeleteConfirmationModal({ prealert, onClose, onConfirm }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-800">Delete Pre-Alert</h2>
        </div>

        <p className="text-gray-600 mb-4">
          Are you sure you want to delete this pre-alert? This action cannot be undone.
        </p>

        <div className="bg-gray-50 rounded-lg p-3 mb-6 border">
          <p className="text-sm text-gray-600 mb-1">Description:</p>
          <p className="text-gray-800 font-medium">{prealert.description}</p>
          <p className="text-sm text-gray-600 mt-2 mb-1">Price:</p>
          <p className="text-gray-800 font-semibold">${prealert.price}</p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboard;