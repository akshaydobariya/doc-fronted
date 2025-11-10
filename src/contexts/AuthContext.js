import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);

  // Prevent concurrent auth checks
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(false);

  // Cache for session info to prevent redundant calls
  const [sessionCache, setSessionCache] = useState({ data: null, timestamp: 0 });

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount, checkAuth should not be a dependency to prevent loops

  useEffect(() => {
    // Set up periodic session validation only when user is authenticated
    let sessionCheckInterval;

    if (user) {
      sessionCheckInterval = setInterval(() => {
        checkSessionStatus();
      }, 5 * 60 * 1000); // Check every 5 minutes
    }

    return () => {
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // checkSessionStatus should not be a dependency to prevent loops

  const checkAuth = async () => {
    // Prevent concurrent auth checks
    if (isCheckingAuth) {
      console.log('🔄 Auth check already in progress, skipping...');
      return false;
    }

    try {
      setIsCheckingAuth(true);
      console.log('🔍 Checking authentication status...');
      const response = await api.get('auth/current-user');

      if (response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('✅ Auto-login successful:', response.data.user.email, '- Role:', response.data.user.role);

        // Only get session info if we don't have recent cached data
        const now = Date.now();
        const cacheAge = now - sessionCache.timestamp;
        const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes cache

        if (!sessionCache.data || cacheAge > CACHE_DURATION) {
          await checkSessionStatus();
        } else {
          console.log('📦 Using cached session info');
          setSessionInfo(sessionCache.data);
        }

        return true; // Authentication successful
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error.response?.status, error.message);

      // If we get 401, session is expired - clear everything
      if (error.response?.status === 401) {
        console.log('🚫 Session expired (401) - clearing stored user data');
        setUser(null);
        localStorage.removeItem('user');
        setSessionInfo(null);
        setSessionCache({ data: null, timestamp: 0 });
        return false; // Authentication failed - session expired
      } else {
        // For other errors (like network issues), fallback to localStorage temporarily
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            console.log('⚠️ Using cached user from localStorage (network error):', parsedUser.email);
            setUser(parsedUser);
            return true; // Using cached authentication
          } catch (e) {
            console.error('💥 Failed to parse stored user:', e);
            setUser(null);
            localStorage.removeItem('user');
          }
        }
      }
      return false; // Authentication failed
    } finally {
      setLoading(false);
      setIsCheckingAuth(false);
    }
  };

  const checkSessionStatus = async () => {
    // Prevent concurrent session checks
    if (isCheckingSession) {
      console.log('🔄 Session check already in progress, skipping...');
      return null;
    }

    try {
      setIsCheckingSession(true);
      const response = await api.get('auth/session-status');
      const sessionData = response.data.sessionInfo;

      setSessionInfo(sessionData);

      // Update cache with new data
      setSessionCache({
        data: sessionData,
        timestamp: Date.now()
      });

      // Log session info for debugging
      const { remainingTime, expiresAt } = sessionData;
      const hours = Math.floor(remainingTime / 60);
      const minutes = remainingTime % 60;
      console.log(`⏰ Session expires in: ${hours}h ${minutes}m (at ${new Date(expiresAt).toLocaleTimeString()})`);

      // Warn user if session is expiring soon (less than 30 minutes)
      if (remainingTime < 30) {
        console.warn('⚠️ Session expiring soon!');
        // You could show a notification here
      }

      return response.data;
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('🚫 Session check failed - session expired');
        setUser(null);
        localStorage.removeItem('user');
        setSessionInfo(null);
        setSessionCache({ data: null, timestamp: 0 });
        return null;
      }
      console.error('❌ Session status check failed:', error.message);
      return null;
    } finally {
      setIsCheckingSession(false);
    }
  };

  const login = async (role) => {
    try {
      const response = await api.get(`auth/google/url?role=${role}`);
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = async () => {
    try {
      await api.post('auth/logout');
      setUser(null);
      localStorage.removeItem('user');
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear local state anyway
      setUser(null);
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  };

  const refreshSession = async () => {
    // Manually refresh session by making an API call
    if (user) {
      return await checkAuth();
    }
    return false;
  };

  const getSessionTimeRemaining = () => {
    if (!sessionInfo) return null;
    return sessionInfo.remainingTime; // in minutes
  };

  const isSessionExpiringSoon = (thresholdMinutes = 30) => {
    if (!sessionInfo) return false;
    return sessionInfo.remainingTime < thresholdMinutes;
  };

  const value = {
    user,
    loading,
    sessionInfo,
    login,
    logout,
    checkAuth,
    checkSessionStatus,
    refreshSession,
    getSessionTimeRemaining,
    isSessionExpiringSoon
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};