import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);

    // Listen for storage changes (when API interceptor clears localStorage)
    const handleStorageChange = (e) => {
      if (e.key === 'token' || e.key === 'user') {
        const currentToken = localStorage.getItem('token');
        const currentUser = localStorage.getItem('user');

        if (!currentToken || !currentUser) {
          localStorage.removeItem('loginTime');
          setUser(null);
          setError('');
          console.log('User session cleared due to storage change');
        }
      }
    };

    // Listen for localStorage changes from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Custom event for same-tab localStorage changes
    const handleCustomStorageChange = () => {
      const currentToken = localStorage.getItem('token');
      const currentUser = localStorage.getItem('user');

      if (!currentToken || !currentUser) {
        localStorage.removeItem('loginTime');
        setUser(null);
        setError('');
        console.log('User session cleared due to custom storage event');
      }
    };

    window.addEventListener('localStorageChanged', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChanged', handleCustomStorageChange);
    };
  }, []);

  const register = async (userData) => {
    try {
      setError('');
      const response = await authAPI.register({
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || '',
        branch: userData.branch,
        role: 'C' // Default role for customers
      });

      const { user: newUser, token, requires_verification } = response.data;
      
      // Store token and user data even if verification is required
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      
      return { 
        success: true, 
        data: response.data,
        requiresVerification: requires_verification || false
      };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const login = async (credentials) => {
    try {
      setError('');
      const response = await authAPI.login(credentials);
      
      const { user: loggedInUser, token } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      localStorage.setItem('loginTime', Date.now().toString());
      setUser(loggedInUser);

      console.log(`Login successful for ${loggedInUser.role} user: ${loggedInUser.email}`);
      
      return { 
        success: true, 
        user: loggedInUser, // Make sure this includes the role
        data: response.data 
      };
    } catch (error) {
      const errorResponse = error.response?.data;
      const errorMessage = errorResponse?.message || 'Login failed';
      setError(errorMessage);
      
      return { 
        success: false, 
        error: errorMessage,
        requiresVerification: errorResponse?.requires_verification || false,
        email: errorResponse?.email || ''
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('loginTime');
      setUser(null);
      setError('');

      console.log('User logged out successfully');

      // Dispatch custom event to notify other components
      window.dispatchEvent(new Event('localStorageChanged'));
    }
  };

  const validateToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      return false;
    }

    try {
      // Make a lightweight API call to validate token
      const response = await authAPI.validateToken();

      // If the response includes updated user data, sync it
      if (response.data && response.data.user) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const updatedUser = { ...currentUser, ...response.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      }

      console.log('Token validation successful');
      return true;
    } catch (error) {
      console.error('Token validation error:', error.response?.status, error.message);

      // Only clear auth if it's a 401 (unauthorized) error
      if (error.response?.status === 401) {
        console.log('Token validation failed: 401 Unauthorized - clearing auth');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setError('');
        window.dispatchEvent(new Event('localStorageChanged'));
        return false;
      }

      // For all other errors, assume token is still valid
      // The API interceptor will handle actual authentication failures
      console.warn('Token validation non-401 error - assuming token still valid');
      return true;
    }
  };

  const resendVerification = async (email) => {
    try {
      setError('');
      const response = await authAPI.resendVerification(email);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to resend verification email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const forgotPassword = async (email) => {
    try {
      setError('');
      const response = await authAPI.forgotPassword(email);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to send reset email';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      setError('');
      const response = await authAPI.resetPassword(token, password);
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const updateUser = (updatedUserData) => {
    // Update user state and localStorage
    const updatedUser = { ...user, ...updatedUserData };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    validateToken,
    resendVerification,
    forgotPassword,
    resetPassword,
    updateUser,
    setError,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};