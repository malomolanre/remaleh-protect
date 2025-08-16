import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS, apiPost, apiGet, apiPut } from '../lib/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Refresh auth token function (defined early to avoid TDZ in callbacks below)
  const refreshAuthToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        return { success: false, error: 'No refresh token available' };
      }

      const response = await apiPost(API_ENDPOINTS.AUTH.REFRESH, {
        refresh_token: refreshToken
      });

      if (response.ok) {
        const responseData = await response.json();
        const { access_token, refresh_token: newRefreshToken } = responseData;
        localStorage.setItem('authToken', access_token);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }
        return { success: true };
      } else {
        return { success: false, error: 'Token refresh failed' };
      }
    } catch (err) {
      console.error('Token refresh error:', err);
      return { success: false, error: 'Token refresh failed' };
    }
  }, []);

  // Central auth check function (reusable and event-driven)
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const response = await apiGet(API_ENDPOINTS.AUTH.PROFILE);
        if (response.ok) {
          const userData = await response.json();
          const newUser = userData.user || userData;
          setUser(newUser);
          setIsAuthenticated(true);
        } else if (response.status === 401) {
          const refreshResult = await refreshAuthToken();
          if (!refreshResult.success) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          localStorage.removeItem('authToken');
          localStorage.removeItem('refreshToken');
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (_err) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        setIsAuthenticated(false);
      }
    } else {
      setUser(null);
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  }, [refreshAuthToken]);

  // On mount: check auth and subscribe to global auth change events
  useEffect(() => {
    checkAuth();
    const handler = () => checkAuth();
    window.addEventListener('remaleh-auth-changed', handler);
    return () => window.removeEventListener('remaleh-auth-changed', handler);
  }, [checkAuth]);

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
        // Notify all hook instances (e.g., App) to refresh their state
        window.dispatchEvent(new Event('remaleh-auth-changed'));
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
        window.dispatchEvent(new Event('remaleh-auth-changed'));
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
      window.dispatchEvent(new Event('remaleh-auth-changed'));
    }
  }, []);

  // Update profile function
  const updateProfile = useCallback(async (profileData) => {
    try {
      setError(null);
      setIsLoading(true);
      // Backend expects first_name, last_name, risk_level. Map from UI fields.
      const payload = {};
      if (typeof profileData?.name === 'string') {
        const trimmed = profileData.name.trim();
        const parts = trimmed.split(/\s+/);
        payload.first_name = parts[0] || '';
        payload.last_name = parts.length > 1 ? parts.slice(1).join(' ') : '';
      }
      if (typeof profileData?.first_name === 'string') payload.first_name = profileData.first_name;
      if (typeof profileData?.last_name === 'string') payload.last_name = profileData.last_name;
      if (typeof profileData?.risk_level === 'string') payload.risk_level = profileData.risk_level;

      const response = await apiPut(API_ENDPOINTS.AUTH.PROFILE, payload);
      
      if (response.ok) {
        const resp = await response.json();
        const updatedUser = resp.user || resp;
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
    refreshAuthToken,
    clearError: () => setError(null),
    debugUserState
  };
};
