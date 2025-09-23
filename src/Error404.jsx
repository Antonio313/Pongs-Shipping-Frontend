import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

function Error404() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow flex items-center justify-center bg-gradient-to-b from-blue-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full space-y-8">
          <div className={`bg-white p-8 sm:p-10 rounded-2xl shadow-xl transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            
            {/* Main 404 Content */}
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-32 w-32 text-blue-500 animate-bounce" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold animate-ping">!</div>
                </div>
              </div>
              
              <h1 className="text-6xl sm:text-8xl font-bold text-gray-900 mb-4 animate-pulse">404</h1>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6">Page Not Found</h2>
              <p className="text-lg text-gray-600 mb-10 max-w-md mx-auto">
                Oops! The page you're looking for seems to have been lost in transit. Let us help you get back on track.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link 
                  to="/" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Go Home
                </Link>
                
                <Link 
                  to="/track" 
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  Track Package
                </Link>
              </div>
              
              {/* Search Suggestion */}
              <div className="bg-blue-50 p-6 rounded-xl mb-8 animate-fade-in">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Can't find what you need?</h3>
                <p className="text-gray-600 mb-4">Try one of these helpful links:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link to="/services" className="text-blue-600 hover:text-blue-800 font-medium transition-all duration-300 transform hover:scale-105">
                    Services
                  </Link>
                  <span className="text-gray-400">•</span>
                  <Link to="/contact" className="text-blue-600 hover:text-blue-800 font-medium transition-all duration-300 transform hover:scale-105">
                    Contact Us
                  </Link>
                  <span className="text-gray-400">•</span>
                  <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium transition-all duration-300 transform hover:scale-105">
                    Login
                  </Link>
                  <span className="text-gray-400">•</span>
                  <Link to="/signup" className="text-blue-600 hover:text-blue-800 font-medium transition-all duration-300 transform hover:scale-105">
                    Sign Up
                  </Link>
                </div>
              </div>
              
              {/* Support Contact */}
              <div className="border-t border-gray-200 pt-8">
                <p className="text-gray-600 mb-2">Need further assistance?</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a href="mailto:support@pongsshipping.com" className="text-blue-600 font-semibold hover:text-blue-800 transition-all duration-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    support@pongsshipping.com
                  </a>
                  <span className="hidden sm:inline text-gray-400">•</span>
                  <a href="tel:+18764559770" className="text-blue-600 font-semibold hover:text-blue-800 transition-all duration-300 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    +1 (876) 455-9770
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      
      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default Error404;