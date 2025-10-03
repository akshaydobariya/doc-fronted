import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await api.get('/api/auth/current-user');
      setUser(response.data.user);
      // Update localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
    } catch (error) {
      console.error('Auth check failed:', error);

      // Fallback to localStorage if session failed
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('Using stored user from localStorage:', parsedUser.email);
          setUser(parsedUser);
        } catch (e) {
          console.error('Failed to parse stored user:', e);
          setUser(null);
          localStorage.removeItem('user');
        }
      } else {
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (role) => {
    try {
      const response = await api.get(`/api/auth/google/url?role=${role}`);
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
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

  const value = {
    user,
    loading,
    login,
    logout,
    checkAuth
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