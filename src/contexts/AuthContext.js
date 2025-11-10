import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState(null);

  useEffect(() => {
    checkAuth();
    // Set up periodic session validation
    const sessionCheckInterval = setInterval(() => {
      if (user) {
        checkSessionStatus();
      }
    }, 5 * 60 * 1000); // Check every 5 minutes

    return () => clearInterval(sessionCheckInterval);
  }, [user]);

  const checkAuth = async () => {
    try {
      console.log('🔍 Checking authentication status...');
      const response = await api.get('auth/current-user');

      if (response.data.user) {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('✅ Auto-login successful:', response.data.user.email, '- Role:', response.data.user.role);

        // Also get session info
        await checkSessionStatus();

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
    }
  };

  const checkSessionStatus = async () => {
    try {
      const response = await api.get('auth/session-status');
      setSessionInfo(response.data.sessionInfo);

      // Log session info for debugging
      const { remainingTime, expiresAt } = response.data.sessionInfo;
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
        return null;
      }
      console.error('❌ Session status check failed:', error.message);
      return null;
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