import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePackages } from '../context/PackagesContext';
import Header from './Header';
import Footer from './Footer';
import VerificationRequired from './VerificationRequired';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingError, setTrackingError] = useState('');
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('');
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const { login, forgotPassword, error: authError, setError, loading } = useAuth();
  const { trackPackage } = usePackages();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    setError('');
  }, [setError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTrackPackage = async (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setTrackingError('');
      setTrackingResult(null);

      const result = await trackPackage(trackingNumber.trim());

      if (result.success) {
        setTrackingResult(result.data);
        setTrackingNumber('');
      } else {
        setTrackingError(result.error);
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Processing': { class: 'bg-gray-100 text-gray-800', text: 'Processing' },
      'Delivered to Overseas Warehouse': { class: 'bg-blue-100 text-blue-800', text: 'Arrived at Overseas Warehouse' },
      'In Transit to Jamaica': { class: 'bg-indigo-100 text-indigo-800', text: 'In Transit to Jamaica' },
      'Arrived in Jamaica': { class: 'bg-purple-100 text-purple-800', text: 'Arrived in Jamaica' },
      'Arrived at Selected Branch': { class: 'bg-teal-100 text-teal-800', text: 'At Local Branch' },
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    const result = await login(formData);
    
 

    if (result.success) {
      // Redirect based on user role
      const userRole = result.user?.role;
      
      
      switch (userRole) {
        case 'S': // Super Admin
          navigate('/superAdminDashboard', { replace: true });
          break;
        case 'A': // Admin
          navigate('/adminDashboard', { replace: true });
          break;
        case 'C': // Customer
          navigate('/customerDashboard', { replace: true });
          break;
        default:
          // Default to customer dashboard for unknown roles
          navigate('/customerDashboard', { replace: true });
      }
    } else if (result.requiresVerification) {
      setVerificationRequired(true);
      setVerificationEmail(result.email || formData.email);
    }
    
    setIsSubmitting(false);
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(forgotPasswordEmail)) {
      setForgotPasswordError('Please enter a valid email address');
      return;
    }

    setForgotPasswordLoading(true);
    setForgotPasswordError('');
    setForgotPasswordMessage('');

    const result = await forgotPassword(forgotPasswordEmail);

    if (result.success) {
      setForgotPasswordMessage('If an account with this email exists, you will receive a password reset link shortly.');
      setForgotPasswordEmail('');
    } else {
      setForgotPasswordError(result.error);
    }

    setForgotPasswordLoading(false);
  };

  const closeForgotPasswordModal = () => {
    setShowForgotPasswordModal(false);
    setForgotPasswordEmail('');
    setForgotPasswordMessage('');
    setForgotPasswordError('');
  };

  if (verificationRequired) {
    return <VerificationRequired email={verificationEmail} />;
  }

  if (loading) {
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
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Login Form Section */}
            <div className={`w-full lg:w-5/12 bg-white rounded-xl shadow-lg p-8 transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h2 className="text-3xl font-bold text-gray-800 mb-2 animate-fade-in">Welcome Back</h2>
              <p className="text-gray-600 mb-8 animate-fade-in delay-100">Sign in to access your account and manage your shipments</p>
              
              {authError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg animate-fade-in">
                  {authError}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="animate-fade-in delay-200">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-md ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                
                <div className="animate-fade-in delay-300">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-md ${
                      errors.password ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your password"
                    required
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>
                
                <div className="flex items-center justify-between animate-fade-in delay-400">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors duration-300"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                      Remember me
                    </label>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setShowForgotPasswordModal(true)}
                    className="text-sm text-blue-600 hover:text-blue-800 transition-all duration-300 transform hover:scale-105"
                  >
                    Forgot password?
                  </button>
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:hover:shadow-none animate-fade-in delay-500"
                >
                  {isSubmitting ? 'Signing In...' : 'Sign In'}
                </button>
              </form>
              
              <div className="mt-6 text-center animate-fade-in delay-600">
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <Link to="/signup" className="text-blue-600 font-semibold hover:text-blue-800 transition-all duration-300 transform hover:scale-105 inline-block">
                    Sign up here
                  </Link>
                </p>
              </div>
            </div>
            
            {/* Services Promotion Section */}
            <div className="w-full lg:w-7/12">
              <h2 className="text-4xl font-bold text-gray-800 mb-6 animate-fade-in">Why Choose Pong's Shipping?</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                <div className="bg-blue-50 p-6 rounded-xl transform transition-all duration-500 hover:-translate-y-1 hover:shadow-lg animate-fade-in delay-100">
                  <div className="text-blue-600 mb-3 transform transition-all duration-300 hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 transform transition-all duration-300 hover:translate-x-1">International Shipping</h3>
                  <p className="text-gray-600">Reliable shipping from the United States to Jamaica with tracking and insurance options.</p>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-xl transform transition-all duration-500 hover:-translate-y-1 hover:shadow-lg animate-fade-in delay-200">
                  <div className="text-blue-600 mb-3 transform transition-all duration-300 hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 transform transition-all duration-300 hover:translate-x-1">Domestic Shipping</h3>
                  <p className="text-gray-600">Shipping packages to anywhere in the United States with fast delivery times.</p>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-xl transform transition-all duration-500 hover:-translate-y-1 hover:shadow-lg animate-fade-in delay-300">
                  <div className="text-blue-600 mb-3 transform transition-all duration-300 hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 transform transition-all duration-300 hover:translate-x-1">Sea Freight</h3>
                  <p className="text-gray-600">Specialized shipping for barrels and large parcels via sea freight at competitive rates.</p>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-xl transform transition-all duration-500 hover:-translate-y-1 hover:shadow-lg animate-fade-in delay-400">
                  <div className="text-blue-600 mb-3 transform transition-all duration-300 hover:scale-110">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 transform transition-all duration-300 hover:translate-x-1">Online Shopping Assistance</h3>
                  <p className="text-gray-600">Shop online using our card service if you don't have a payment method available.</p>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-xl transform transition-all duration-700 hover:-translate-y-1 hover:shadow-xl animate-fade-in delay-500">
                <h3 className="text-2xl font-bold mb-3">Track Your Shipments</h3>
                <p className="mb-4">Enter your tracking number to check your package status.</p>
                <form onSubmit={handleTrackPackage} className="space-y-4">
                  <div className="flex items-center bg-white p-3 rounded-lg transform transition-all duration-300 hover:scale-105">
                    <input
                      type="text"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="Enter tracking number (e.g., TRK123456789)"
                      className="flex-grow px-4 py-2 text-gray-700 focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-all duration-300 transform hover:scale-105"
                    >
                      Track
                    </button>
                  </div>

                  {/* Tracking Results */}
                  {trackingResult && (
                    <div className="bg-white/10 backdrop-blur border border-white/20 rounded-lg p-4 mt-4">
                      <h4 className="text-lg font-semibold mb-3">📦 Package Found</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-blue-100">Tracking Number</p>
                          <p className="font-mono font-semibold">{trackingResult.tracking_number}</p>
                        </div>
                        <div>
                          <p className="text-blue-100">Status</p>
                          <div className="mt-1">{getStatusBadge(trackingResult.status)}</div>
                        </div>
                        <div>
                          <p className="text-blue-100">Description</p>
                          <p className="font-semibold">{trackingResult.description || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-blue-100">Last Updated</p>
                          <p className="font-semibold">{formatDateTime(trackingResult.updated_at)}</p>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/20">
                        <Link
                          to="/login"
                          className="text-blue-200 hover:text-white underline text-sm"
                        >
                          Login to see full tracking history →
                        </Link>
                      </div>
                    </div>
                  )}

                  {trackingError && (
                    <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-3 mt-4">
                      <p className="text-red-100 text-sm">{trackingError}</p>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Forgot Password Modal */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Reset Password</h3>
                <button
                  onClick={closeForgotPasswordModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 mb-6">
                Enter your email address and we'll send you a link to reset your password.
              </p>

              {forgotPasswordMessage && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  {forgotPasswordMessage}
                </div>
              )}

              {forgotPasswordError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  {forgotPasswordError}
                </div>
              )}

              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={closeForgotPasswordModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotPasswordLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 disabled:cursor-not-allowed"
                  >
                    {forgotPasswordLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
      `}</style>
    </div>
  );
}

export default Login;