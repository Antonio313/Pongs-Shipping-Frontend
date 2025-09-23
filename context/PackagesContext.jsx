import React, { createContext, useContext, useState, useEffect } from 'react';
import { packagesAPI } from '../services/api';
import { useAuth } from './AuthContext';

const PackagesContext = createContext();

export const usePackages = () => {
  const context = useContext(PackagesContext);
  if (!context) {
    throw new Error('usePackages must be used within a PackagesProvider');
  }
  return context;
};

export const PackagesProvider = ({ children }) => {
  const [packages, setPackages] = useState([]);
  const [allPackages, setAllPackages] = useState([]); // For admin view
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Load packages when user changes
  useEffect(() => {
    if (user) {
      if (user.role === 'A') {
        loadAllPackages(); // Admin sees all packages
      } else {
        loadPackages(); // Regular users see only their packages
      }
    } else {
      setPackages([]);
      setAllPackages([]);
    }
  }, [user]);

  const loadPackages = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await packagesAPI.getMyPackages();
      setPackages(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load packages';
      setError(errorMessage);
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllPackages = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await packagesAPI.getAllPackages();
      setAllPackages(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load all packages';
      setError(errorMessage);
      console.error('Error loading all packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPackageById = async (id) => {
    try {
      setError('');
      const response = await packagesAPI.getPackageById(id);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch package';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const trackPackage = async (trackingNumber) => {
    try {
      setError('');
      const response = await packagesAPI.getPackageByTracking(trackingNumber);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to track package';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updatePackageStatus = async (id, status) => {
    try {
      setError('');
      const response = await packagesAPI.updatePackageStatus(id, status);
      
      // Update the package in state
      setAllPackages(prev => prev.map(pkg => 
        pkg.package_id === id ? { ...pkg, status } : pkg
      ));
      
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update package status';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const confirmPreAlert = async (prealertId, packageData) => {
    try {
      setLoading(true);
      setError('');
      const response = await packagesAPI.confirmPreAlert(prealertId, packageData);
      if (response.success) {
        // Update allPackages state with the new package
        setAllPackages(prev => [response.data.package, ...prev]);
        return { success: true, data: response.data };
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to confirm pre-alert and create package';
      setError(errorMessage);
      console.error('Error confirming pre-alert:', error);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const sendPackageNotification = async (customerId, packageData) => {
    try {
      setLoading(true);
      setError('');
      const response = await packagesAPI.sendPackageNotification(customerId, packageData);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send notification';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const deletePackage = async (id) => {
    try {
      setError('');
      const response = await packagesAPI.deletePackage(id);

      // Remove the package from state
      setAllPackages(prev => prev.filter(pkg => pkg.package_id !== id));
      setPackages(prev => prev.filter(pkg => pkg.package_id !== id));

      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete package';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };
    

  const clearError = () => setError('');

  const value = {
    packages,
    allPackages,
    loading,
    error,
    loadPackages,
    loadAllPackages,
    getPackageById,
    trackPackage,
    updatePackageStatus,
    confirmPreAlert,
    sendPackageNotification,
    deletePackage,
    clearError,
  };
  return (
    <PackagesContext.Provider value={value}>
      {children}
    </PackagesContext.Provider>
  );
};