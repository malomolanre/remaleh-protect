// Central API base for all fetch calls.
export const API = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || "http://localhost:10000";

// API endpoints for all features
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    REGISTER: '/api/auth/register',
    LOGIN: '/api/auth/login',
    PROFILE: '/api/auth/profile',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    CHANGE_PASSWORD: '/api/auth/change-password'
  },
  
  // Threat Intelligence
  THREAT_INTELLIGENCE: {
    DASHBOARD: '/api/threat_intelligence/dashboard',
    THREATS: '/api/threat_intelligence/threats',
    ALERTS: '/api/threat_intelligence/alerts',
    TRENDS: '/api/threat_intelligence/stats/trends'
  },
  
  // Risk Profile
  RISK_PROFILE: {
    PROFILE: '/api/risk_profile/profile',
    SCANS: '/api/risk_profile/scans',
    LEARNING: '/api/risk_profile/learning/modules',
    RECOMMENDATIONS: '/api/risk_profile/recommendations'
  },
  

  
  // Community
  COMMUNITY: {
    REPORTS: '/api/community/reports',
    TRENDING: '/api/community/trending',
    STATS: '/api/community/stats',
    ALERTS: '/api/community/alerts'
  },
  
  // Existing endpoints
  SCAM: '/api/scam/comprehensive',
  BREACH: '/api/breach/check',
  LINK: '/api/link/analyze',
  CHAT: '/api/chat/'
};

// Helper function to make authenticated API calls
export const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem('authToken');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  };

  try {
    const response = await fetch(`${API}${endpoint}`, defaultOptions);
    
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const refreshResponse = await fetch(`${API}${API_ENDPOINTS.AUTH.REFRESH}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken })
          });
          
          if (refreshResponse.ok) {
            const { access_token } = await refreshResponse.json();
            localStorage.setItem('authToken', access_token);
            
            // Retry original request with new token
            defaultOptions.headers.Authorization = `Bearer ${access_token}`;
            const retryResponse = await fetch(`${API}${endpoint}`, defaultOptions);
            return retryResponse;
          }
        }
        // Redirect to login if refresh fails
        localStorage.removeItem('authToken');
        localStorage.removeItem('refreshToken');
        // Don't redirect - let the component handle authentication failures
        // window.location.href = '/login';
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Helper function for GET requests
export const apiGet = (endpoint) => apiCall(endpoint, { method: 'GET' });

// Helper function for POST requests
export const apiPost = (endpoint, data) => apiCall(endpoint, {
  method: 'POST',
  body: JSON.stringify(data)
});

// Helper function for PUT requests
export const apiPut = (endpoint, data) => apiCall(endpoint, {
  method: 'PUT',
  body: JSON.stringify(data)
});

// Helper function for DELETE requests
export const apiDelete = (endpoint) => apiCall(endpoint, { method: 'DELETE' });

// Create a unified API object for admin components
export const api = {
  get: (endpoint) => apiGet(endpoint),
  post: (endpoint, data) => apiPost(endpoint, data),
  put: (endpoint, data) => apiPut(endpoint, data),
  delete: (endpoint) => apiDelete(endpoint),
  request: (options) => {
    const { method = 'GET', url, data, ...rest } = options;
    if (method === 'GET') {
      return apiGet(url);
    } else if (method === 'POST') {
      return apiPost(url, data);
    } else if (method === 'PUT') {
      return apiPut(url, data);
    } else if (method === 'DELETE') {
      return apiDelete(url);
    }
    return apiCall(url, { method, body: data ? JSON.stringify(data) : undefined, ...rest });
  }
};
