import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import Header from './Header';
import Footer from './Footer';

function EmailVerification() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false); // Add this ref to prevent duplicate calls

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      
      if (!token) {
        setStatus('error');
        setMessage('Invalid verification link');
        return;
      }

      // Prevent duplicate verification attempts
      if (hasVerified.current) {
        return;
      }

      hasVerified.current = true; // Mark as attempted

      try {
        const response = await authAPI.verifyEmail(token);

        setStatus('success');
        setMessage(response.data.message || 'Email verified successfully! You can now log in.');
        
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } catch (error) {
        console.error('Verification error:', error);
        console.error('Error response:', error.response);
        
        // Check the specific error message
        const errorMessage = error.response?.data?.message || '';
        const errorStatus = error.response?.status;
        
        if (errorStatus === 400 && errorMessage.includes('already verified')) {
          setStatus('success');
          setMessage('Email was already verified! You can now log in.');
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else if (errorStatus === 400 && errorMessage.includes('Invalid or expired')) {
          setStatus('error');
          setMessage('Verification failed. The link may have expired or is invalid.');
        } else {
          setStatus('error');
          setMessage(errorMessage || 'Verification failed. Please try again.');
        }
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg text-center">
          {status === 'verifying' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
              <h2 className="text-2xl font-bold text-gray-900">Verifying Email</h2>
              <p className="text-gray-600">Please wait while we verify your email address...</p>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Email Verified!</h2>
              <p className="text-gray-600">{message}</p>
              <p className="text-sm text-gray-500">Redirecting to login page...</p>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Verification Failed</h2>
              <p className="text-gray-600">{message}</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition-colors duration-200"
              >
                Go to Login
              </button>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default EmailVerification;