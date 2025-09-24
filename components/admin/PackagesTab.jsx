import { useState, useEffect } from 'react';
import { usePackages } from '../../context/PackagesContext';
import { packagesAPI } from '../../services/api';

function PackagesTab() {
  const { allPackages, loading, error, loadAllPackages, updatePackageStatus, deletePackage, clearError } = usePackages();
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadAllPackages();
  }, []);

  const filteredPackages = allPackages.filter(pkg => {
    const matchesSearch =
      (pkg.tracking_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pkg.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pkg.first_name && pkg.last_name && `${pkg.first_name} ${pkg.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || pkg.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handlePackageSelect = (pkg) => {
    setSelectedPackage(pkg);
    setShowPackageModal(true);
  };

  const handlePackageUpdate = (pkg) => {
    setSelectedPackage(pkg);
    setShowUpdateModal(true);
  };

  const handleStatusUpdate = async (packageId, newStatus) => {
    try {
      await updatePackageStatus(packageId, { status: newStatus });
      // Refresh the packages list
      loadAllPackages();
    } catch (error) {
      console.error('Error updating package status:', error);
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
      'Delivered': { class: 'bg-green-100 text-green-800', text: 'Delivered' }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 md:mb-0">All Packages</h3>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search packages..."
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="Processing">Processing</option>
            <option value="Delivered to Overseas Warehouse">At Overseas Warehouse</option>
            <option value="In Transit to Jamaica">In Transit To Jamaica</option>
            <option value="Arrived in Jamaica">Arrived in Jamaica</option>
            <option value="Arrived at Selected Branch">Arrived at Branch</option>
            <option value="In Transit to Selected Branch">In Transit to Branch</option>
            <option value="Ready For Pickup">Ready for Pickup</option>
            <option value="Out for Delivery">Out for Delivery</option>
            <option value="Delivered">Delivered</option>
          </select>
        </div>
      </div>

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

      {filteredPackages.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-gray-600">No packages found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking #</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPackages.map(pkg => (
                <tr 
                  key={pkg.package_id} 
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => handlePackageSelect(pkg)}
                >
                  <td className="px-4 py-3 font-mono text-sm">{pkg.tracking_number}</td>
                  <td className="px-4 py-3">
                    {pkg.first_name && pkg.last_name ? (
                      <span>{pkg.first_name} {pkg.last_name}</span>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                  <td className="px-4 py-3 max-w-xs truncate">{pkg.description}</td>
                  <td className="px-4 py-3">{pkg.weight} lb</td>
                  <td className="px-4 py-3">${pkg.cost}</td>
                  <td className="px-4 py-3">{getStatusBadge(pkg.status)}</td>
                  <td className="px-4 py-3">{formatDate(pkg.created_at)}</td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePackageSelect(pkg);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded transition-all duration-300"
                      >
                        View
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePackageUpdate(pkg);
                        }}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1 rounded transition-all duration-300"
                      >
                        Update
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Package Details Modal */}
      {showPackageModal && selectedPackage && (
        <PackageDetailsModal
          package={selectedPackage}
          onClose={() => setShowPackageModal(false)}
          onStatusUpdate={handleStatusUpdate}
          onDelete={() => {
            setShowPackageModal(false);
            setShowDeleteModal(true);
          }}
          getStatusBadge={getStatusBadge}
          formatDate={formatDate}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedPackage && (
        <DeleteConfirmationModal
          package={selectedPackage}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            try {
              const result = await deletePackage(selectedPackage.package_id);
              if (result.success) {
                setNotification({ type: 'success', message: 'Package deleted successfully' });
                loadAllPackages();
              } else {
                setNotification({ type: 'error', message: result.error || 'Failed to delete package' });
              }
            } catch (error) {
              setNotification({ type: 'error', message: 'Failed to delete package' });
            }
            setShowDeleteModal(false);
            setSelectedPackage(null);
          }}
        />
      )}

      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Package Update Modal */}
      {showUpdateModal && selectedPackage && (
        <UpdatePackageModal
          package={selectedPackage}
          onClose={() => setShowUpdateModal(false)}
          onUpdate={loadAllPackages}
          getStatusBadge={getStatusBadge}
        />
      )}
    </div>
  );
}

// Package Details Modal Component
function PackageDetailsModal({ package: pkg, onClose, onStatusUpdate, onDelete, getStatusBadge, formatDate }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { loadAllPackages } = usePackages();

  const handleStatusChange = async (newStatus) => {
    setIsUpdating(true);
    try {
      await onStatusUpdate(pkg.package_id, newStatus);
      await loadAllPackages();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-3xl max-w-4xl w-full h-[90vh] sm:max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6 flex-shrink-0">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Package Details</h2>
              <p className="text-blue-100 mt-1 text-sm sm:text-base hidden sm:block">Complete package information and management</p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white transition-colors duration-300 p-2 rounded-full hover:bg-blue-600"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
          {/* Status and Tracking */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Tracking Number</h3>
                <p className="font-mono text-2xl font-bold text-blue-600">{pkg.tracking_number}</p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-sm text-gray-600 mb-2">Current Status</p>
                <div className="inline-block">
                  {getStatusBadge(pkg.status)}
                </div>
              </div>
            </div>
          </div>

          {/* Customer and Package Info Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="bg-green-50 p-4 sm:p-6 rounded-xl border border-green-100">
              <div className="flex items-center mb-4">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Customer Information</h3>
              </div>
              {pkg.first_name && pkg.last_name ? (
                <div className="space-y-2">
                  <p className="text-xl font-semibold text-gray-900">{pkg.first_name} {pkg.last_name}</p>
                  <p className="text-sm text-gray-600 bg-green-100 px-3 py-1 rounded-full inline-block">User ID: {pkg.user_id}</p>
                </div>
              ) : (
                <p className="text-gray-500 italic">Customer information not available</p>
              )}
            </div>

            {/* Package Specifications */}
            <div className="bg-purple-50 p-4 sm:p-6 rounded-xl border border-purple-100">
              <div className="flex items-center mb-4">
                <div className="bg-purple-100 p-2 rounded-lg mr-3">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Package Specifications</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Weight</p>
                  <p className="text-lg font-bold text-purple-600">{pkg.weight} lb</p>
                </div>
                <div className="bg-white p-3 rounded-lg">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Cost</p>
                  <p className="text-lg font-bold text-green-600">${pkg.cost}</p>
                </div>
                <div className="bg-white p-3 rounded-lg col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Dimensions</p>
                  <p className="text-sm font-medium text-gray-700">
                    {pkg.length && pkg.width && pkg.height
                      ? `${pkg.length} × ${pkg.width} × ${pkg.height} cm`
                      : 'Not specified'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200">
            <div className="flex items-center mb-3">
              <div className="bg-gray-100 p-2 rounded-lg mr-3">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Package Description</h3>
            </div>
            <p className="text-gray-700 bg-white p-4 rounded-lg border">{pkg.description || 'No description provided'}</p>
          </div>

          {/* Timeline */}
          <div className="bg-indigo-50 p-4 sm:p-6 rounded-xl border border-indigo-100">
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">Timeline</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Created</p>
                <p className="text-lg font-semibold text-indigo-600">{formatDate(pkg.created_at)}</p>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Last Updated</p>
                <p className="text-lg font-semibold text-indigo-600">{formatDate(pkg.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 border-t flex-shrink-0">
          <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:items-center sm:space-y-0 sm:space-x-4">
            <button
              onClick={onDelete}
              className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 sm:py-2 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 order-2 sm:order-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete Package</span>
            </button>
            <button
              onClick={onClose}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 sm:py-2 rounded-lg transition-all duration-300 order-1 sm:order-2"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Package Update Modal Component
function UpdatePackageModal({ package: pkg, onClose, onUpdate, getStatusBadge }) {
  const [selectedStatus, setSelectedStatus] = useState(pkg.status);
  const [finalCost, setFinalCost] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showEmailConfirm, setShowEmailConfirm] = useState(false);
  const [sendEmail, setSendEmail] = useState(true);

  const availableStatuses = [
    'Processing',
    'Delivered to Overseas Warehouse',
    'In Transit to Jamaica',
    'Arrived in Jamaica',
    'Arrived at Selected Branch',
    'In Transit to Selected Branch',
    'Ready For Pickup',
    'Out for Delivery',
    'Delivered'
  ];

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    // If "Arrived in Jamaica" is selected, we'll show the final cost input
    if (status === 'Arrived in Jamaica') {
      setShowEmailConfirm(true);
    } else {
      setShowEmailConfirm(false);
      setFinalCost('');
    }
  };

  const handleUpdate = async () => {
    if (!selectedStatus) {
      alert('Please select a status');
      return;
    }

    if (selectedStatus === 'Arrived in Jamaica' && (!finalCost || isNaN(parseFloat(finalCost)))) {
      alert('Please enter a valid final cost for packages arriving in Jamaica');
      return;
    }

    setIsUpdating(true);
    try {
      // Call the API using the configured service
      const response = await packagesAPI.updatePackageStatus(pkg.package_id, {
        status: selectedStatus,
        finalCost: selectedStatus === 'Arrived in Jamaica' ? parseFloat(finalCost) : undefined,
        sendEmailNotification: sendEmail
      });

      const result = response.data;
      console.log('Package updated successfully:', result);

      // Refresh the packages list
      onUpdate();
      onClose();

      // Show success message
      alert(`Package status updated to "${selectedStatus}"${selectedStatus === 'Arrived in Jamaica' ? ` with final cost $${finalCost}` : ''}${sendEmail ? '. Customer notification sent.' : '. No email sent.'}`);

    } catch (error) {
      console.error('Error updating package:', error);
      alert('Failed to update package. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Update Package Status</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Package Information */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-sm font-medium text-gray-600 mb-2">Package Information</h3>
            <p className="font-mono text-lg font-semibold">{pkg.tracking_number}</p>
            <p className="text-sm text-gray-600">{pkg.description}</p>
            <div className="mt-2">
              <span className="text-xs text-gray-500">Current Status: </span>
              {getStatusBadge(pkg.status)}
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Status <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availableStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Final Cost Input - Only shown for "Arrived in Jamaica" */}
          {selectedStatus === 'Arrived in Jamaica' && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="text-sm font-medium text-yellow-800 mb-3">📦 Final Landing Cost Required</h3>
              <p className="text-sm text-yellow-700 mb-3">
                Please enter the total cost including customs fees and local shipping charges.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Final Cost (JMD) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={finalCost}
                  onChange={(e) => setFinalCost(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This cost will be included in the customer notification email.
              </p>
            </div>
          )}

          {/* Email Notification Option */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">📧 Customer Notification</h3>
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="sendEmail"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="sendEmail" className="text-sm text-gray-700">
                Send email notification to customer
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {selectedStatus === 'Arrived in Jamaica' ?
                'Customer will receive detailed information about the final cost and next steps.' :
                'Customer will receive a status update notification.'
              }
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            disabled={isUpdating}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={isUpdating}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
          >
            {isUpdating && (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{isUpdating ? 'Updating...' : 'Update Package'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Delete Confirmation Modal Component
function DeleteConfirmationModal({ package: pkg, onClose, onConfirm }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-3xl max-w-md w-full">
        {/* Header */}
        <div className="bg-red-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center">
            <div className="bg-red-700 p-2 rounded-lg mr-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold">Delete Package</h2>
              <p className="text-red-100 text-sm">This action cannot be undone</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
            <p className="text-gray-700 mb-3">
              Are you sure you want to delete this package? This will permanently remove:
            </p>
            <ul className="text-sm text-gray-600 space-y-1 ml-4">
              <li>• Package tracking information</li>
              <li>• Customer delivery history</li>
              <li>• All associated data</li>
            </ul>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border">
            <h4 className="font-medium text-gray-800 mb-2">Package Details:</h4>
            <p className="text-sm text-gray-600">
              <span className="font-mono font-bold">{pkg.tracking_number}</span>
            </p>
            <p className="text-sm text-gray-600">
              {pkg.first_name} {pkg.last_name} - {pkg.description}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
          >
            {isDeleting && (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{isDeleting ? 'Deleting...' : 'Delete Package'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Notification Component
function Notification({ type, message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const typeConfig = {
    success: {
      bg: 'bg-green-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    error: {
      bg: 'bg-red-600',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    }
  };

  const config = typeConfig[type] || typeConfig.error;

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right duration-300">
      <div className={`${config.bg} text-white px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 max-w-md`}>
        <div className="flex-shrink-0">
          {config.icon}
        </div>
        <p className="font-medium">{message}</p>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default PackagesTab;