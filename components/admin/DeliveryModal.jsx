import { useState } from 'react';

function DeliveryModal({ customer, packages, onClose, onSubmit, loading, adminUser }) {
  const [receivedBy, setReceivedBy] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [selectedPackages, setSelectedPackages] = useState(new Set(packages.map(pkg => pkg.package_id)));
  const [errors, setErrors] = useState({});

  const formatCurrency = (amount) => {
    return `JM$${parseFloat(amount || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!receivedBy.trim()) {
      newErrors.receivedBy = 'Received by name is required';
    }

    if (selectedPackages.size === 0) {
      newErrors.packages = 'At least one package must be selected';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const togglePackageSelection = (packageId) => {
    const newSelected = new Set(selectedPackages);
    if (newSelected.has(packageId)) {
      newSelected.delete(packageId);
    } else {
      newSelected.add(packageId);
    }
    setSelectedPackages(newSelected);
  };

  const selectAllPackages = () => {
    setSelectedPackages(new Set(packages.map(pkg => pkg.package_id)));
  };

  const deselectAllPackages = () => {
    setSelectedPackages(new Set());
  };

  const getSelectedPackagesData = () => {
    return packages.filter(pkg => selectedPackages.has(pkg.package_id));
  };

  const getSelectedTotal = () => {
    return getSelectedPackagesData().reduce((sum, pkg) => sum + parseFloat(pkg.finalcost || 0), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSubmit({
      received_by: receivedBy.trim(),
      notes: notes.trim(),
      payment_method: paymentMethod,
      selected_packages: getSelectedPackagesData()
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-6-7.15" />
              </svg>
              Deliver Package
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
              disabled={loading}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Customer Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer Details
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Customer Name</p>
                <p className="font-semibold text-gray-900">{customer.first_name} {customer.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer Number</p>
                <p className="font-semibold text-blue-700 text-lg">{customer.customer_number || `#${customer.user_id}`}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium text-gray-700">{customer.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium text-gray-700">{customer.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Branch</p>
                <p className="font-semibold text-gray-900">{customer.branch}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium text-gray-700">{customer.address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Package Count</p>
                <p className="font-semibold text-green-600">{packages.length} package(s)</p>
              </div>
            </div>
          </div>

          {/* Packages Information */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6 border border-purple-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                Select Packages to Deliver
              </h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={selectAllPackages}
                  className="text-sm bg-purple-100 hover:bg-purple-200 text-purple-700 px-3 py-1 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Select All
                </button>
                <button
                  type="button"
                  onClick={deselectAllPackages}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-lg transition-colors"
                  disabled={loading}
                >
                  Deselect All
                </button>
              </div>
            </div>

            {errors.packages && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.packages}</p>
              </div>
            )}

            <div className="space-y-3">
              {packages.map((pkg, index) => (
                <div key={pkg.package_id} className={`bg-white rounded-lg p-4 border-2 transition-all duration-200 ${
                  selectedPackages.has(pkg.package_id)
                    ? 'border-purple-300 bg-purple-50'
                    : 'border-purple-100 hover:border-purple-200'
                }`}>
                  <div className="flex items-start space-x-3">
                    <div className="flex items-center pt-1">
                      <input
                        type="checkbox"
                        id={`package-${pkg.package_id}`}
                        checked={selectedPackages.has(pkg.package_id)}
                        onChange={() => togglePackageSelection(pkg.package_id)}
                        className="w-5 h-5 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 focus:ring-2"
                        disabled={loading}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-gray-500">Tracking Number</p>
                          <p className="font-mono font-medium text-purple-600">{pkg.tracking_number}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Weight</p>
                          <p className="font-medium text-gray-900">{pkg.weight} lbs</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Amount</p>
                          <p className="font-bold text-green-600">{formatCurrency(pkg.finalcost)}</p>
                        </div>
                      </div>
                      {pkg.description && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500">Description</p>
                          <p className="text-sm text-gray-700">{pkg.description}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-purple-200">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">
                  Selected: {selectedPackages.size} of {packages.length} packages
                </span>
                <span className="text-lg font-bold text-purple-600">
                  Subtotal: {formatCurrency(getSelectedTotal())}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-6 border border-green-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Payment Information
            </h3>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Amount Due (Selected Packages)</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(getSelectedTotal())}</p>
                {selectedPackages.size < packages.length && (
                  <p className="text-xs text-gray-500 mt-1">
                    Total for all packages: {formatCurrency(customer.total_amount)}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                  💰 Collect Payment
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method <span className="text-red-500">*</span>
              </label>
              <select
                id="paymentMethod"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                disabled={loading}
              >
                <option value="cash">Cash</option>
                <option value="card">Credit/Debit Card</option>
                <option value="check">Check</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="mobile_payment">Mobile Payment</option>
              </select>
            </div>

            <div>
              <label htmlFor="adminName" className="block text-sm font-medium text-gray-700 mb-2">
                Delivered By (Admin)
              </label>
              <input
                type="text"
                id="adminName"
                value={`${adminUser?.first_name || ''} ${adminUser?.last_name || ''}`.trim()}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                disabled
                readOnly
              />
              <p className="mt-1 text-xs text-gray-500">This is automatically set to your logged-in admin account</p>
            </div>

            <div>
              <label htmlFor="receivedBy" className="block text-sm font-medium text-gray-700 mb-2">
                Received By <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="receivedBy"
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                placeholder="Enter the name of the person receiving the package"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${
                  errors.receivedBy ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                disabled={loading}
              />
              {errors.receivedBy && (
                <p className="mt-1 text-sm text-red-600">{errors.receivedBy}</p>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Notes <span className="text-gray-500">(Optional)</span>
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about the delivery (optional)"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                disabled={loading}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-6-7.15" />
                    </svg>
                    <span>Confirm Delivery</span>
                  </div>
                )}
              </button>
            </div>
          </form>

          {/* Information Note */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-blue-900 mb-1">Important Notes</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• The customer will receive an email confirmation of delivery</li>
                  <li>• Payment will be automatically recorded in the system</li>
                  <li>• Package status will be updated to "Delivered"</li>
                  <li>• This action cannot be undone</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeliveryModal;