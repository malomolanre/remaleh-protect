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
        let friendly = 'Login failed. Please check your email and password.';
        try {
          const errorData = await response.json();
          const apiMsg = errorData.error || errorData.message || '';
          // Map backend signals to friendlier copy
          if (apiMsg.toLowerCase().includes('email not verified')) {
            friendly = 'Please verify your email to sign in. Check your inbox for the code.';
          } else if (apiMsg.toLowerCase().includes('invalid email or password')) {
            friendly = 'Incorrect email or password. Please try again.';
          } else if (apiMsg.toLowerCase().includes('deactivated')) {
            friendly = 'Your account is deactivated. Contact support for assistance.';
          }
        } catch (_) {}
        setError(friendly);
        return { success: false, error: friendly };
      }
    } catch (err) {
      console.error('Login error details:', err);
      
      // Provide more specific error messages
      let errorMessage = 'We couldn\'t reach the server. Please check your connection and try again.';
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
        const resp = await response.json();
        // If backend requires verification, it will not include tokens
        if (resp.requires_verification) {
          return { success: true, requires_verification: true, user: resp.user };
        }
        const { access_token, refresh_token, user: newUser } = resp;
        localStorage.setItem('authToken', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        setUser(newUser);
        setIsAuthenticated(true);
        window.dispatchEvent(new Event('remaleh-auth-changed'));
        return { success: true };
      } else {
        let errorText = 'Registration failed';
        try {
          const errorData = await response.json();
          errorText = errorData.error || errorData.message || errorText;
        } catch (_) {}
        setError(errorText);
        return { success: false, error: errorText };
      }
    } catch (err) {
      const msg = 'We couldn\'t reach the server. Please check your connection and try again.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const verifyEmail = useCallback(async (email, code) => {
    try {
      setError(null);
      setIsLoading(true);
      const response = await apiPost(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { email, code });
      if (response.ok) {
        const resp = await response.json();
        const { access_token, refresh_token, user: verifiedUser } = resp;
        localStorage.setItem('authToken', access_token);
        localStorage.setItem('refreshToken', refresh_token);
        setUser(verifiedUser);
        setIsAuthenticated(true);
        window.dispatchEvent(new Event('remaleh-auth-changed'));
        return { success: true };
      } else {
        const errorData = await response.json();
        setError(errorData.error || errorData.message || 'Verification failed');
        return { success: false, error: errorData.error || errorData.message };
      }
    } catch (err) {
      const msg = 'We couldn\'t reach the server. Please check your connection and try again.';
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resendVerification = useCallback(async (email) => {
    try {
      setError(null);
      const response = await apiPost(API_ENDPOINTS.AUTH.RESEND_VERIFICATION, { email });
      if (response.ok) {
        return { success: true };
      } else {
        const errorData = await response.json();
        setError(errorData.error || errorData.message || 'Resend failed');
        return { success: false, error: errorData.error || errorData.message };
      }
    } catch (err) {
      const msg = 'We couldn\'t reach the server. Please check your connection and try again.';
      setError(msg);
      return { success: false, error: msg };
    }
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    try {
      setError(null);
      const response = await apiPost(API_ENDPOINTS.AUTH.REQUEST_PASSWORD_RESET, { email });
      if (response.ok) {
        const resp = await response.json();
        return { success: true, message: resp.message || 'If this email exists, a temporary password has been sent.' };
      } else {
        let msg = 'Please wait before trying again.';
        try {
          const err = await response.json();
          msg = err.error || err.message || msg;
        } catch (_) {}
        setError(msg);
        return { success: false, error: msg };
      }
    } catch (err) {
      const msg = 'We couldn\'t reach the server. Please check your connection and try again.';
      setError(msg);
      return { success: false, error: msg };
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
      // Backend expects first_name, last_name, bio. Map from UI fields.
      const payload = {};
      if (typeof profileData?.name === 'string') {
        const trimmed = profileData.name.trim();
        const parts = trimmed.split(/\s+/);
        payload.first_name = parts[0] || '';
        payload.last_name = parts.length > 1 ? parts.slice(1).join(' ') : '';
      }
      if (typeof profileData?.first_name === 'string') payload.first_name = profileData.first_name;
      if (typeof profileData?.last_name === 'string') payload.last_name = profileData.last_name;
      if (typeof profileData?.bio === 'string') payload.bio = profileData.bio;

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
      const msg = 'We couldn\'t reach the server. Please check your connection and try again.';
      setError(msg);
      return { success: false, error: msg };
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
      const msg = 'We couldn\'t reach the server. Please check your connection and try again.';
      setError(msg);
      return { success: false, error: msg };
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
    verifyEmail,
    resendVerification,
    requestPasswordReset,
    logout,
    updateProfile,
    changePassword,
    refreshAuthToken,
    clearError: () => setError(null),
    debugUserState
  };
};
