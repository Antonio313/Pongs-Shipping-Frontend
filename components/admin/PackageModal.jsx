import { useState } from 'react';
import { packagesAPI } from '../../services/api';

function PackageModal({ preAlert, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    weight: '',
    length: '',
    width: '',
    height: '',
    cost: preAlert.price,
    description: preAlert.description,
    status: 'Processing' // Changed default to match new status
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [createdPackage, setCreatedPackage] = useState(null);
  const [customerData, setCustomerData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.weight || parseFloat(formData.weight) <= 0) newErrors.weight = 'Valid weight is required';
    if (!formData.cost || parseFloat(formData.cost) <= 0) newErrors.cost = 'Valid cost is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare package data for API call
      const packageData = {
        weight: parseFloat(formData.weight),
        length: formData.length ? parseFloat(formData.length) : null,
        width: formData.width ? parseFloat(formData.width) : null,
        height: formData.height ? parseFloat(formData.height) : null,
        cost: parseFloat(formData.cost),
        status: formData.status
      };

      // Call API to create package from pre-alert
      const response = await packagesAPI.createPackageFromPreAlert(preAlert.prealert_id, packageData);

      // Store the created package data and customer data
      setCreatedPackage(response.data.package);
      setCustomerData(response.data.customer);
      setShowSuccessPopup(true);
      
    } catch (error) {
      console.error('Error creating package from pre-alert:', error);
      
      // Set error state
      setErrors({
        submit: error.response?.data?.message || 'Failed to create package. Please try again.'
      });
      
      // Call parent component's onSubmit with error
      onSubmit({
        success: false,
        error: error.response?.data?.message || 'Failed to create package. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field-specific errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleDownloadPDF = async () => {
    if (createdPackage && customerData) {
      try {
        // Lazy load the PDF generator only when needed
        const { generatePackageLabelPDF } = await import('../../utils/pdfGenerator');
        generatePackageLabelPDF(createdPackage, customerData);
      } catch (error) {
        console.error('Error loading PDF generator:', error);
        alert('Failed to generate PDF. Please try again.');
      }
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessPopup(false);

    // Call parent component's onSubmit with success data
    onSubmit({
      success: true,
      package: createdPackage,
      prealert: preAlert,
      message: 'Package created successfully from pre-alert!'
    });

    // Close the main modal
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Create Package from Pre-Alert</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg mb-4">
          <h3 className="font-medium text-blue-800">Pre-Alert Information</h3>
          <p className="text-sm mt-1">{preAlert.description}</p>
          <p className="text-sm">Value: ${preAlert.price}</p>
        </div>

        {/* General error message */}
        {errors.submit && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center mb-2">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <label className="block text-sm font-medium text-blue-800">Tracking Number</label>
            </div>
            <p className="text-sm text-blue-700">
              A unique tracking number will be automatically generated when you create the package.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weight* (lb)</label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.weight ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost* ($)</label>
              <input
                type="number"
                name="cost"
                value={formData.cost}
                onChange={handleChange}
                step="0.01"
                min="0"
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.cost ? 'border-red-300' : 'border-gray-300'
                }`}
                required
              />
              {errors.cost && <p className="text-red-500 text-xs mt-1">{errors.cost}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Length (cm)</label>
              <input
                type="number"
                name="length"
                value={formData.length}
                onChange={handleChange}
                step="0.1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Width (cm)</label>
              <input
                type="number"
                name="width"
                value={formData.width}
                onChange={handleChange}
                step="0.1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
              <input
                type="number"
                name="height"
                value={formData.height}
                onChange={handleChange}
                step="0.1"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status*</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="Processing">Processing</option>
              <option value="Delivered to Overseas Warehouse">Delivered to Overseas Warehouse</option>
              <option value="In Transit to Jamaica">In Transit to Jamaica</option>
              <option value="Arrived in Jamaica">Arrived in Jamaica</option>
              <option value="Arrived at Selected Branch">Arrived at Selected Branch</option>
              <option value="Ready For Pickup">Ready For Pickup</option>
              <option value="Out for Delivery">Out for Delivery</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-300"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </span>
              ) : (
                'Create Package'
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Success Popup */}
      {showSuccessPopup && createdPackage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-60 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all duration-300">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Package Created Successfully!
              </h3>

              <p className="text-sm text-gray-600 mb-4">
                Your package has been created from the pre-alert.
              </p>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                <h4 className="text-sm font-medium text-blue-800 mb-2">Generated Tracking Number</h4>
                <div className="flex items-center justify-center">
                  <span className="font-mono text-lg font-bold text-blue-600 bg-white px-3 py-2 rounded border">
                    {createdPackage.tracking_number}
                  </span>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  This tracking number has been automatically generated by the system.
                </p>
              </div>

              <div className="text-sm text-gray-600 mb-6">
                <p><strong>Package ID:</strong> {createdPackage.package_id}</p>
                <p><strong>Status:</strong> {createdPackage.status}</p>
                {customerData && (
                  <p><strong>Customer:</strong> {customerData.first_name} {customerData.last_name}</p>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleDownloadPDF}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  Download Package Label (PDF)
                </button>

                <button
                  onClick={handleSuccessClose}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PackageModal;