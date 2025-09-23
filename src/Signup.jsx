import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePackages } from '../context/PackagesContext';
import Header from './Header';
import Footer from './Footer';
import VerificationRequired from './VerificationRequired';

function Signup() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    branch: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingError, setTrackingError] = useState('');

  const { register, error: authError, setError } = useAuth();
  const { trackPackage } = usePackages();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
    // Clear any previous errors
    setError('');
  }, [setError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.branch) {
      newErrors.branch = 'Please select a branch';
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
    
    const result = await register(formData);
    
    if (result.success) {
      if (result.requiresVerification) {
        // Show verification required screen instead of redirecting
        setVerificationRequired(true);
      } else {
        // Redirect to dashboard if no verification needed
        navigate('/customerDashboard', { replace: true });
      }
    }
    
    setIsSubmitting(false);
  };

  // Show verification screen if required
  if (verificationRequired) {
    return <VerificationRequired email={formData.email} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        <div className="container mx-auto px-6 py-12">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            
            {/* Signup Form Section */}
            <div className={`w-full lg:w-5/12 bg-white rounded-xl shadow-lg p-8 transform transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h2 className="text-3xl font-bold text-gray-800 mb-2 animate-fade-in">Create Account</h2>
              <p className="text-gray-600 mb-8 animate-fade-in delay-100">Sign up to access your account and manage your shipments</p>
              
              {/* Display auth error */}
              {authError && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg animate-fade-in">
                  {authError}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="animate-fade-in delay-200">
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-md ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your first name"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
                    )}
                  </div>
                  
                  <div className="animate-fade-in delay-200">
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-md ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your last name"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                    )}
                  </div>
                </div>
                
                <div className="animate-fade-in delay-300">
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
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
                
                <div className="animate-fade-in delay-300">
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number (Optional)
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-md"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="animate-fade-in delay-400">
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
                      placeholder="Create password"
                    />
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>
                  
                  <div className="animate-fade-in delay-400">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-md ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirm password"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>
                
                <div className="animate-fade-in delay-500">
                  <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Branch for Pickup
                  </label>
                  <select
                    id="branch"
                    name="branch"
                    value={formData.branch}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:shadow-md ${
                      errors.branch ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select a branch</option>
                    <option value="Priory">Priory Branch</option>
                    <option value="Ocho Rios">Ocho Rios Branch</option>
                  </select>
                  {errors.branch && (
                    <p className="mt-1 text-sm text-red-600">{errors.branch}</p>
                  )}
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg disabled:transform-none disabled:hover:shadow-none animate-fade-in delay-600"
                >
                  {isSubmitting ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>
              
              <div className="mt-6 text-center animate-fade-in delay-700">
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-800 transition-all duration-300 transform hover:scale-105 inline-block">
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
            
            {/* Services Promotion Section (unchanged) */}
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
                          to="/signup"
                          className="text-blue-200 hover:text-white underline text-sm"
                        >
                          Sign up to see full tracking history →
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
      
      {/* Add custom animation styles */}
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
        .delay-700 { animation-delay: 0.7s; }
      `}</style>
    </div>
  );
}

export default Signup;