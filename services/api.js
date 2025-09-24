import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Debug logging for environment variables
console.log('🔧 Debug - Environment Variables (v2):');
console.log('  VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('  Final API_BASE_URL:', API_BASE_URL);
console.log('  NODE_ENV:', import.meta.env.MODE);
console.log('  All env vars:', import.meta.env);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.log('API Interceptor: 401 Unauthorized - clearing session');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('loginTime');

      // Dispatch custom event to notify AuthContext of logout
      window.dispatchEvent(new Event('localStorageChanged'));

      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        console.log('API Interceptor: Redirecting to login');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Login and Registration API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  validateToken: () => api.post('/auth/validate-token'),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

//Prealerts API calls
export const preAlertsAPI = {
  // Get all prealerts for current user
  getMyPreAlerts: () => api.get('/prealerts/my-prealerts'),

  // Get prealert by ID
  getPreAlertById: (id) => api.get(`/prealerts/${id}`),

  // Create new prealert (handles both FormData and JSON)
  createPreAlert: (data) => {
    const config = {};
    if (data instanceof FormData) {
      // Let browser set Content-Type for FormData (includes boundary)
      config.headers = { 'Content-Type': undefined };
    }
    return api.post('/prealerts', data, config);
  },

  // Update prealert (handles both FormData and JSON)
  updatePreAlert: (id, data) => {
    const config = {};
    if (data instanceof FormData) {
      // Let browser set Content-Type for FormData (includes boundary)
      config.headers = { 'Content-Type': undefined };
    }
    return api.put(`/prealerts/${id}`, data, config);
  },

  // Delete prealert
  deletePreAlert: (id) => api.delete(`/prealerts/${id}`),

  // Get prealerts by status
  getPreAlertsByStatus: (status) => api.get(`/prealerts/status/${status}`),

  // Get receipt download URL
  getReceiptDownloadUrl: (id) => api.get(`/prealerts/${id}/receipt`),
};


// Packages API calls
export const packagesAPI = {
  // Get all packages for current user
  getMyPackages: () => api.get('/packages/my-packages'),
  
  // Get package by ID
  getPackageById: (id) => api.get(`/packages/${id}`),
  
  // Get package by tracking number
  getPackageByTracking: (trackingNumber) => api.get(`/packages/track/${trackingNumber}`),
  
  // Create new package (admin only)
  createPackage: (data) => api.post('/packages', data),

   // Create package from pre-alert (admin only)
  createPackageFromPreAlert: (prealertId, packageData) => api.post(`/packages/confirm-prealert/${prealertId}`, packageData),
  
  // Update package (admin only)
  updatePackage: (id, data) => api.put(`/packages/${id}`, data),
  
  // Update package status (admin only)
  updatePackageStatus: (id, data) => api.patch(`/packages/${id}/status`, data),
  
  // Delete package (admin only)
  deletePackage: (id) => api.delete(`/packages/${id}`),

  // Get all packages (admin only)
  getAllPackages: () => api.get('/packages'),

  // Notify customer about package arrival
  sendPackageNotification: (customerId, packageData) => 
  api.post(`/packages/notify-customer/${customerId}`, packageData),
};

export const adminAPI = {
  // Get all customers (admin only)
  getAllCustomers: () => api.get('/admin/customers'),

  // Get specific customers with their pre-alerts (admin only)
  getCustomerDetails: (customerId) => api.get(`/admin/customers/${customerId}`),
}

// Transfers API calls
export const transfersAPI = {
  // Get all transfer lists (admin only)
  getAllTransfers: () => api.get('/transfers'),

  // Get transfer by ID
  getTransferById: (id) => api.get(`/transfers/${id}`),

  // Get packages in a transfer
  getTransferPackages: (id) => api.get(`/transfers/${id}/packages`),

  // Create new transfer list
  createTransfer: (data) => api.post('/transfers', data),

  // Update transfer status
  updateTransferStatus: (id, data) => api.patch(`/transfers/${id}/status`, data),

  // Update package checkoff status in transfer
  updatePackageCheckoff: (transferId, packageId, data) => api.patch(`/transfers/${transferId}/packages/${packageId}/checkoff`, data),

  // Delete transfer (admin only)
  deleteTransfer: (id) => api.delete(`/transfers/${id}`),
}


export default api;