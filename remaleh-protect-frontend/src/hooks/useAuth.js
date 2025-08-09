import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS, apiPost, apiGet, apiPut } from '../lib/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          const response = await apiGet(API_ENDPOINTS.AUTH.PROFILE);
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
          }
        } catch (err) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Login function
  const login = useCallback(async (email, password) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await apiPost(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password
      });
      
      if (response.ok) {
        const { access_token, refresh_token, user: userData } = await response.json();
        
        localStorage.setItem('authToken', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        
        setUser(userData);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
        return { success: false, error: errorData.message };
      }
    } catch (err) {
      setError('Network error occurred');
      return { success: false, error: 'Network error occurred' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Register function
  const register = useCallback(async (userData) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await apiPost(API_ENDPOINTS.AUTH.REGISTER, userData);
      
      if (response.ok) {
        const { access_token, refresh_token, user: newUser } = await response.json();
        
        localStorage.setItem('authToken', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        
        setUser(newUser);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Registration failed');
        return { success: false, error: errorData.message };
      }
    } catch (err) {
      setError('Network error occurred');
      return { success: false, error: 'Network error occurred' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout function
  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        await apiPost(API_ENDPOINTS.AUTH.LOGOUT);
      }
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  // Update profile function
  const updateProfile = useCallback(async (profileData) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await apiPut(API_ENDPOINTS.AUTH.PROFILE, profileData);
      
      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        return { success: true, user: updatedUser };
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Profile update failed');
        return { success: false, error: errorData.message };
      }
    } catch (err) {
      setError('Network error occurred');
      return { success: false, error: 'Network error occurred' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Change password function
  const changePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      setError(null);
      setIsLoading(true);
      
      const response = await apiPost(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        current_password: currentPassword,
        new_password: newPassword
      });
      
      if (response.ok) {
        return { success: true };
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Password change failed');
        return { success: false, error: errorData.message };
      }
    } catch (err) {
      setError('Network error occurred');
      return { success: false, error: 'Network error occurred' };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError: () => setError(null)
  };
};
