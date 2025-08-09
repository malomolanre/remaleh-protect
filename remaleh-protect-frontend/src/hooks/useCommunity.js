import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS, apiGet, apiPost, apiPut } from '../lib/api';

export const useCommunity = () => {
  const [reports, setReports] = useState([]);
  const [trendingThreats, setTrendingThreats] = useState([]);
  const [communityStats, setCommunityStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch community reports
  const fetchReports = useCallback(async (filters = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const queryParams = new URLSearchParams(filters).toString();
      const endpoint = `${API_ENDPOINTS.COMMUNITY.REPORTS}${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await apiGet(endpoint);
      if (response.ok) {
        const data = await response.json();
        setReports(data.reports || data);
        return data;
      } else {
        throw new Error('Failed to fetch community reports');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching reports:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch trending threats
  const fetchTrendingThreats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiGet(API_ENDPOINTS.COMMUNITY.TRENDING);
      if (response.ok) {
        const data = await response.json();
        setTrendingThreats(data.trending || data);
        return data;
      } else {
        throw new Error('Failed to fetch trending threats');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching trending threats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch community statistics
  const fetchCommunityStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiGet(API_ENDPOINTS.COMMUNITY.STATS);
      if (response.ok) {
        const data = await response.json();
        setCommunityStats(data);
        return data;
      } else {
        throw new Error('Failed to fetch community statistics');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching community stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch community alerts
  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiGet(API_ENDPOINTS.COMMUNITY.ALERTS);
      if (response.ok) {
        const data = await response.json();
        setAlerts(data.alerts || data);
        return data;
      } else {
        throw new Error('Failed to fetch community alerts');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching alerts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new report
  const createReport = useCallback(async (reportData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiPost(API_ENDPOINTS.COMMUNITY.REPORTS, reportData);
      if (response.ok) {
        const newReport = await response.json();
        setReports(prev => [newReport, ...prev]);
        return { success: true, report: newReport };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create report');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Vote on report
  const voteOnReport = useCallback(async (reportId, voteType) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiPost(`${API_ENDPOINTS.COMMUNITY.REPORTS}/${reportId}/vote`, {
        vote_type: voteType
      });
      if (response.ok) {
        const data = await response.json();
        // Update the report in the list
        setReports(prev => prev.map(r => 
          r.id === reportId ? { ...r, votes: data.votes, user_vote: voteType } : r
        ));
        return { success: true, data };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to vote on report');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Verify report
  const verifyReport = useCallback(async (reportId, verificationData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiPost(`${API_ENDPOINTS.COMMUNITY.REPORTS}/${reportId}/verify`, verificationData);
      if (response.ok) {
        const data = await response.json();
        // Update the report in the list
        setReports(prev => prev.map(r => 
          r.id === reportId ? { ...r, verification_status: data.verification_status, verified_by: data.verified_by } : r
        ));
        return { success: true, data };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify report');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Add comment to report
  const addComment = useCallback(async (reportId, commentData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiPost(`${API_ENDPOINTS.COMMUNITY.REPORTS}/${reportId}/comment`, commentData);
      if (response.ok) {
        const newComment = await response.json();
        // Update the report in the list
        setReports(prev => prev.map(r => 
          r.id === reportId ? { ...r, comments: [...(r.comments || []), newComment] } : r
        ));
        return { success: true, comment: newComment };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add comment');
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
      
      const response = await apiPost(API_ENDPOINTS.COMMUNITY.ALERTS, alertData);
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
      fetchReports(),
      fetchTrendingThreats(),
      fetchCommunityStats(),
      fetchAlerts()
    ]);
  }, [fetchReports, fetchTrendingThreats, fetchCommunityStats, fetchAlerts]);

  // Clear error
  const clearError = useCallback(() => setError(null), []);

  return {
    reports,
    trendingThreats,
    communityStats,
    alerts,
    isLoading,
    error,
    fetchReports,
    fetchTrendingThreats,
    fetchCommunityStats,
    fetchAlerts,
    createReport,
    voteOnReport,
    verifyReport,
    addComment,
    createAlert,
    loadAllData,
    clearError
  };
};
