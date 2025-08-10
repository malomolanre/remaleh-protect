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
            // Handle both response formats: {user: {...}} and direct user object
            const user = userData.user || userData;
            console.log('Profile data received:', userData);
            console.log('User object:', user);
            console.log('Is admin?', user.is_admin);
            setUser(user);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
          }
        } catch (err) {
          console.error('Profile check error:', err);
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
      
      console.log('Attempting login to:', API_ENDPOINTS.AUTH.LOGIN);
      
      const response = await apiPost(API_ENDPOINTS.AUTH.LOGIN, {
        email,
        password
      });
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Login response:', responseData);
        
        const { access_token, refresh_token, user: userData } = responseData;
        
        localStorage.setItem('authToken', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        
        // Ensure we have the user data with proper structure
        const user = userData || responseData.user;
        console.log('Setting user:', user);
        console.log('User is_admin:', user?.is_admin);
        console.log('User role:', user?.role);
        
        setUser(user);
        setIsAuthenticated(true);
        return { success: true };
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Login failed');
        return { success: false, error: errorData.message };
      }
    } catch (err) {
      console.error('Login error details:', err);
      
      // Provide more specific error messages
      let errorMessage = 'Network error occurred';
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = 'Cannot connect to server. Please check your internet connection or server status.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
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

  // Debug function to check user state
  const debugUserState = useCallback(() => {
    console.log('=== USER AUTH DEBUG ===');
    console.log('User object:', user);
    console.log('Is authenticated:', isAuthenticated);
    console.log('Is loading:', isLoading);
    console.log('User is_admin:', user?.is_admin);
    console.log('User role:', user?.role);
    console.log('User email:', user?.email);
    console.log('Local storage token:', localStorage.getItem('authToken'));
    console.log('========================');
  }, [user, isAuthenticated, isLoading]);

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
    clearError: () => setError(null),
    debugUserState
  };
};
