import { useState, useEffect, useCallback } from 'react';
import { API, API_ENDPOINTS, apiGet, apiPost, apiPut, apiDelete } from '../lib/api';

export const useCommunity = () => {
  const [reports, setReports] = useState([]);
  const [trendingThreats, setTrendingThreats] = useState([]);
  const [communityStats, setCommunityStats] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [myStats, setMyStats] = useState(null);
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
        // Backend returns { trending_threats: [...] }
        setTrendingThreats(data.trending_threats || data);
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

  // Fetch a single report with full details (including all comments)
  const fetchReportById = useCallback(async (reportId) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiGet(`${API_ENDPOINTS.COMMUNITY.REPORTS}/${reportId}`);
      if (response.ok) {
        const data = await response.json();
        return { success: true, report: data };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch report');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // List comments with pagination
  const fetchComments = useCallback(async (reportId, { page = 1, per_page = 20 } = {}) => {
    try {
      setIsLoading(true);
      setError(null);
      const params = new URLSearchParams({ page, per_page }).toString();
      const response = await apiGet(`${API_ENDPOINTS.COMMUNITY.REPORTS}/${reportId}/comments?${params}`);
      if (response.ok) {
        const data = await response.json();
        return { success: true, ...data };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch comments');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete a comment
  const deleteComment = useCallback(async (commentId) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiDelete(`/api/community/comments/${commentId}`);
      if (response.ok) {
        return { success: true };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete comment');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
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
        // Backend returns { alerts: [...], pagination: { ... } }
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

  // Fetch leaderboard
  const fetchLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiGet(API_ENDPOINTS.COMMUNITY.LEADERBOARD);
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard || data);
        return data;
      } else {
        throw new Error('Failed to fetch leaderboard');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching leaderboard:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch current user's reporting stats
  const fetchMyStats = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiGet(API_ENDPOINTS.COMMUNITY.MY_STATS);
      if (response.ok) {
        const data = await response.json();
        setMyStats(data);
        return data;
      } else {
        throw new Error('Failed to fetch my stats');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching my stats:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new report
  const createReport = useCallback(async (reportData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Map UI fields to backend expected payload
      const payload = {
        threat_type: reportData.threat_type,
        description: reportData.description,
        location: reportData.location,
        urgency: reportData.urgency || 'MEDIUM'
      };
      const response = await apiPost(API_ENDPOINTS.COMMUNITY.REPORTS, payload);
      if (response.ok) {
        const { report } = await response.json();
        setReports(prev => [report, ...prev]);
        return { success: true, report };
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

  // Upload media to a report (accepts File or remote URL)
  const uploadReportMedia = useCallback(async (reportId, fileOrUrl) => {
    try {
      setIsLoading(true);
      setError(null);

      let response;
      if (fileOrUrl instanceof File) {
        const token = localStorage.getItem('authToken');
        const formData = new FormData();
        formData.append('file', fileOrUrl);
        response = await fetch(`${API}${API_ENDPOINTS.COMMUNITY.REPORTS}/${reportId}/media`, {
          method: 'POST',
          headers: {
            ...(token && { 'Authorization': `Bearer ${token}` })
          },
          body: formData
        });
      } else {
        response = await apiPost(`${API_ENDPOINTS.COMMUNITY.REPORTS}/${reportId}/media`, {
          media_url: String(fileOrUrl),
          media_type: 'image'
        });
      }

      if (response.ok) {
        const data = await response.json();
        const media = data.media || data;
        // Optionally update report media in local state
        setReports(prev => prev.map(r => r.id === reportId ? { ...r, media: [...(r.media || []), media] } : r));
        return { success: true, media };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || 'Failed to upload media');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [setReports]);

  // Vote on report
  const voteOnReport = useCallback(async (reportId, voteType) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // voteType should be 'up' | 'down'
      const response = await apiPost(`${API_ENDPOINTS.COMMUNITY.REPORTS}/${reportId}/vote`, {
        vote_type: voteType
      });
      if (response.ok) {
        const data = await response.json();
        const updatedReport = data.report || data;
        // Update the report in the list
        setReports(prev => prev.map(r => 
          r.id === reportId ? { ...updatedReport } : r
        ));
        return { success: true, data: updatedReport };
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
        const updatedReport = data.report || data;
        // Update the report in the list
        setReports(prev => prev.map(r => 
          r.id === reportId ? { ...updatedReport } : r
        ));
        return { success: true, data: updatedReport };
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
        const result = await response.json();
        const newComment = { id: result.comment_id, comment: commentData.comment };
        // Update the report in the list (UI may render simple comments)
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
      // Map UI fields to backend expected payload
      const payload = {
        message: alertData.message,
        severity: (alertData.priority || 'medium').toUpperCase(),
        threat_type: alertData.title
      };
      const response = await apiPost(API_ENDPOINTS.COMMUNITY.ALERTS, payload);
      if (response.ok) {
        const { alert } = await response.json();
        setAlerts(prev => [alert, ...prev]);
        return { success: true, alert };
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
      fetchAlerts(),
      fetchLeaderboard(),
      fetchMyStats()
    ]);
  }, [fetchReports, fetchTrendingThreats, fetchCommunityStats, fetchAlerts, fetchLeaderboard, fetchMyStats]);

  // Clear error
  const clearError = useCallback(() => setError(null), []);

  return {
    reports,
    trendingThreats,
    communityStats,
    alerts,
    leaderboard,
    myStats,
    isLoading,
    error,
    fetchReports,
    fetchTrendingThreats,
    fetchComments,
    deleteComment,
    fetchReportById,
    fetchCommunityStats,
    fetchAlerts,
    fetchLeaderboard,
    fetchMyStats,
    createReport,
    voteOnReport,
    verifyReport,
    addComment,
    createAlert,
    uploadReportMedia,
    loadAllData,
    clearError
  };
};
