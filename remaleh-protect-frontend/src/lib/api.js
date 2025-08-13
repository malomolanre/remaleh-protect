// Central API base for all fetch calls.
export const API = import.meta.env.VITE_API_BASE || import.meta.env.VITE_API_URL || "https://api.remalehprotect.remaleh.com.au";

// Log the API base URL for debugging (remove in production)
if (import.meta.env.DEV) {
  console.log('🌐 API Configuration - API Base URL:', API);
  console.log('🌐 API Configuration - Environment Variables:', {
    VITE_API_BASE: import.meta.env.VITE_API_BASE,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    NODE_ENV: import.meta.env.NODE_ENV,
    MODE: import.meta.env.MODE
  });
} else {
  console.log('🌐 API Configuration - Production API Base URL:', API);
}

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
  
  // Admin
  ADMIN: {
    USERS: '/api/admin/users',
    CREATE_USER: '/api/admin/users',
    USER_DETAILS: '/api/admin/users',
    USER_UPDATE: '/api/admin/users',
    USER_SUSPEND: '/api/admin/users',
    USER_ACTIVATE: '/api/admin/users',
    USER_DELETE: '/api/admin/users',
    USER_RESET_PASSWORD: '/api/admin/users',
    BULK_ACTION: '/api/admin/users/bulk-action',
    BULK_RESET_PASSWORD: '/api/admin/users/bulk-reset-password',
    DASHBOARD: '/api/admin/dashboard',
    MAINTENANCE: '/api/admin/maintenance',
    COMMUNITY_REPORTS: '/api/admin/community-reports',
    COMMUNITY_REPORTS_VERIFY: '/api/admin/community-reports',
    COMMUNITY_REPORTS_REJECT: '/api/admin/community-reports',
    COMMUNITY_REPORTS_ESCALATE: '/api/admin/community-reports',
    COMMUNITY_REPORTS_DELETE: '/api/admin/community-reports',
    COMMUNITY_REPORTS_BULK_ACTION: '/api/admin/community-reports/bulk-action'
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
  
  // Learning Content
  LEARNING: {
    MODULES: '/api/learning/modules',
    PROGRESS: '/api/learning/progress',
    NEXT_LESSON: '/api/learning/next-lesson'
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
  
  console.log('🌐 API Call - Endpoint:', endpoint);
  console.log('🌐 API Call - Token present:', !!token);
  console.log('🌐 API Call - Token value:', token ? `${token.substring(0, 20)}...` : 'None');
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    },
    ...options
  };

  console.log('🌐 API Call - Request headers:', defaultOptions.headers);
  console.log('🌐 API Call - Full URL:', `${API}${endpoint}`);

  try {
    const response = await fetch(`${API}${endpoint}`, defaultOptions);
    console.log('🌐 API Call - Response status:', response.status);
    console.log('🌐 API Call - Response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      if (response.status === 401) {
        console.log('🌐 API Call - 401 Unauthorized, attempting token refresh...');
        // Token expired, try to refresh
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          console.log('🌐 API Call - Refresh token found, attempting refresh...');
          const refreshResponse = await fetch(`${API}${API_ENDPOINTS.AUTH.REFRESH}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken })
          });
          
          if (refreshResponse.ok) {
            const { access_token } = await refreshResponse.json();
            console.log('🌐 API Call - Token refresh successful, retrying request...');
            localStorage.setItem('authToken', access_token);
            
            // Retry original request with new token
            defaultOptions.headers.Authorization = `Bearer ${access_token}`;
            const retryResponse = await fetch(`${API}${endpoint}`, defaultOptions);
            return retryResponse;
          } else {
            console.log('🌐 API Call - Token refresh failed, removing tokens');
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
    console.error('🌐 API Call - Request failed:', error);
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
