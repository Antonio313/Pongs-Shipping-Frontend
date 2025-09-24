import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { usePackages } from '../../context/PackagesContext';
import Header from '../../src/Header';
import Footer from '../../src/Footer';
import { transfersAPI } from '../../services/api';

function TransfersPage() {
  const { user } = useAuth();
  const { allPackages, loading, error, loadAllPackages, clearError } = usePackages();
  const [transferLists, setTransferLists] = useState([]);
  const [selectedTransferList, setSelectedTransferList] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('all');

  useEffect(() => {
    loadAllPackages();
    loadTransferLists();
  }, []);

  const loadTransferLists = async () => {
    try {
      const response = await transfersAPI.getAllTransfers();
      setTransferLists(response.data);
    } catch (error) {
      console.error('Error loading transfer lists:', error);
    }
  };

  const locations = [
    { value: 'jamaica', label: 'Jamaica' },
    { value: 'priory-branch', label: 'Priory Branch' },
    { value: 'ocho-rios-branch', label: 'Ocho Rios Branch' },
    { value: 'overseas-warehouse', label: 'Overseas Warehouse' }
  ];

  const filteredTransferLists = transferLists.filter(list => {
    const matchesSearch =
      list.transfer_id.toString().includes(searchQuery) ||
      list.destination.toLowerCase().includes(searchQuery.toLowerCase()) ||
      list.created_by_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDestination = destinationFilter === 'all' || list.destination === destinationFilter;

    return matchesSearch && matchesDestination;
  });

  const getStatusBadge = (status) => {
    const statusConfig = {
      'created': { class: 'bg-blue-100 text-blue-800', text: 'Created' },
      'in_transit': { class: 'bg-yellow-100 text-yellow-800', text: 'In Transit' },
      'delivered': { class: 'bg-green-100 text-green-800', text: 'Delivered' },
      'cancelled': { class: 'bg-red-100 text-red-800', text: 'Cancelled' }
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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateTransfer = () => {
    setShowCreateModal(true);
  };

  const handleViewTransfer = (transferList) => {
    setSelectedTransferList(transferList);
    setShowViewModal(true);
  };

  if (loading && transferLists.length === 0) {
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
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold mb-2">Transfer Management</h1>
                <p className="text-blue-100">Manage package transfers between locations</p>
              </div>
              <div className="mt-4 md:mt-0">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                  <p className="text-sm">Welcome, {user?.first_name} {user?.last_name}</p>
                  <p className="text-sm">Role: Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 py-8">
          {/* Navigation Breadcrumb */}
          <nav className="mb-6">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <a href="/adminDashboard" className="hover:text-blue-600">Admin Dashboard</a>
              <span>/</span>
              <span className="text-blue-600 font-medium">Transfers</span>
            </div>
          </nav>

          {/* Main Content */}
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 md:mb-0">Transfer Lists</h3>

                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search transfers..."
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />

                  <select
                    value={destinationFilter}
                    onChange={(e) => setDestinationFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Destinations</option>
                    {locations.map(location => (
                      <option key={location.value} value={location.value}>{location.label}</option>
                    ))}
                  </select>

                  <button
                    onClick={handleCreateTransfer}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 whitespace-nowrap"
                  >
                    Create Transfer List
                  </button>
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

              {filteredTransferLists.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 0V4a2 2 0 00-2-2H9a2 2 0 00-2 2v3m1 0h4" />
                  </svg>
                  <p className="text-gray-600">No transfer lists found</p>
                  <button
                    onClick={handleCreateTransfer}
                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300"
                  >
                    Create Your First Transfer List
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package Count</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created By</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransferLists.map(transferList => (
                        <tr
                          key={transferList.transfer_id}
                          className="border-b hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleViewTransfer(transferList)}
                        >
                          <td className="px-4 py-3 font-mono text-sm">TL-{transferList.transfer_id}</td>
                          <td className="px-4 py-3">
                            {locations.find(loc => loc.value === transferList.destination)?.label || transferList.destination}
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {transferList.package_count} packages
                            </span>
                          </td>
                          <td className="px-4 py-3">{getStatusBadge(transferList.status)}</td>
                          <td className="px-4 py-3">{transferList.created_by_name || 'N/A'}</td>
                          <td className="px-4 py-3">{formatDate(transferList.created_at)}</td>
                          <td className="px-4 py-3">
                            <div className="flex space-x-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleViewTransfer(transferList);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded transition-all duration-300"
                              >
                                View
                              </button>
                              {transferList.status === 'created' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Handle edit functionality
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1 rounded transition-all duration-300"
                                >
                                  Edit
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
          </div>
        </div>
      </main>

      <Footer />

      {/* Create Transfer Modal */}
      {showCreateModal && (
        <CreateTransferModal
          packages={allPackages}
          locations={locations}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadTransferLists();
          }}
        />
      )}

      {/* View Transfer Modal */}
      {showViewModal && selectedTransferList && (
        <ViewTransferModal
          transferList={selectedTransferList}
          onClose={() => setShowViewModal(false)}
          onUpdate={() => {
            loadTransferLists();
            setShowViewModal(false);
          }}
          getStatusBadge={getStatusBadge}
          formatDate={formatDate}
          locations={locations}
        />
      )}
    </div>
  );
}

// Create Transfer Modal Component
function CreateTransferModal({ packages, locations, onClose, onSuccess }) {
  const [selectedPackages, setSelectedPackages] = useState([]);
  const [destination, setDestination] = useState('');
  const [notes, setNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter packages to only show eligible statuses
  const availablePackages = packages.filter(pkg =>
    pkg.status === 'In Transit to Jamaica' ||
    pkg.status === 'In Transit to Selected Branch'
  );

  const filteredPackages = availablePackages.filter(pkg => {
    const matchesSearch =
      pkg.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pkg.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (pkg.first_name && `${pkg.first_name} ${pkg.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || pkg.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handlePackageToggle = (packageId) => {
    setSelectedPackages(prev =>
      prev.includes(packageId)
        ? prev.filter(id => id !== packageId)
        : [...prev, packageId]
    );
  };

  const selectAllPackages = () => {
    if (selectedPackages.length === filteredPackages.length) {
      setSelectedPackages([]);
    } else {
      setSelectedPackages(filteredPackages.map(pkg => pkg.package_id));
    }
  };

  const handleCreateTransfer = async () => {
    if (!destination) {
      alert('Please select a destination');
      return;
    }

    if (selectedPackages.length === 0) {
      alert('Please select at least one package');
      return;
    }

    setIsCreating(true);
    try {
      const response = await transfersAPI.createTransfer({
        destination,
        packages: selectedPackages,
        notes
      });

      const result = response.data;
      console.log('Transfer list created:', result);
      onSuccess();

    } catch (error) {
      console.error('Error creating transfer list:', error);
      alert('Failed to create transfer list. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Create Transfer List</h2>
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
          {/* Transfer Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination <span className="text-red-500">*</span>
              </label>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select destination...</option>
                {locations.map(location => (
                  <option key={location.value} value={location.value}>{location.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Optional transfer notes..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>
          </div>

          {/* Eligible Status Info */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-medium text-blue-800 mb-2">📦 Eligible Packages</h3>
            <p className="text-sm text-blue-700">
              Only packages with the following statuses can be transferred:
              <span className="font-medium"> "In Transit to Jamaica"</span> and
              <span className="font-medium"> "In Transit to Selected Branch"</span>.
            </p>
          </div>

          {/* Package Selection */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-800">Select Packages</h3>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {selectedPackages.length} of {filteredPackages.length} selected
                </span>
                <button
                  onClick={selectAllPackages}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  {selectedPackages.length === filteredPackages.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <option value="In Transit to Jamaica">In Transit to Jamaica</option>
                <option value="In Transit to Selected Branch">In Transit to Selected Branch</option>
              </select>
            </div>

            <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
              {filteredPackages.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No eligible packages found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Only packages "In Transit to Jamaica" or "In Transit to Selected Branch" can be transferred.
                  </p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left">
                        <input
                          type="checkbox"
                          checked={selectedPackages.length === filteredPackages.length && filteredPackages.length > 0}
                          onChange={selectAllPackages}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPackages.map(pkg => (
                      <tr key={pkg.package_id} className="border-b hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedPackages.includes(pkg.package_id)}
                            onChange={() => handlePackageToggle(pkg.package_id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </td>
                        <td className="px-4 py-3 font-mono text-sm">{pkg.tracking_number}</td>
                        <td className="px-4 py-3">
                          {pkg.first_name && pkg.last_name ? (
                            <span>{pkg.first_name} {pkg.last_name}</span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate">{pkg.description}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {pkg.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            disabled={isCreating}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateTransfer}
            disabled={isCreating || selectedPackages.length === 0 || !destination}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold px-6 py-2 rounded-lg transition-all duration-300 flex items-center space-x-2"
          >
            {isCreating && (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{isCreating ? 'Creating...' : 'Create Transfer List'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// View Transfer Modal Component (reuse from TransfersTab.jsx)
function ViewTransferModal({ transferList, onClose, onUpdate, getStatusBadge, formatDate, locations }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkoffStatus, setCheckoffStatus] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadTransferPackages();
  }, [transferList.transfer_id]);

  const loadTransferPackages = async () => {
    try {
      const response = await transfersAPI.getTransferPackages(transferList.transfer_id);
      const data = response.data;
      setPackages(data.packages);

      // Initialize checkoff status
      const initialStatus = {};
      data.packages.forEach(pkg => {
        initialStatus[pkg.package_id] = pkg.checked_off || false;
      });
      setCheckoffStatus(initialStatus);
    } catch (error) {
      console.error('Error loading transfer packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoffToggle = async (packageId) => {
    const newStatus = !checkoffStatus[packageId];

    try {
      await transfersAPI.updatePackageCheckoff(transferList.transfer_id, packageId, { checked_off: newStatus });

      setCheckoffStatus(prev => ({
        ...prev,
        [packageId]: newStatus
      }));
    } catch (error) {
      console.error('Error updating checkoff status:', error);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this transfer as "${newStatus}"?`)) {
      return;
    }

    setIsUpdating(true);
    try {
      await transfersAPI.updateTransferStatus(transferList.transfer_id, { status: newStatus });
      onUpdate();
    } catch (error) {
      console.error('Error updating transfer status:', error);
      alert('Failed to update transfer status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const checkedOffCount = Object.values(checkoffStatus).filter(Boolean).length;
  const totalPackages = packages.length;
  const allCheckedOff = totalPackages > 0 && checkedOffCount === totalPackages;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Transfer List TL-{transferList.transfer_id}</h2>
            <p className="text-sm text-gray-600">
              Destination: {locations.find(loc => loc.value === transferList.destination)?.label || transferList.destination}
            </p>
          </div>
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
          {/* Transfer Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Status</h3>
              {getStatusBadge(transferList.status)}
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Progress</h3>
              <p className="font-semibold">{checkedOffCount} / {totalPackages} packages checked off</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalPackages > 0 ? (checkedOffCount / totalPackages) * 100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Created</h3>
              <p className="font-semibold">{formatDate(transferList.created_at)}</p>
              <p className="text-sm text-gray-600">by {transferList.created_by_name}</p>
            </div>
          </div>

          {/* Notes */}
          {transferList.notes && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Notes</h3>
              <p className="text-gray-800">{transferList.notes}</p>
            </div>
          )}

          {/* Package List */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Packages in Transfer</h3>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : packages.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No packages found in this transfer</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Checked</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tracking #</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packages.map(pkg => (
                      <tr
                        key={pkg.package_id}
                        className={`border-b transition-colors duration-200 ${
                          checkoffStatus[pkg.package_id] ? 'bg-green-50' : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={checkoffStatus[pkg.package_id] || false}
                            onChange={() => handleCheckoffToggle(pkg.package_id)}
                            disabled={transferList.status !== 'created' && transferList.status !== 'in_transit'}
                            className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                        </td>
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
                        <td className="px-4 py-3">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {pkg.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {transferList.status === 'created' && (
            <div className="flex justify-between items-center pt-4 border-t">
              <div className="flex space-x-3">
                <button
                  onClick={() => handleStatusUpdate('in_transit')}
                  disabled={isUpdating}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
                >
                  Mark as In Transit
                </button>

                <button
                  onClick={() => handleStatusUpdate('delivered')}
                  disabled={isUpdating || !allCheckedOff}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
                  title={!allCheckedOff ? 'All packages must be checked off first' : ''}
                >
                  Mark as Delivered
                </button>
              </div>

              <button
                onClick={() => handleStatusUpdate('cancelled')}
                disabled={isUpdating}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
              >
                Cancel Transfer
              </button>
            </div>
          )}

          {transferList.status === 'in_transit' && (
            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={() => handleStatusUpdate('delivered')}
                disabled={isUpdating || !allCheckedOff}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded-lg transition-all duration-300 disabled:opacity-50"
                title={!allCheckedOff ? 'All packages must be checked off first' : ''}
              >
                Mark as Delivered
              </button>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransfersPage;