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
      
      const response = await apiGet(API_ENDPOINTS.THREAT_INTELLIGENCE.DASHBOARD);
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
        return data;
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching dashboard:', err);
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
      
      const response = await apiGet(endpoint);
      if (response.ok) {
        const data = await response.json();
        setThreats(data.threats || data);
        return data;
      } else {
        throw new Error('Failed to fetch threats');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching threats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch alerts
  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiGet(API_ENDPOINTS.THREAT_INTELLIGENCE.ALERTS);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || data);
        return data;
      } else {
        throw new Error('Failed to fetch alerts');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching alerts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch trends
  const fetchTrends = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiGet(API_ENDPOINTS.THREAT_INTELLIGENCE.TRENDS);
      if (response.ok) {
        const data = await response.json();
        setTrends(data.trends || data);
        return data;
      } else {
        throw new Error('Failed to fetch trends');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching trends:', err);
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
