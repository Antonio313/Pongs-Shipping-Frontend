import React, { createContext, useContext, useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import { useAuth } from './AuthContext';
import { isStaffRole, hasPermission, PERMISSIONS } from '../utils/rolePermissions';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerPreAlerts, setCustomerPreAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Clear customers when user logs out or changes to non-staff
  useEffect(() => {
    if (!user || !isStaffRole(user.role)) {
      setCustomers([]);
      setSelectedCustomer(null);
      setCustomerPreAlerts([]);
    }
  }, [user]);

  const fetchCustomers = async () => {
    if (!hasPermission(user?.role, PERMISSIONS.VIEW_CUSTOMERS_TAB)) {
      setError('Access denied. Insufficient permissions.');
      return { success: false, error: 'Access denied. Insufficient permissions.' };
    }

    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getAllCustomers();
      setCustomers(response.data.customers);
      return { success: true, data: response.data.customers };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch customers';
      setError(errorMessage);
      console.error('Error fetching customers:', error);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerDetails = async (customerId) => {
    if (!hasPermission(user?.role, PERMISSIONS.VIEW_CUSTOMER_DETAILS)) {
      setError('Access denied. Insufficient permissions.');
      return { success: false, error: 'Access denied. Insufficient permissions.' };
    }

    try {
      setLoading(true);
      setError('');
      const response = await adminAPI.getCustomerDetails(customerId);
      setSelectedCustomer(response.data.customer);
      setCustomerPreAlerts(response.data.preAlerts);
      return { 
        success: true, 
        data: {
          customer: response.data.customer,
          preAlerts: response.data.preAlerts
        }
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch customer details';
      setError(errorMessage);
      console.error('Error fetching customer details:', error);
      
      // Handle 404 specifically
      if (error.response?.status === 404) {
        return { success: false, error: 'Customer not found', notFound: true };
      }
      
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const clearSelectedCustomer = () => {
    setSelectedCustomer(null);
    setCustomerPreAlerts([]);
  };

  const clearError = () => setError('');

  const value = {
    customers,
    selectedCustomer,
    customerPreAlerts,
    loading,
    error,
    fetchCustomers,
    fetchCustomerDetails,
    clearSelectedCustomer,
    clearError,
    setSelectedCustomer,
    setCustomerPreAlerts
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};