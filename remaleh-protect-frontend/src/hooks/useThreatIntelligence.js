import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS, apiGet, apiPost, apiPut } from '../lib/api';

export const useThreatIntelligence = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [threats, setThreats] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [trends, setTrends] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch dashboard data
  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Debug: Check authentication token
      const token = localStorage.getItem('authToken');
      console.log('🔐 Threat Intelligence - Auth Token:', token ? 'Present' : 'Missing');
      console.log('🔐 Threat Intelligence - Token value:', token ? `${token.substring(0, 20)}...` : 'None');
      
      console.log('📡 Threat Intelligence - Fetching dashboard from:', API_ENDPOINTS.THREAT_INTELLIGENCE.DASHBOARD);
      
      const response = await apiGet(API_ENDPOINTS.THREAT_INTELLIGENCE.DASHBOARD);
      console.log('📡 Threat Intelligence - Dashboard response status:', response.status);
      console.log('📡 Threat Intelligence - Dashboard response headers:', Object.fromEntries(response.headers.entries()));
      
      if (response.ok) {
        const data = await response.json();
        console.log('📡 Threat Intelligence - Dashboard data received:', data);
        setDashboardData(data);
        return data;
      } else {
        const errorText = await response.text();
        console.error('📡 Threat Intelligence - Dashboard error response:', errorText);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to fetch dashboard data';
        if (response.status === 401) {
          errorMessage = 'Authentication required. Please log in to access threat intelligence data.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. You do not have permission to view this data.';
        } else if (response.status === 404) {
          errorMessage = 'Threat intelligence service not found. Please contact support.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (errorText) {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            errorMessage = `${errorMessage}: ${errorText}`;
          }
        }
        
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('📡 Threat Intelligence - Dashboard fetch error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch threats
  const fetchThreats = useCallback(async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = `${API_ENDPOINTS.THREAT_INTELLIGENCE.THREATS}${queryParams ? `?${queryParams}` : ''}`;
      
      console.log('📡 Threat Intelligence - Fetching threats from:', endpoint);
      
      const response = await apiGet(endpoint);
      console.log('📡 Threat Intelligence - Threats response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📡 Threat Intelligence - Threats data received:', data);
        setThreats(data.threats || data);
        return data;
      } else {
        const errorText = await response.text();
        console.error('📡 Threat Intelligence - Threats error response:', errorText);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to fetch threats';
        if (response.status === 401) {
          errorMessage = 'Authentication required. Please log in to access threat data.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. You do not have permission to view threat data.';
        } else if (response.status === 404) {
          errorMessage = 'Threat service not found. Please contact support.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (errorText) {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            errorMessage = `${errorMessage}: ${errorText}`;
          }
        }
        
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('📡 Threat Intelligence - Threats fetch error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📡 Threat Intelligence - Fetching alerts from:', API_ENDPOINTS.THREAT_INTELLIGENCE.ALERTS);
      
      const response = await apiGet(API_ENDPOINTS.THREAT_INTELLIGENCE.ALERTS);
      console.log('📡 Threat Intelligence - Alerts response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📡 Threat Intelligence - Alerts data received:', data);
        setAlerts(data.alerts || data);
        return data;
      } else {
        const errorText = await response.text();
        console.error('📡 Threat Intelligence - Alerts error response:', errorText);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to fetch alerts';
        if (response.status === 401) {
          errorMessage = 'Authentication required. Please log in to access alert data.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. You do not have permission to view alert data.';
        } else if (response.status === 404) {
          errorMessage = 'Alert service not found. Please contact support.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (errorText) {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            errorMessage = `${errorMessage}: ${errorText}`;
          }
        }
        
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('📡 Threat Intelligence - Alerts fetch error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch trends
  const fetchTrends = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📡 Threat Intelligence - Fetching trends from:', API_ENDPOINTS.THREAT_INTELLIGENCE.TRENDS);
      
      const response = await apiGet(API_ENDPOINTS.THREAT_INTELLIGENCE.TRENDS);
      console.log('📡 Threat Intelligence - Trends response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('📡 Threat Intelligence - Trends data received:', data);
        setTrends(data.trends || data);
        return data;
      } else {
        const errorText = await response.text();
        console.error('📡 Threat Intelligence - Trends error response:', errorText);
        
        // Provide more specific error messages
        let errorMessage = 'Failed to fetch trends';
        if (response.status === 401) {
          errorMessage = 'Authentication required. Please log in to access trend data.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. You do not have permission to view trend data.';
        } else if (response.status === 404) {
          errorMessage = 'Trend service not found. Please contact support.';
        } else if (response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else if (errorText) {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } catch {
            errorMessage = `${errorMessage}: ${errorText}`;
          }
        }
        
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('📡 Threat Intelligence - Trends fetch error:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new threat
  const createThreat = useCallback(async (threatData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiPost(API_ENDPOINTS.THREAT_INTELLIGENCE.THREATS, threatData);
      if (response.ok) {
        const newThreat = await response.json();
        setThreats(prev => [newThreat, ...prev]);
        return { success: true, threat: newThreat };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create threat');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update threat
  const updateThreat = useCallback(async (threatId, updateData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiPut(`${API_ENDPOINTS.THREAT_INTELLIGENCE.THREATS}/${threatId}`, updateData);
      if (response.ok) {
        const updatedThreat = await response.json();
        setThreats(prev => prev.map(t => t.id === threatId ? updatedThreat : t));
        return { success: true, threat: updatedThreat };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update threat');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create alert
  const createAlert = useCallback(async (alertData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiPost(API_ENDPOINTS.THREAT_INTELLIGENCE.ALERTS, alertData);
      if (response.ok) {
        const newAlert = await response.json();
        setAlerts(prev => [newAlert, ...prev]);
        return { success: true, alert: newAlert };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create alert');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load all data
  const loadAllData = useCallback(async () => {
    await Promise.all([
      fetchDashboard(),
      fetchThreats(),
      fetchAlerts(),
      fetchTrends()
    ]);
  }, [fetchDashboard, fetchThreats, fetchAlerts, fetchTrends]);

  // Clear error
  const clearError = useCallback(() => setError(null), []);

  return {
    dashboardData,
    threats,
    alerts,
    trends,
    isLoading,
    error,
    fetchDashboard,
    fetchThreats,
    fetchAlerts,
    fetchTrends,
    createThreat,
    updateThreat,
    createAlert,
    loadAllData,
    clearError
  };
};
