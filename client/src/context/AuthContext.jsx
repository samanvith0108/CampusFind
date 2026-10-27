import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getMe, login as loginApi, register as registerApi, logout as logoutApi } from '../api/auth.api';
import { getApiErrorMessage } from '../utils/apiError';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount
  useEffect(() => {
    let isMounted = true;
    const initAuth = async () => {
      try {
        const response = await getMe();
        if (isMounted) {
          const userData = response.data?.user || response.user || response.data;
          setUser(userData);
        }
      } catch (err) {
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    try {
      const response = await loginApi(credentials);
      const userData = response.data?.user || response.user || response.data;
      setUser(userData);
      toast.success(response.message || 'Logged in successfully!');
      return userData;
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Login failed');
      toast.error(msg);
      throw error;
    }
  }, []);

  const register = useCallback(async (formData) => {
    try {
      const response = await registerApi(formData);
      const userData = response.data?.user || response.user || response.data;
      setUser(userData);
      toast.success(response.message || 'Account registered successfully!');
      return userData;
    } catch (error) {
      const msg = getApiErrorMessage(error, 'Registration failed');
      toast.error(msg);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutApi();
      setUser(null);
      toast.success('Logged out successfully');
    } catch (error) {
      setUser(null);
      const msg = getApiErrorMessage(error, 'Logged out');
      toast.error(msg);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        setUser,
      }}
    >
      {children}
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
