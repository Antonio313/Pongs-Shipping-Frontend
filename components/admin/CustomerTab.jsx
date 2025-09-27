import { useState } from 'react';
import { preAlertsAPI, packagesAPI } from '../../services/api';

function CustomerTab({ 
  customers, 
  selectedCustomer, 
  customerPreAlerts, 
  searchQuery, 
  setSearchQuery, 
  handleCustomerSelect, 
  handlePreAlertSelect, 
  handleConfirmPreAlert, 
  getStatusBadge, 
  formatDate 
}) {
  const [selectedPreAlert, setSelectedPreAlert] = useState(null);
  const [showPreAlertModal, setShowPreAlertModal] = useState(false);
  const [showAddPackageModal, setShowAddPackageModal] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const [sendingNotification, setSendingNotification] = useState(false);
  const [notificationStatus, setNotificationStatus] = useState(null);

  const [packageForm, setPackageForm] = useState({
    description: '',
    weight: '',
    tracking_number: '',
    carrier: '',
    notes: ''
  });

  const filteredCustomers = customers.filter(customer => 
    `${customer.first_name} ${customer.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInternalPreAlertSelect = async (preAlert) => {
    setSelectedPreAlert(preAlert);
    setShowPreAlertModal(true);
    handlePreAlertSelect(preAlert);
  };

  const handleInternalConfirmPreAlert = (preAlert) => {
    handleConfirmPreAlert(preAlert);
  };

  const handleDownloadInvoice = async (prealertId) => {
    try {
      setDownloadingInvoice(true);
      const response = await preAlertsAPI.getReceiptDownloadUrl(prealertId);

      if (response.data.success) {
        // Open the presigned URL in a new tab for download/viewing
        window.open(response.data.downloadUrl, '_blank');
      } else {
        alert('Failed to get receipt download link. Please try again.');
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert(error.response?.data?.message || 'Failed to download receipt. Please try again.');
    } finally {
      setDownloadingInvoice(false);
    }
  };

  const handleAddPackage = () => {
    setPackageForm({
      description: '',
      weight: '',
      tracking_number: '',
      carrier: '',
      notes: ''
    });
    setNotificationStatus(null);
    setShowAddPackageModal(true);
  };

  const handleSendNotification = async () => {
    if (!packageForm.description) {
      alert('Package description is required');
      return;
    }

    try {
      setSendingNotification(true);
      const response = await packagesAPI.sendPackageNotification(
        selectedCustomer.user_id,
        packageForm
      );

      setNotificationStatus({
        success: true,
        message: `Urgent notification sent to ${selectedCustomer.first_name} ${selectedCustomer.last_name}`,
        email: selectedCustomer.email
      });

      // Clear form after successful submission
      setPackageForm({
        description: '',
        weight: '',
        tracking_number: '',
        carrier: '',
        notes: ''
      });

    } catch (error) {
      console.error('Error sending notification:', error);
      setNotificationStatus({
        success: false,
        message: error.response?.data?.message || 'Failed to send notification'
      });
    } finally {
      setSendingNotification(false);
      setShowAddPackageModal(false);
    }
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

  return (
    <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-8">
      {/* Mobile-Responsive Customer List */}
      <div className="lg:col-span-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Customers</h3>
          <div className="flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customers..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
            />
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No customers found</p>
            </div>
          ) : (
            filteredCustomers.map(customer => (
              <div 
                key={customer.user_id} 
                className={`p-4 border-b cursor-pointer transition-all duration-200 ${
                  selectedCustomer?.user_id === customer.user_id 
                    ? 'bg-blue-50 border-l-4 border-l-blue-500' 
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => handleCustomerSelect(customer)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-800">{customer.first_name} {customer.last_name}</h4>
                    <p className="text-sm text-gray-600">{customer.email}</p>
                    <p className="text-xs text-gray-500 mt-1">{customer.branch} branch</p>
                  </div>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {customer.prealert_count} pre-alert(s)
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Customer Details */}
      <div className="lg:col-span-2">
        {selectedCustomer ? (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                {selectedCustomer.first_name} {selectedCustomer.last_name}
              </h3>
              <button 
                onClick={handleAddPackage}
                className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded transition-all duration-300 cursor-pointer"
              >
                Send Package Notification
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="text-sm font-medium text-gray-600 mb-1">Contact Information</h4>
                <p className="text-gray-800">{selectedCustomer.email}</p>
                {selectedCustomer.phone && <p className="text-gray-800 mt-1">{selectedCustomer.phone}</p>}
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="text-sm font-medium text-gray-600 mb-1">Branch</h4>
                <p className="text-gray-800">{selectedCustomer.branch}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 md:col-span-2">
                <h4 className="text-sm font-medium text-gray-600 mb-1">Address</h4>
                <p className="text-gray-800">{selectedCustomer.address}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="text-sm font-medium text-gray-600 mb-1">Customer Since</h4>
                <p className="text-gray-800">{formatDate(selectedCustomer.created_at)}</p>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="text-sm font-medium text-gray-600 mb-1">Verification Status</h4>
                <p className="text-gray-800">
                  {selectedCustomer.is_verified ? 'Verified' : 'Not Verified'}
                </p>
              </div>
            </div>

            <h4 className="text-lg font-semibold text-gray-800 mb-4">Pre-Alerts</h4>
            
            {customerPreAlerts.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600">No pre-alerts found for this customer</p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left">Description</th>
                          <th className="px-4 py-2 text-left">Price</th>
                          <th className="px-4 py-2 text-left">Status</th>
                          <th className="px-4 py-2 text-left">Receipt</th>
                          <th className="px-4 py-2 text-left">Created</th>
                          <th className="px-4 py-2 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customerPreAlerts.map(alert => (
                          <tr
                            key={alert.prealert_id}
                            className={`border-b cursor-pointer ${selectedPreAlert?.prealert_id === alert.prealert_id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
                            onClick={() => handleInternalPreAlertSelect(alert)}
                          >
                            <td className="px-4 py-3">{alert.description}</td>
                            <td className="px-4 py-3">${alert.price}</td>
                            <td className="px-4 py-3">{getStatusBadge(alert.status)}</td>
                            <td className="px-4 py-3">
                              {alert.invoice_url ? (
                                <span className="text-green-600 text-sm flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  Yes
                                </span>
                              ) : (
                                <span className="text-gray-400 text-sm flex items-center">
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  No
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">{formatDate(alert.created_at)}</td>
                            <td className="px-4 py-3">
                              {alert.status === 'U' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleInternalConfirmPreAlert(alert);
                                  }}
                                  className="bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1 rounded transition-all duration-300 mr-2"
                                >
                                  Confirm
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleInternalPreAlertSelect(alert);
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1 rounded transition-all duration-300"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden space-y-4">
                  {customerPreAlerts.map(alert => (
                    <div
                      key={alert.prealert_id}
                      className={`bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer ${
                        selectedPreAlert?.prealert_id === alert.prealert_id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => handleInternalPreAlertSelect(alert)}
                    >
                      {/* Header with status */}
                      <div className="flex flex-col xs:flex-row xs:items-start xs:justify-between gap-2 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-orange-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <h4 className="text-sm font-semibold text-gray-900">Pre-Alert #{alert.prealert_id}</h4>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          {getStatusBadge(alert.status)}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mb-3">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {alert.description}
                        </p>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-xs text-gray-500 font-medium">Price</p>
                          <p className="text-sm font-semibold text-green-600">${alert.price}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-2">
                          <p className="text-xs text-gray-500 font-medium">Created</p>
                          <p className="text-xs font-medium text-gray-700">{formatDate(alert.created_at)}</p>
                        </div>
                      </div>

                      {/* Receipt Status */}
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-600">Receipt:</span>
                        {alert.invoice_url ? (
                          <span className="text-green-600 text-sm flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Available
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">Not uploaded</span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2 border-t border-gray-100">
                        {alert.status === 'U' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInternalConfirmPreAlert(alert);
                            }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Confirm
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleInternalPreAlertSelect(alert);
                          }}
                          className={`${alert.status === 'U' ? 'flex-1' : 'w-full'} bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2`}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-gray-600">Select a customer to view details</p>
          </div>
        )}
      </div>

      {/* PreAlert Details Modal */}
      {showPreAlertModal && selectedPreAlert && (
        <PreAlertDetailsModal
          preAlert={selectedPreAlert}
          onClose={() => setShowPreAlertModal(false)}
          onDownloadInvoice={handleDownloadInvoice}
          downloadingInvoice={downloadingInvoice}
          getStatusBadge={getStatusBadge}
          formatDate={formatDate}
          formatDateTime={formatDateTime}
        />
      )}

      {/* Add Package Notification Modal */}
      {showAddPackageModal && (
        <AddPackageModal
          customer={selectedCustomer}
          formData={packageForm}
          onFormChange={(field, value) => setPackageForm(prev => ({ ...prev, [field]: value }))}
          onSend={handleSendNotification}
          onClose={() => setShowAddPackageModal(false)}
          loading={sendingNotification}
          status={notificationStatus}
        />
      )}
    </div>
  );
}

// PreAlert Details Modal Component
function PreAlertDetailsModal({ preAlert, onClose, onDownloadInvoice, downloadingInvoice, getStatusBadge, formatDate, formatDateTime }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ touchAction: 'pan-y' }}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 p-6 border-b">
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

        <div className="p-6 space-y-6">
          {/* PreAlert Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Basic Information</h3>
              <p className="font-semibold">Pre-Alert ID: {preAlert.prealert_id}</p>
              <div className="mt-2">
                {getStatusBadge(preAlert.status)}
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-sm font-medium text-gray-600 mb-2">Financial Information</h3>
              <p className="font-semibold">Price: ${preAlert.price}</p>
              {preAlert.cost && <p className="text-sm">Cost: ${preAlert.cost}</p>}
            </div>
          </div>

          {/* Package Details */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Package Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500">Description</p>
                <p className="font-medium">{preAlert.description}</p>
              </div>
              {preAlert.weight && (
                <div>
                  <p className="text-xs text-gray-500">Weight</p>
                  <p className="font-medium">{preAlert.weight} kg</p>
                </div>
              )}
              {preAlert.dimensions && (
                <div>
                  <p className="text-xs text-gray-500">Dimensions</p>
                  <p className="font-medium">{preAlert.dimensions}</p>
                </div>
              )}
              {preAlert.quantity && (
                <div>
                  <p className="text-xs text-gray-500">Quantity</p>
                  <p className="font-medium">{preAlert.quantity}</p>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-600 mb-3">Timeline</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500">Created</p>
                <p className="font-medium">{formatDateTime(preAlert.created_at)}</p>
              </div>
              {preAlert.updated_at && (
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="font-medium">{formatDateTime(preAlert.updated_at)}</p>
                </div>
              )}
              {preAlert.expected_arrival && (
                <div>
                  <p className="text-xs text-gray-500">Expected Arrival</p>
                  <p className="font-medium">{formatDate(preAlert.expected_arrival)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Information */}
          {(preAlert.notes || preAlert.special_instructions) && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-3">Additional Information</h3>
              {preAlert.notes && (
                <div className="mb-3">
                  <p className="text-xs text-gray-500">Notes</p>
                  <p className="font-medium">{preAlert.notes}</p>
                </div>
              )}
              {preAlert.special_instructions && (
                <div>
                  <p className="text-xs text-gray-500">Special Instructions</p>
                  <p className="font-medium">{preAlert.special_instructions}</p>
                </div>
              )}
            </div>
          )}

          {/* Receipt Section */}
          {preAlert.invoice_url && (
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <h3 className="text-sm font-medium text-green-600 mb-3">Receipt</h3>
              <p className="text-sm text-gray-600 mb-3">
                Download the receipt for this pre-alert. The receipt contains the customer's purchase information and documentation.
              </p>
              <button
                onClick={() => onDownloadInvoice(preAlert.prealert_id)}
                disabled={downloadingInvoice}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-2 rounded transition-all duration-300 disabled:opacity-50"
              >
                {downloadingInvoice ? 'Loading...' : 'Download Receipt'}
              </button>
            </div>
          )}

          {!preAlert.invoice_url && (
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
              <h3 className="text-sm font-medium text-yellow-600 mb-3">Receipt</h3>
              <p className="text-sm text-gray-600">
                No receipt has been uploaded for this pre-alert.
              </p>
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

// Add Package Notification Modal Component
function AddPackageModal({ customer, formData, onFormChange, onSend, onClose, loading, status }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{ touchAction: 'pan-y' }}>
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            🚨 Send Urgent Package Notification
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

        <div className="p-6 space-y-6">
          {/* Customer Information */}
          <div className="bg-red-50 p-4 rounded-lg border border-red-100">
            <h3 className="text-sm font-medium text-red-600 mb-2">Customer</h3>
            <p className="font-semibold">{customer.first_name} {customer.last_name}</p>
            <p className="text-sm">{customer.email}</p>
            {customer.phone && <p className="text-sm">{customer.phone}</p>}
          </div>

          {/* Status Message */}
          {status && (
            <div className={`p-4 rounded-lg border ${
              status.success 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <p className="font-semibold">{status.message}</p>
              {status.email && <p className="text-sm mt-1">Sent to: {status.email}</p>}
            </div>
          )}

          {/* Package Details Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Package Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => onFormChange('description', e.target.value)}
                placeholder="Describe the package contents (e.g., 'Black laptop bag with electronics')"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Weight* (lb)
                </label>
                <input
                  required
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={(e) => onFormChange('weight', e.target.value)}
                  placeholder="e.g., 2.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Carrier's Tracking Number*
                </label>
                <input
                  required
                  type="text"
                  value={formData.tracking_number}
                  onChange={(e) => onFormChange('tracking_number', e.target.value)}
                  placeholder="e.g., 1Z1234567890123456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Carrier/Shipping Company*
              </label>
              <input
                required
                type="text"
                value={formData.carrier}
                onChange={(e) => onFormChange('carrier', e.target.value)}
                placeholder="e.g., FedEx, UPS, DHL"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => onFormChange('notes', e.target.value)}
                placeholder="Any additional information about the package..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                rows={2}
              />
            </div>
          </div>

          {/* Warning Message */}
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="text-sm font-medium text-yellow-800 mb-2">⚠️ Important Notice</h3>
            <p className="text-sm text-yellow-700">
              This will send an URGENT email notification to the customer. The package will NOT be created in the system until the customer submits a pre-alert with the required documentation.
            </p>
          </div>
        </div>

        <div className="flex justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-300"
          >
            Cancel
          </button>
          <button
            onClick={onSend}
            disabled={loading || !formData.description}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : '🚨 Send Urgent Notification'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CustomerTab;