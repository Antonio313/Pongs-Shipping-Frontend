import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import DeliveryModal from './DeliveryModal';

function DeliveriesTab() {
  const { user } = useAuth();
  const [readyCustomers, setReadyCustomers] = useState([]);
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [todayTotal, setTodayTotal] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeView, setActiveView] = useState('ready'); // 'ready' or 'today'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCustomer, setExpandedCustomer] = useState(null);

  // Load data on component mount
  useEffect(() => {
    fetchReadyCustomers();
    fetchTodayDeliveries();
  }, []);

  const fetchReadyCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/deliveries/ready-for-pickup`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReadyCustomers(response.data.customers);
    } catch (error) {
      console.error('Error fetching ready customers:', error);
      setError('Failed to load customers with packages ready for pickup');
    } finally {
      setLoading(false);
    }
  };

  const fetchTodayDeliveries = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/deliveries/today`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTodayDeliveries(response.data.deliveries);
      setTodayTotal(response.data.summary.total_amount);
    } catch (error) {
      console.error('Error fetching today\'s deliveries:', error);
      setError('Failed to load today\'s deliveries');
    }
  };

  // Filter customers based on search query
  const filteredCustomers = readyCustomers.filter(customer => {
    const searchTerm = searchQuery.toLowerCase();
    const fullName = `${customer.first_name} ${customer.last_name}`.toLowerCase();
    const emailMatch = customer.email.toLowerCase().includes(searchTerm);
    const phoneMatch = customer.phone?.toLowerCase().includes(searchTerm);
    const branchMatch = customer.branch.toLowerCase().includes(searchTerm);

    // Also search within packages
    const packageMatch = customer.packages.some(pkg =>
      pkg.tracking_number.toLowerCase().includes(searchTerm) ||
      pkg.description?.toLowerCase().includes(searchTerm)
    );

    return fullName.includes(searchTerm) || emailMatch || phoneMatch || branchMatch || packageMatch;
  });

  const handleDeliverPackages = (customer, packages) => {
    setSelectedCustomer(customer);
    setSelectedPackages(packages);
    setShowDeliveryModal(true);
  };

  const handleDeliveryComplete = async (deliveryData) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Deliver only the selected packages
      const packagesToDeliver = deliveryData.selected_packages;
      const deliveryPromises = packagesToDeliver.map(pkg =>
        axios.post(
          `${import.meta.env.VITE_API_URL}/deliveries/deliver/${pkg.package_id}`,
          {
            received_by: deliveryData.received_by,
            notes: deliveryData.notes,
            payment_method: deliveryData.payment_method
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        )
      );

      const responses = await Promise.all(deliveryPromises);
      const successCount = responses.filter(r => r.data.success).length;

      if (successCount === packagesToDeliver.length) {
        setSuccessMessage(`${successCount} package(s) delivered successfully to ${selectedCustomer.first_name} ${selectedCustomer.last_name}!`);
      } else {
        setError(`Only ${successCount} out of ${packagesToDeliver.length} packages were delivered successfully`);
      }

      setShowDeliveryModal(false);
      setSelectedCustomer(null);
      setSelectedPackages([]);

      // Refresh both lists
      await fetchReadyCustomers();
      await fetchTodayDeliveries();
    } catch (error) {
      console.error('Error delivering packages:', error);
      setError(error.response?.data?.message || 'Failed to deliver packages');
    } finally {
      setLoading(false);
    }
  };

  const toggleCustomerExpand = (customerId) => {
    setExpandedCustomer(expandedCustomer === customerId ? null : customerId);
  };

  const formatCurrency = (amount) => {
    return `JM$${parseFloat(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
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

  // Clear messages after 5 seconds
  useEffect(() => {
    if (successMessage || error) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
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
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-800 hover:text-red-900">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveView('ready')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
            activeView === 'ready'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>Ready for Pickup ({readyCustomers.length} customers)</span>
          </div>
        </button>
        <button
          onClick={() => setActiveView('today')}
          className={`flex-1 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
            activeView === 'today'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-blue-600'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-6-7.15" />
            </svg>
            <span>Today's Deliveries ({todayDeliveries.length})</span>
          </div>
        </button>
      </div>

      {/* Search Bar for Ready View */}
      {activeView === 'ready' && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search customers, tracking numbers, or package descriptions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <svg className="h-5 w-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-600">
              Showing {filteredCustomers.length} of {readyCustomers.length} customers
            </p>
          )}
        </div>
      )}

      {/* Ready for Pickup View */}
      {activeView === 'ready' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Customers with Packages Ready for Pickup</h3>
            <button
              onClick={fetchReadyCustomers}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            </button>
          </div>

          {filteredCustomers.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No customers found' : 'No customers with packages ready for pickup'}
              </h3>
              <p className="text-gray-500">
                {searchQuery ? 'Try adjusting your search terms' : 'All packages have been delivered or are still in transit'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <div key={customer.user_id} className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 transition-all duration-300 hover:shadow-lg">
                  {/* Customer Header */}
                  <div className="p-6 border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-bold text-gray-900 text-xl">{customer.first_name} {customer.last_name}</h4>
                          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                            {customer.package_count} package{customer.package_count !== 1 ? 's' : ''}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            <span>{customer.email}</span>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center">
                              <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span>{customer.branch}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total Amount</p>
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(customer.total_amount)}</p>
                        </div>

                        <button
                          onClick={() => toggleCustomerExpand(customer.user_id)}
                          className="p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        >
                          <svg
                            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${expandedCustomer === customer.user_id ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Package Details */}
                  {expandedCustomer === customer.user_id && (
                    <div className="p-6 bg-gray-50">
                      <h5 className="font-semibold text-gray-900 mb-4">Package Details:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {customer.packages.map((pkg) => (
                          <div key={pkg.package_id} className="bg-white rounded-lg border border-gray-200 p-4">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-600">Tracking #:</span>
                                <span className="text-xs font-mono font-medium text-blue-600">{pkg.tracking_number}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-600">Weight:</span>
                                <span className="text-xs font-medium">{pkg.weight} lbs</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-gray-600">Amount:</span>
                                <span className="text-sm font-bold text-green-600">{formatCurrency(pkg.finalcost)}</span>
                              </div>
                              {pkg.description && (
                                <div className="mt-2">
                                  <p className="text-xs text-gray-600">Description:</p>
                                  <p className="text-xs text-gray-800 bg-gray-50 p-2 rounded border mt-1">{pkg.description}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Deliver All Button */}
                  <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <button
                      onClick={() => handleDeliverPackages(customer, customer.packages)}
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-6-7.15" />
                        </svg>
                        <span>Deliver All Packages ({customer.package_count}) - {formatCurrency(customer.total_amount)}</span>
                      </div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Today's Deliveries View */}
      {activeView === 'today' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-800">Today's Deliveries</h3>
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 text-green-800 px-4 py-2 rounded-lg font-semibold">
                Total: {formatCurrency(todayTotal)}
              </div>
              <button
                onClick={fetchTodayDeliveries}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
              >
                <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {todayDeliveries.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-6-7.15" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No deliveries today</h3>
              <p className="text-gray-500">No packages have been delivered yet today</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Received By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered At</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {todayDeliveries.map((delivery) => (
                      <tr key={delivery.delivery_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="font-medium text-gray-900">{delivery.first_name} {delivery.last_name}</div>
                            <div className="text-sm text-gray-500">{delivery.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-mono text-sm font-medium text-blue-600">{delivery.tracking_number}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-green-600">{formatCurrency(delivery.finalcost)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900">{delivery.received_by}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">{formatDateTime(delivery.delivered_at)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-900">
                            {delivery.admin_first_name} {delivery.admin_last_name}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Delivery Modal */}
      {showDeliveryModal && selectedCustomer && selectedPackages.length > 0 && (
        <DeliveryModal
          customer={selectedCustomer}
          packages={selectedPackages}
          onClose={() => {
            setShowDeliveryModal(false);
            setSelectedCustomer(null);
            setSelectedPackages([]);
          }}
          onSubmit={handleDeliveryComplete}
          loading={loading}
          adminUser={user}
        />
      )}
    </div>
  );
}

export default DeliveriesTab;