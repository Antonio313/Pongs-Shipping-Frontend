import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

const ActivityContext = createContext();

export const useActivity = () => {
  const context = useContext(ActivityContext);
  if (!context) {
    throw new Error('useActivity must be used within an ActivityProvider');
  }
  return context;
};

export const ActivityProvider = ({ children }) => {
  const { user, isAuthenticated, validateToken, logout } = useAuth();
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [isActive, setIsActive] = useState(true);
  const activityTimeout = useRef(null);
  const tokenCheckInterval = useRef(null);

  // Activity tracking events - comprehensive for mobile and desktop
  const activityEvents = [
    'mousedown',
    'mousemove',
    'keypress',
    'scroll',
    'touchstart',
    'touchmove',
    'touchend',
    'click',
    'focus',
    'blur',
    'pointerdown',
    'pointermove',
    'pointerup',
    'input',
    'change'
  ];

  const updateActivity = () => {
    const now = Date.now();
    setLastActivity(now);
    setIsActive(true);

    //console.log('User activity detected at:', new Date(now).toLocaleTimeString());

    // Reset activity timeout
    if (activityTimeout.current) {
      clearTimeout(activityTimeout.current);
    }

    // Mark as inactive after 45 minutes of no activity (more lenient for mobile users)
    activityTimeout.current = setTimeout(() => {
      setIsActive(false);
    }, 45 * 60 * 1000); // 45 minutes
  };

  // Throttle activity updates to prevent excessive calls on mobile
  const throttledUpdateActivity = useRef(null);

  const handleActivity = () => {
    if (throttledUpdateActivity.current) {
      clearTimeout(throttledUpdateActivity.current);
    }

    throttledUpdateActivity.current = setTimeout(() => {
      updateActivity();
    }, 1000); // Throttle to once per second
  };

  const getTokenExpiryTime = (role) => {
    switch (role) {
      case 'C': return 4 * 60 * 60 * 1000; // 4 hours in ms
      case 'A': return 12 * 60 * 60 * 1000; // 12 hours in ms
      default: return 8 * 60 * 60 * 1000; // 8 hours in ms
    }
  };

  const checkTokenExpiry = async () => {
    if (!isAuthenticated || !user) return;

    const loginTime = localStorage.getItem('loginTime');
    if (!loginTime) {
      //console.log('No login time found, setting current time');
      localStorage.setItem('loginTime', Date.now().toString());
      return;
    }

    const tokenLifetime = getTokenExpiryTime(user.role);
    const timeElapsed = Date.now() - parseInt(loginTime);
    const timeRemaining = tokenLifetime - timeElapsed;

    //console.log(`Token check - Role: ${user.role}, Elapsed: ${Math.round(timeElapsed / 1000 / 60)}min, Remaining: ${Math.round(timeRemaining / 1000 / 60)}min, Active: ${isActive}`);

    // If token is about to expire (within 10 minutes) and user is active, validate and potentially refresh
    if (timeRemaining < 10 * 60 * 1000 && timeRemaining > 0 && isActive) {
      try {
        const isValid = await validateToken();
        if (isValid) {
          // Reset login time to extend session for active users
          localStorage.setItem('loginTime', Date.now().toString());
        }
      } catch (error) {
        console.error('Token validation failed:', error);
      }
    }

    // If token has expired and user is inactive, log them out
    if (timeRemaining <= 0 && !isActive) {
      await logout();
    }

    // If token has been expired for more than 5 minutes, force logout regardless of activity
    if (timeRemaining < -5 * 60 * 1000) {
      await logout();
    }
  };

  // Set up activity tracking
  useEffect(() => {
    if (isAuthenticated && user) {
      //console.log(`Setting up activity tracking for ${user.role} user with ${getTokenExpiryTime(user.role) / 1000 / 60 / 60}h token`);

      // Set initial login time if not existsF
      if (!localStorage.getItem('loginTime')) {
        localStorage.setItem('loginTime', Date.now().toString());
      }

      // Add activity listeners with passive options for better mobile performance
      activityEvents.forEach(event => {
        const options = {
          passive: true,
          capture: true
        };
        window.addEventListener(event, handleActivity, options);
      });

      // Handle page visibility changes to maintain activity on mobile
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          // Page became visible again, update activity to prevent logout
          updateActivity();
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Initial activity
      updateActivity();

      // Check token every 5 minutes
      tokenCheckInterval.current = setInterval(checkTokenExpiry, 5 * 60 * 1000);

      return () => {
        // Cleanup
        activityEvents.forEach(event => {
          const options = {
            passive: true,
            capture: true
          };
          window.removeEventListener(event, handleActivity, options);
        });

        document.removeEventListener('visibilitychange', handleVisibilityChange);

        if (activityTimeout.current) {
          clearTimeout(activityTimeout.current);
        }

        if (throttledUpdateActivity.current) {
          clearTimeout(throttledUpdateActivity.current);
        }

        if (tokenCheckInterval.current) {
          clearInterval(tokenCheckInterval.current);
        }
      };
    } else {
      // Clear login time when logged out
      localStorage.removeItem('loginTime');
    }
  }, [isAuthenticated, user]);

  const value = {
    lastActivity,
    isActive,
    updateActivity
  };

  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
};