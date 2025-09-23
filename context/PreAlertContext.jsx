import React, { createContext, useContext, useState, useEffect } from 'react';
import { preAlertsAPI } from '../services/api';
import { useAuth } from './AuthContext';

const PreAlertContext = createContext();

export const usePreAlert = () => {
  const context = useContext(PreAlertContext);
  if (!context) {
    throw new Error('usePreAlert must be used within a PreAlertProvider');
  }
  return context;
};

export const PreAlertProvider = ({ children }) => {
  const [preAlerts, setPreAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  // Load prealerts when user changes
  useEffect(() => {
    if (user) {
      loadPreAlerts();
    } else {
      setPreAlerts([]);
    }
  }, [user]);

  const loadPreAlerts = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await preAlertsAPI.getMyPreAlerts();
      setPreAlerts(response.data);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to load prealerts';
      setError(errorMessage);
      console.error('Error loading prealerts:', error);
    } finally {
      setLoading(false);
    }
  };

    const createPreAlert = async (preAlertData) => {
    try {
        setError('');
        console.log('Creating prealert with data:', preAlertData); // Debug log
        
        const response = await preAlertsAPI.createPreAlert(preAlertData);
        const newPreAlert = response.data.prealert;
        
        setPreAlerts(prev => [newPreAlert, ...prev]);
        
        return { 
        success: true, 
        data: newPreAlert,
        message: response.data.message || 'PreAlert created successfully'
        };
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to create prealert';
        console.error('Error creating prealert:', error.response?.data); // More detailed error
        setError(errorMessage);
        return { success: false, error: errorMessage };
    }
    };

  const updatePreAlert = async (id, preAlertData) => {
    try {
      setError('');
      const response = await preAlertsAPI.updatePreAlert(id, preAlertData);
      const updatedPreAlert = response.data.prealert;
      
      setPreAlerts(prev => 
        prev.map(alert => 
          alert.prealert_id === id ? updatedPreAlert : alert
        )
      );
      
      return { 
        success: true, 
        data: updatedPreAlert,
        message: response.data.message || 'PreAlert updated successfully'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update prealert';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const deletePreAlert = async (id) => {
    try {
      setError('');
      await preAlertsAPI.deletePreAlert(id);
      
      setPreAlerts(prev => prev.filter(alert => alert.prealert_id !== id));
      
      return { 
        success: true, 
        message: 'PreAlert deleted successfully'
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete prealert';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const getPreAlertById = async (id) => {
    try {
      setError('');
      const response = await preAlertsAPI.getPreAlertById(id);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch prealert';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const clearError = () => setError('');

  const value = {
    preAlerts,
    loading,
    error,
    createPreAlert,
    updatePreAlert,
    deletePreAlert,
    getPreAlertById,
    loadPreAlerts,
    clearError,
  };

  return (
    <PreAlertContext.Provider value={value}>
      {children}
    </PreAlertContext.Provider>
  );
};