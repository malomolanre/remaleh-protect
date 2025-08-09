import { useState, useEffect, useCallback } from 'react';
import { API_ENDPOINTS, apiGet, apiPost, apiPut } from '../lib/api';

export const useRiskProfile = () => {
  const [profile, setProfile] = useState(null);
  const [scans, setScans] = useState([]);
  const [learningModules, setLearningModules] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user risk profile
  const fetchProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiGet(API_ENDPOINTS.RISK_PROFILE.PROFILE);
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        return data;
      } else {
        throw new Error('Failed to fetch risk profile');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch scan history
  const fetchScans = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiGet(API_ENDPOINTS.RISK_PROFILE.SCANS);
      if (response.ok) {
        const data = await response.json();
        setScans(data.scans || data);
        return data;
      } else {
        throw new Error('Failed to fetch scan history');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching scans:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch learning modules
  const fetchLearningModules = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiGet(API_ENDPOINTS.RISK_PROFILE.LEARNING);
      if (response.ok) {
        const data = await response.json();
        setLearningModules(data.modules || data);
        return data;
      } else {
        throw new Error('Failed to fetch learning modules');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching learning modules:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch recommendations
  const fetchRecommendations = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiGet(API_ENDPOINTS.RISK_PROFILE.RECOMMENDATIONS);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations || data);
        return data;
      } else {
        throw new Error('Failed to fetch recommendations');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Start learning module
  const startLearningModule = useCallback(async (moduleId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiPost(`${API_ENDPOINTS.RISK_PROFILE.LEARNING}/${moduleId}/start`);
      if (response.ok) {
        const data = await response.json();
        // Update the module in the list
        setLearningModules(prev => prev.map(m => 
          m.id === moduleId ? { ...m, status: 'in_progress', started_at: data.started_at } : m
        ));
        return { success: true, data };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start learning module');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Complete learning module
  const completeLearningModule = useCallback(async (moduleId) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiPost(`${API_ENDPOINTS.RISK_PROFILE.LEARNING}/${moduleId}/complete`);
      if (response.ok) {
        const data = await response.json();
        // Update the module in the list
        setLearningModules(prev => prev.map(m => 
          m.id === moduleId ? { ...m, status: 'completed', completed_at: data.completed_at } : m
        ));
        return { success: true, data };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete learning module');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create new learning module
  const createLearningModule = useCallback(async (moduleData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiPost(API_ENDPOINTS.RISK_PROFILE.LEARNING, moduleData);
      if (response.ok) {
        const newModule = await response.json();
        setLearningModules(prev => [newModule, ...prev]);
        return { success: true, module: newModule };
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create learning module');
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
      fetchProfile(),
      fetchScans(),
      fetchLearningModules(),
      fetchRecommendations()
    ]);
  }, [fetchProfile, fetchScans, fetchLearningModules, fetchRecommendations]);

  // Clear error
  const clearError = useCallback(() => setError(null), []);

  return {
    profile,
    scans,
    learningModules,
    recommendations,
    isLoading,
    error,
    fetchProfile,
    fetchScans,
    fetchLearningModules,
    fetchRecommendations,
    startLearningModule,
    completeLearningModule,
    createLearningModule,
    loadAllData,
    clearError
  };
};
