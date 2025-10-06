import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePackages } from '../context/PackagesContext';
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

// Interactive Location Showcase Component
// This component provides a beautiful visual experience for showcasing shipping locations
// without requiring external API dependencies. Features include:
// - Animated location details with smooth transitions
// - Interactive visual elements and illustrations
// - Enhanced contact information display
// - Responsive design with engaging animations
function LocationShowcaseComponent({ selectedLocation, locations }) {
  const [isAnimating, setIsAnimating] = useState(false);
  const currentLocation = locations[selectedLocation];

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 600);
    return () => clearTimeout(timer);
  }, [selectedLocation]);

  return (
    <div className="w-full h-full relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-4 -left-4 w-32 h-32 rounded-full bg-gradient-to-r from-blue-400/20 to-purple-400/20 animate-float"></div>
        <div className="absolute top-1/4 right-12 w-24 h-24 rounded-full bg-gradient-to-r from-orange-400/20 to-yellow-400/20 animate-float animation-delay-1000"></div>
        <div className="absolute bottom-20 left-20 w-28 h-28 rounded-full bg-gradient-to-r from-green-400/20 to-blue-400/20 animate-float animation-delay-2000"></div>

        {/* Shipping Icons */}
        <div className="absolute top-16 right-16 text-blue-200/40 animate-float animation-delay-1500">
          <svg className="w-20 h-20" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
        </div>
        <div className="absolute bottom-24 right-24 text-purple-200/40 animate-float animation-delay-2500">
          <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className={`relative z-10 h-full flex flex-col justify-start sm:justify-center p-4 sm:p-6 lg:p-8 transition-all duration-600 overflow-y-auto ${isAnimating ? 'opacity-0 transform translate-y-4' : 'opacity-100 transform translate-y-0'}`}>

        {/* Location Header */}
        <div className="text-center mb-4 sm:mb-6 lg:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mb-3 sm:mb-4 lg:mb-6 shadow-2xl transform hover:scale-110 transition-transform duration-300">
            <svg className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 mb-1 sm:mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text px-2">
            {currentLocation.name}
          </h3>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 mb-2 sm:mb-3 lg:mb-4 px-2">{currentLocation.address}</p>
          <div className="inline-block bg-blue-100 text-blue-800 px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-full text-xs sm:text-sm font-semibold">
            {currentLocation.type}
          </div>
        </div>

        {/* Location Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 max-w-2xl mx-auto w-full">

          {/* Contact Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-white/20 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center mb-2 sm:mb-3 lg:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-gray-800 text-sm sm:text-base">Phone</h4>
                <p className="text-green-600 font-semibold text-sm sm:text-base truncate">{currentLocation.phone}</p>
              </div>
            </div>
            <a
              href={`tel:${currentLocation.phone}`}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 block text-center text-sm sm:text-base"
            >
              Call Now
            </a>
          </div>

          {/* Operating Hours */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 sm:p-4 lg:p-6 shadow-lg border border-white/20 transform hover:scale-105 transition-all duration-300">
            <div className="flex items-center mb-2 sm:mb-3 lg:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-gray-800 text-sm sm:text-base">Operating Hours</h4>
                <p className="text-blue-600 font-semibold text-xs sm:text-sm">{currentLocation.hours}</p>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-2 sm:p-3">
              <p className="text-xs sm:text-sm text-blue-700 text-center font-medium">
                {currentLocation.name === "Plantation Village" ? "🏢 Main Processing Center" : "📦 Pickup & Service Center"}
              </p>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 justify-center mt-4 sm:mt-6 lg:mt-8 max-w-lg mx-auto w-full px-2">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(currentLocation.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span className="whitespace-nowrap">Get Directions</span>
          </a>
          <a
            href={`mailto:shippingpongs@gmail.com?subject=Inquiry about ${currentLocation.name}`}
            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center text-sm sm:text-base"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="whitespace-nowrap">Contact Us</span>
          </a>
        </div>

        {/* Status Indicator */}
        <div className="text-center mt-3 sm:mt-4 lg:mt-6 pb-2">
          <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-medium">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            <span className="whitespace-nowrap">Currently Open & Accepting Packages</span>
          </div>
        </div>

      </div>
    </div>
  );
}

function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('priory');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState(null);
  const [trackingError, setTrackingError] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const { trackPackage } = usePackages();

  useEffect(() => {
    setIsVisible(true);

    // Auto-cycle through instruction steps
    const interval = setInterval(() => {
      setActiveStep(prev => (prev + 1) % 5);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Shipping rates data
  const shippingRates = [
    { pounds: 1, rate: 700 },
    { pounds: 2, rate: 1350 },
    { pounds: 3, rate: 2000 },
    { pounds: 4, rate: 2650 },
    { pounds: 5, rate: 3300 },
    { pounds: 6, rate: 3950 },
    { pounds: 7, rate: 4600 },
    { pounds: 8, rate: 5250 },
    { pounds: 9, rate: 5900 },
    { pounds: 10, rate: 6550 },
    { pounds: 11, rate: 7200 },
    { pounds: 12, rate: 7850 },
    { pounds: 13, rate: 8500 },
    { pounds: 14, rate: 9150 },
    { pounds: 15, rate: 9800 },
  ];

  // Location data for interactive map
  const locations = {
    priory: {
      name: "Plantation Village",
      address: "Lot 6 Plantation Village, Priory, St. Ann",
      type: "Main Office & Processing Center",
      coordinates: { lat: 18.4207, lng: -77.2466 },
      phone: "(876) 455-9770",
      hours: "Mon-Fri: 8AM-5PM, Sat: 9AM-2PM"
    },
    ochoRios: {
      name: "Jack Ruby Plaza",
      address: "James Avenue, Ocho Rios, St. Ann",
      type: "Pickup Location & Customer Service",
      coordinates: { lat: 18.4069, lng: -77.1037 },
      phone: "(876) 455-9770",
      hours: "Mon-Fri: 8AM-5PM, Sat: 9AM-2PM"
    }
  };

  // Tracking functionality
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

  return (
    <div className="home overflow-x-hidden">
      <Header />

      {/* Enhanced Hero Section with Background Image */}
      <section className="relative min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white py-12 md:py-24 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 mobile-bg-hero"
          style={{
            backgroundImage: 'url(/frontpage.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            backgroundRepeat: 'no-repeat',
            filter: 'brightness(0.8)',
            transform: 'scale(1.05)'
          }}
          role="img"
          aria-label="Pong's Shipping Company - Your Bridge to Jamaica"
        >
          {/* Mobile-optimized overlay gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/30 md:from-black/70 md:via-black/30 md:to-black/20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 via-blue-900/20 to-blue-900/60 md:from-blue-900/40 md:via-transparent md:to-blue-900/40"></div>
        </div>

        {/* Enhanced animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-4 -left-4 w-32 h-32 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 opacity-10 animate-float"></div>
          <div className="absolute top-1/4 right-12 w-24 h-24 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 opacity-10 animate-float animation-delay-1000"></div>
          <div className="absolute bottom-20 left-20 w-28 h-28 rounded-full bg-gradient-to-r from-green-400 to-blue-400 opacity-10 animate-float animation-delay-2000"></div>
          <div className="absolute top-1/2 right-1/4 w-16 h-16 rounded-full bg-gradient-to-r from-pink-400 to-red-400 opacity-10 animate-float animation-delay-3000"></div>

          {/* Floating shipping icons with reduced opacity */}
          <div className="absolute top-20 right-20 text-white/5 animate-float animation-delay-1500">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 8h-3V4H3c-1.1 0-2 .9-2 2v11h2c0 1.66 1.34 3 3 3s3-1.34 3-3h6c0 1.66 1.34 3 3 3s3-1.34 3-3h2v-5l-3-4zM6 18.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm13.5-9l1.96 2.5H17V9.5h2.5zm-1.5 9c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
            </svg>
          </div>
          <div className="absolute bottom-32 right-32 text-white/5 animate-float animation-delay-2500">
            <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-6 relative z-10 flex items-center min-h-screen">
          <div className="max-w-6xl mx-auto w-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Content Side */}
              <div className="text-center lg:text-left pt-16 md:pt-8 lg:pt-0">
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 md:mb-6 transform transition-all duration-1000 animate-fade-in-down bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent drop-shadow-lg leading-tight">
                  Pong's Shipping Company
                </h1>
                <p className="text-lg sm:text-xl md:text-2xl mb-6 md:mb-8 transform transition-all duration-1000 delay-200 animate-fade-in-up text-blue-100 max-w-3xl mx-auto lg:mx-0 leading-relaxed drop-shadow-md px-2 lg:px-0">
                  Your trusted bridge between the United States and Jamaica. Fast, reliable, and affordable shipping solutions for all your needs.
                </p>

                {/* Enhanced CTA buttons */}
                <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4 md:gap-6 mb-8 md:mb-12 px-4 sm:px-0">
                  <Link
                    to="/signup"
                    className="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-full text-base md:text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl animate-fade-in delay-500"
                  >
                    <span className="relative z-10">Get Started Today</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-600 to-orange-700 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </Link>
                  <a
                    href="#tracking"
                    className="group bg-white/10 hover:bg-white/20 text-white font-bold py-3 md:py-4 px-6 md:px-8 rounded-full text-base md:text-lg border-2 border-white/50 hover:border-white transition-all duration-300 transform hover:scale-105 animate-fade-in delay-700 backdrop-blur-sm"
                  >
                    <span className="flex items-center justify-center">
                      <svg className="w-4 md:w-5 h-4 md:h-5 mr-2 group-hover:animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Track Package
                    </span>
                  </a>
                </div>

                {/* Stats section */}
                <div className="grid grid-cols-3 gap-3 md:gap-6 mt-8 md:mt-16 animate-fade-in delay-1000 px-2">
                  <div className="text-center transform hover:scale-105 transition-all duration-300">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-green-400 mb-1 md:mb-2 drop-shadow-md">5-7</div>
                    <div className="text-xs sm:text-sm md:text-base text-blue-200">Days Delivery</div>
                  </div>
                  <div className="text-center transform hover:scale-105 transition-all duration-300">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-yellow-400 mb-1 md:mb-2 drop-shadow-md">2</div>
                    <div className="text-xs sm:text-sm md:text-base text-blue-200">Convenient Locations</div>
                  </div>
                  <div className="text-center transform hover:scale-105 transition-all duration-300">
                    <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-purple-400 mb-1 md:mb-2 drop-shadow-md">24/7</div>
                    <div className="text-xs sm:text-sm md:text-base text-blue-200">Package Tracking</div>
                  </div>
                </div>
              </div>

              {/* Image highlight area - subtle enhancement */}
              <div className="hidden lg:block relative">
                <div className="absolute inset-0 bg-white/5 rounded-3xl backdrop-blur-sm border border-white/10 transform rotate-3 scale-105"></div>
                <div className="relative bg-white/10 rounded-2xl p-8 backdrop-blur-sm border border-white/20">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-500/20 rounded-full mb-6">
                      <svg className="w-10 h-10 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold mb-4">From US to Your Door</h3>
                    <p className="text-blue-200 mb-6">Professional delivery service connecting American retailers to Jamaican families, one package at a time.</p>
                    <div className="flex items-center justify-center space-x-4 text-sm text-blue-300">
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Secure
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Tracked
                      </span>
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Reliable
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Package Tracking Section */}
      <section id="tracking" className="py-20 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-50" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 animate-fade-in">
              Track Your Package
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in delay-200">
              Enter your tracking number below to get real-time updates on your package location and delivery status.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl p-8 transform hover:scale-[1.02] transition-all duration-300 animate-fade-in-up delay-400">
              <form onSubmit={handleTrackPackage} className="space-y-6">
                <div className="relative">
                  <input
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Enter tracking number (e.g., TRK123456789)"
                    className="w-full px-6 py-4 text-lg border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 pr-16"
                  />
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Track Package</span>
                </button>
              </form>

              {/* Enhanced Tracking Results */}
              {trackingResult && (
                <div className="mt-8 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-6 animate-fade-in">
                  <h3 className="text-xl font-bold text-green-800 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Package Found!
                  </h3>

                  <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Tracking Number</p>
                        <p className="font-mono text-lg font-bold text-blue-600">{trackingResult.tracking_number}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Current Status</p>
                        <div className="mt-1">{getStatusBadge(trackingResult.status)}</div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Package Description</p>
                        <p className="font-semibold text-gray-800">{trackingResult.description || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Updated</p>
                        <p className="font-semibold text-gray-800">{formatDateTime(trackingResult.updated_at)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-center">
                    <Link
                      to="/login"
                      className="text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      Login to see full tracking history →
                    </Link>
                  </div>
                </div>
              )}

              {trackingError && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
                  <p className="text-red-800 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {trackingError}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-indigo-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
              How Our Shipping Works
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto animate-fade-in delay-200">
              Simple, reliable, and transparent. Follow these easy steps to ship your packages from the US to Jamaica.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* Interactive Steps */}
              <div className="space-y-6">
                {[
                  {
                    icon: "👤",
                    title: "Create Your Account",
                    description: "Sign up for a free account and get access to our shipping portal. Choose your preferred pickup location.",
                    highlight: "Quick & Free Registration"
                  },
                  {
                    icon: "📋",
                    title: "Submit Pre-Alert",
                    description: "Navigate to the pre-alerts section and create a detailed pre-alert for your items. Upload your receipt - this is crucial for customs clearance!",
                    highlight: "⚠️ Receipt Required!"
                  },
                  {
                    icon: "✅",
                    title: "We Confirm & Process",
                    description: "Our team reviews your pre-alert, confirms the details, and starts processing your package for shipping.",
                    highlight: "Expert Processing"
                  },
                  {
                    icon: "🚚",
                    title: "Track Your Package",
                    description: "Get real-time updates as your package travels from the US to Jamaica. We'll notify you at every step.",
                    highlight: "Real-time Updates"
                  },
                  {
                    icon: "📦",
                    title: "Pickup or Delivery",
                    description: "When your package status shows 'Ready for Pickup', collect it from your selected branch or opt for delivery (coming soon!).",
                    highlight: "Delivery Coming Soon!"
                  }
                ].map((step, index) => (
                  <div
                    key={index}
                    className={`group relative cursor-pointer transition-all duration-500 ${
                      activeStep === index
                        ? 'transform scale-105 bg-white/10 rounded-xl p-6'
                        : 'hover:bg-white/5 rounded-xl p-6'
                    }`}
                    onClick={() => setActiveStep(index)}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                        activeStep === index
                          ? 'bg-orange-500 shadow-lg transform scale-110'
                          : 'bg-blue-700'
                      }`}>
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2 group-hover:text-orange-300 transition-colors duration-300">
                          {step.title}
                        </h3>
                        <p className="text-blue-200 mb-2 leading-relaxed">
                          {step.description}
                        </p>
                        <div className="inline-block bg-orange-500/20 text-orange-300 px-3 py-1 rounded-full text-sm font-semibold">
                          {step.highlight}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Visual Flow Chart */}
              <div className="relative h-96 lg:h-full">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-800/20 to-indigo-800/20 rounded-2xl backdrop-blur-sm border border-white/10">
                  <div className="p-8 h-full flex flex-col justify-center items-center">
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold mb-4">Package Journey</h3>
                      <div className="w-full bg-white/20 rounded-full h-3 mb-4">
                        <div
                          className="bg-gradient-to-r from-orange-400 to-orange-500 h-3 rounded-full transition-all duration-1000"
                          style={{ width: `${((activeStep + 1) / 5) * 100}%` }}
                        ></div>
                      </div>
                      <p className="text-blue-200">Step {activeStep + 1} of 5</p>
                    </div>

                    {/* Interactive shipping illustration */}
                    <div className="relative flex items-center justify-center space-x-8">
                      <div className="text-4xl animate-bounce">🇺🇸</div>
                      <div className="flex-1 relative">
                        <div className="h-1 bg-white/20 rounded-full"></div>
                        <div
                          className="absolute top-0 left-0 h-1 bg-orange-400 rounded-full transition-all duration-2000"
                          style={{ width: `${((activeStep + 1) / 5) * 100}%` }}
                        ></div>
                        <div
                          className="absolute -top-4 bg-orange-500 w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold transition-all duration-2000 transform"
                          style={{ left: `calc(${((activeStep + 1) / 5) * 100}% - 16px)` }}
                        >
                          📦
                        </div>
                      </div>
                      <div className="text-4xl animate-bounce animation-delay-500">🇯🇲</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Services Section */}
      <section id="services" className="py-20 bg-gradient-to-br from-white to-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 animate-fade-in">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in delay-200">
              Comprehensive shipping solutions designed to meet all your needs between the US and Jamaica.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "🌍",
                title: "International Shipping",
                description: "Reliable shipping from the United States to Jamaica with tracking and insurance options.",
                features: ["Full tracking", "Insurance available", "7-14 day delivery"]
              },
              {
                icon: "🇺🇸",
                title: "Domestic US Shipping",
                description: "Shipping packages to anywhere in the United States with fast delivery times.",
                features: ["Nationwide coverage", "Fast delivery", "Competitive rates"]
              },
              {
                icon: "🛳️",
                title: "Sea Freight (COMING SOON)",
                description: "Specialized shipping for barrels and large parcels via sea freight at competitive rates.",
                features: ["Large items", "Cost effective", "Secure handling"]
              },
              {
                icon: "💳",
                title: "Shopping Assistance (COMING SOON)",
                description: "Shop online using our card service if you don't have a payment method available.",
                features: ["No US card needed", "Secure payments", "Easy process"]
              }
            ].map((service, index) => (
              <div
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-fade-in-up border-t-4 border-blue-500 relative overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-bl-full"></div>

                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-800 group-hover:text-blue-600 transition-colors duration-300">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {service.description}
                </p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section className="py-20 bg-gradient-to-br from-gray-100 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 animate-fade-in">
              Our Locations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in delay-200">
              Choose from our convenient pickup locations across St. Ann, Jamaica. Click on a location to learn more.
            </p>
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Location Cards - Mobile: Stack vertically, Desktop: Single column */}
              <div className="space-y-4 lg:space-y-6 order-2 lg:order-1">
                {Object.entries(locations).map(([key, location]) => (
                  <div
                    key={key}
                    onClick={() => setSelectedLocation(key)}
                    className={`cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                      selectedLocation === key
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-2xl'
                        : 'bg-white text-gray-800 shadow-lg hover:shadow-xl'
                    } p-4 sm:p-6 rounded-xl border-2 ${
                      selectedLocation === key ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start mb-3 sm:mb-4">
                      <div className={`p-2 sm:p-3 rounded-full mr-3 sm:mr-4 flex-shrink-0 ${
                        selectedLocation === key ? 'bg-white/20' : 'bg-blue-100'
                      }`}>
                        <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${
                          selectedLocation === key ? 'text-white' : 'text-blue-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold break-words">{location.name}</h3>
                      </div>
                    </div>
                    <p className={`mb-3 text-sm sm:text-base ${selectedLocation === key ? 'text-blue-100' : 'text-gray-600'}`}>
                      {location.address}
                    </p>
                    <div className={`inline-block px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${
                      selectedLocation === key
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {location.type}
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Map Display - Mobile: Show first, Desktop: Span 2 columns */}
              <div className="lg:col-span-2 order-1 lg:order-2">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden h-full">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 sm:p-6">
                    <h3 className="text-xl sm:text-2xl font-bold mb-1 sm:mb-2">
                      {locations[selectedLocation].name}
                    </h3>
                    <p className="text-sm sm:text-base text-blue-100">
                      {locations[selectedLocation].address}
                    </p>
                  </div>

                  {/* Interactive Location Showcase - Responsive height */}
                  <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] rounded-b-2xl overflow-hidden">
                    <LocationShowcaseComponent
                      selectedLocation={selectedLocation}
                      locations={locations}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Pricing Section */}
      <section id="rates" className="py-20 bg-gradient-to-br from-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 animate-fade-in">
              Transparent Pricing
            </h2>
            <p className="text-xl text-blue-200 max-w-3xl mx-auto animate-fade-in delay-200">
              Simple, straightforward rates with no hidden fees. First pound starts at JM$700, each additional pound only JM$650.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl overflow-hidden shadow-2xl animate-fade-in-up delay-400">
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6">
                <h3 className="text-2xl font-bold mb-2">Shipping Rates (JMD) (*before customs fees)</h3>
                <p className="text-orange-100">Competitive rates for fast, reliable delivery</p>
              </div>

              <div className="p-8">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                  {shippingRates.map((rate, index) => (
                    <div
                      key={rate.pounds}
                      className="group text-center p-6 border border-white/20 rounded-xl transform transition-all duration-300 hover:scale-105 hover:bg-white/10 animate-fade-in-up cursor-pointer"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="text-3xl font-bold text-orange-400 mb-2 group-hover:scale-110 transition-transform duration-300">
                        {rate.pounds}
                        <span className="text-lg text-white/70"> lb</span>
                      </div>
                      <div className="text-xl font-semibold text-white">
                        JM${rate.rate.toLocaleString()}
                      </div>
                      <div className="text-sm text-white/60 mt-1">
                        {index === 0 ? 'Base rate' : `+JM$650`}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-white/5 rounded-xl p-6 backdrop-blur-sm">
                  <h4 className="text-xl font-bold mb-4 text-center">What's Included</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h5 className="font-semibold mb-2">Full Tracking</h5>
                      <p className="text-white/70 text-sm">Real-time updates from pickup to delivery</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h5 className="font-semibold mb-2">Secure Handling</h5>
                      <p className="text-white/70 text-sm">Professional packaging and careful transport</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-3">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h5 className="font-semibold mb-2">Fast Delivery</h5>
                      <p className="text-white/70 text-sm">5-7 days from US to Jamaica</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4 animate-fade-in">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto animate-fade-in delay-200">
              Have questions? Need support? We're here to help! Reach out to us anytime.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Contact Info */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white p-8">
                  <h3 className="text-2xl font-bold mb-6">Contact Information</h3>

                  <div className="space-y-6">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold">Phone</h4>
                        <p className="text-blue-100">(876) 455-9770</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold">Email</h4>
                        <p className="text-blue-100">shippingpongs@gmail.com</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold">Hours</h4>
                        <p className="text-blue-100">Mon-Fri: 8AM-5PM</p>
                        <p className="text-blue-100">Sat: 9AM-2PM</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Form */}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">Send Us a Message</h3>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Your Name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Subject"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    />
                    <textarea
                      rows="4"
                      placeholder="Your Message"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                    ></textarea>
                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02]"
                    >
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-500 to-orange-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 animate-fade-in">
              Ready to Ship with Confidence?
            </h2>
            <p className="text-xl mb-8 text-orange-100 max-w-3xl mx-auto animate-fade-in delay-100">
              Join thousands of satisfied customers who trust Pong's Shipping for their US to Jamaica shipping needs. Fast, reliable, and affordable - that's our promise to you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link
                to="/signup"
                className="group bg-white hover:bg-gray-100 text-orange-600 font-bold py-4 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105 inline-block animate-fade-in-up delay-200 shadow-xl"
              >
                <span className="flex items-center justify-center">
                  <svg className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  Start Shipping Today
                </span>
              </Link>
              <a
                href="#rates"
                className="bg-transparent hover:bg-white/10 text-white font-bold py-4 px-8 rounded-full text-lg border-2 border-white transition-all duration-300 transform hover:scale-105 inline-block animate-fade-in-up delay-300 backdrop-blur-sm"
              >
                View Our Rates
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer/>

      {/* Enhanced Animation Styles */}
      <style jsx>{`
        /* Mobile background optimization */
        @media (max-width: 768px) {
          .mobile-bg-hero {
            background-position: 30% center !important;
            background-size: cover !important;
          }
        }

        @media (max-width: 640px) {
          .mobile-bg-hero {
            background-position: 25% center !important;
          }
        }

        @keyframes fadeInDown {
          0% {
            opacity: 0;
            transform: translateY(-30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(5deg);
          }
          100% {
            transform: translateY(0) rotate(0deg);
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0, -8px, 0);
          }
          70% {
            transform: translate3d(0, -4px, 0);
          }
          90% {
            transform: translate3d(0, -2px, 0);
          }
        }
        .animate-fade-in-down {
          animation: fadeInDown 0.8s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-out forwards;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-bounce {
          animation: bounce 2s infinite;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }
        .delay-500 { animation-delay: 0.5s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-1000 { animation-delay: 1s; }
        .animation-delay-1000 { animation-delay: 1s; }
        .animation-delay-1500 { animation-delay: 1.5s; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-2500 { animation-delay: 2.5s; }
        .animation-delay-3000 { animation-delay: 3s; }
      `}</style>
    </div>
  );
}

export default Home;