/**
 * Content Management Utility for Remaleh Protect Learning Hub
 * This makes it easy to update learning content without code changes
 */

import { apiPost, apiGet } from '../lib/api'

// Backend API endpoints
const API_ENDPOINTS = {
  MODULES: '/api/learning/modules',
  MODULE: (id) => `/api/learning/modules/${id}`,
  LESSONS: (moduleId) => `/api/learning/modules/${moduleId}/lessons`,
  LESSON: (moduleId, lessonId) => `/api/learning/modules/${moduleId}/lessons/${lessonId}`,
  PROGRESS: (moduleId) => `/api/learning/modules/${moduleId}/progress`,
  PROGRESS_OVERVIEW: '/api/learning/progress/overview',
  EXPORT: '/api/learning/content/export',
  IMPORT: '/api/learning/content/import'
}

// Fallback to local storage if backend is unavailable
const FALLBACK_STORAGE_KEY = 'learning_content_fallback'

// Get all learning modules from backend
export const getAllModules = async () => {
  try {
    const response = await apiGet(API_ENDPOINTS.MODULES)
    if (response.ok) {
      const data = await response.json()
      // Store in fallback storage
      localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(data))
      return data.modules || []
    }
  } catch (error) {
    console.warn('Backend unavailable, using fallback data:', error)
  }
  
  // Fallback to local storage or default content
  try {
    const fallbackData = localStorage.getItem(FALLBACK_STORAGE_KEY)
    if (fallbackData) {
      return JSON.parse(fallbackData).modules || []
    }
  } catch (error) {
    console.warn('Fallback data unavailable:', error)
  }
  
  // Return empty array if no data available
  return []
}

// Get specific module by ID
export const getModuleById = async (moduleId) => {
  try {
    const response = await apiGet(API_ENDPOINTS.MODULE(moduleId))
    if (response.ok) {
      const data = await response.json()
      return data
    }
  } catch (error) {
    console.warn('Backend unavailable, using fallback data:', error)
  }
  
  // Fallback to local storage
  try {
    const fallbackData = localStorage.getItem(FALLBACK_STORAGE_KEY)
    if (fallbackData) {
      const modules = JSON.parse(fallbackData).modules || []
      return modules.find(m => m.id === moduleId)
    }
  } catch (error) {
    console.warn('Fallback data unavailable:', error)
  }
  
  return null
}

// Get specific lesson by ID
export const getLessonById = async (moduleId, lessonId) => {
  try {
    const module = await getModuleById(moduleId)
    if (module && module.content && module.content.lessons) {
      return module.content.lessons.find(l => l.id === lessonId)
    }
  } catch (error) {
    console.warn('Error getting lesson:', error)
  }
  
  return null
}

// Get module progress for current user
export const getModuleProgress = async (moduleId) => {
  try {
    const response = await apiGet(API_ENDPOINTS.PROGRESS(moduleId))
    if (response.ok) {
      const data = await response.json()
      return data
    }
  } catch (error) {
    console.warn('Backend unavailable, using local progress:', error)
  }
  
  // Fallback to local storage
  try {
    const localProgress = localStorage.getItem(`module_progress_${moduleId}`)
    if (localProgress) {
      return JSON.parse(localProgress)
    }
  } catch (error) {
    console.warn('Local progress unavailable:', error)
  }
  
  return {
    module_id: moduleId,
    completed: false,
    score: 0,
    started_at: null,
    completed_at: null
  }
}

// Get overall learning progress
export const getOverallProgress = async () => {
  try {
    const response = await apiGet(API_ENDPOINTS.PROGRESS_OVERVIEW)
    if (response.ok) {
      const data = await response.json()
      return data
    }
  } catch (error) {
    console.warn('Backend unavailable, using local progress:', error)
  }
  
  // Fallback to local calculation
  try {
    const modules = await getAllModules()
    const completedModules = modules.filter(m => {
      const progress = localStorage.getItem(`module_progress_${m.id}`)
      return progress && JSON.parse(progress).completed
    }).length
    
    return {
      total_modules: modules.length,
      completed_modules: completedModules,
      completion_percentage: modules.length > 0 ? (completedModules / modules.length * 100) : 0,
      total_score: 0,
      average_score: 0
    }
  } catch (error) {
    console.warn('Local progress calculation failed:', error)
    return {
      total_modules: 0,
      completed_modules: 0,
      completion_percentage: 0,
      total_score: 0,
      average_score: 0
    }
  }
}

// Get next recommended lesson
export const getNextRecommendedLesson = async () => {
  try {
    const modules = await getAllModules()
    const overallProgress = await getOverallProgress()
    
    // Find first incomplete module
    for (const module of modules) {
      const progress = await getModuleProgress(module.id)
      if (!progress.completed) {
        return {
          module_id: module.id,
          module_title: module.title,
          lesson_id: 1, // Start with first lesson
          lesson_title: module.content?.lessons?.[0]?.title || 'Introduction'
        }
      }
    }
    
    return null // All modules completed
  } catch (error) {
    console.warn('Error getting next recommended lesson:', error)
    return null
  }
}

// Get learning statistics
export const getLearningStats = async () => {
  try {
    const overallProgress = await getOverallProgress()
    const modules = await getAllModules()
    
    return {
      ...overallProgress,
      total_lessons: modules.reduce((total, m) => {
        return total + (m.content?.lessons?.length || 0)
      }, 0),
      estimated_total_time: modules.reduce((total, m) => {
        return total + (m.estimated_time || 0)
      }, 0)
    }
  } catch (error) {
    console.warn('Error getting learning stats:', error)
    return {
      total_modules: 0,
      completed_modules: 0,
      completion_percentage: 0,
      total_lessons: 0,
      estimated_total_time: 0
    }
  }
}

// Search learning content
export const searchLearningContent = async (query) => {
  try {
    const modules = await getAllModules()
    const results = []
    
    const searchTerm = query.toLowerCase()
    
    for (const module of modules) {
      // Search in module title and description
      if (module.title.toLowerCase().includes(searchTerm) ||
          module.description.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'module',
          id: module.id,
          title: module.title,
          description: module.description,
          difficulty: module.difficulty
        })
      }
      
      // Search in lesson content
      if (module.content && module.content.lessons) {
        for (const lesson of module.content.lessons) {
          if (lesson.title.toLowerCase().includes(searchTerm) ||
              lesson.content.toLowerCase().includes(searchTerm)) {
            results.push({
              type: 'lesson',
              module_id: module.id,
              module_title: module.title,
              id: lesson.id,
              title: lesson.title,
              content: lesson.content.substring(0, 100) + '...'
            })
          }
        }
      }
    }
    
    return results
  } catch (error) {
    console.warn('Error searching content:', error)
    return []
  }
}

// Get content by difficulty level
export const getContentByDifficulty = async (difficulty) => {
  try {
    const modules = await getAllModules()
    return modules.filter(m => m.difficulty === difficulty)
  } catch (error) {
    console.warn('Error getting content by difficulty:', error)
    return []
  }
}

// Get quick tips (first lesson from each module)
export const getQuickTips = async () => {
  try {
    const modules = await getAllModules()
    const tips = []
    
    for (const module of modules) {
      if (module.content && module.content.lessons && module.content.lessons.length > 0) {
        const firstLesson = module.content.lessons[0]
        tips.push({
          module_id: module.id,
          module_title: module.title,
          lesson_id: firstLesson.id,
          lesson_title: firstLesson.title,
          content: firstLesson.content.substring(0, 150) + '...',
          difficulty: module.difficulty,
          estimated_time: module.estimated_time
        })
      }
    }
    
    return tips
  } catch (error) {
    console.warn('Error getting quick tips:', error)
    return []
  }
}

// Get content update information
export const getContentUpdateInfo = async () => {
  try {
    const response = await apiGet(API_ENDPOINTS.EXPORT)
    if (response.ok) {
      const data = await response.json()
      return data.metadata
    }
  } catch (error) {
    console.warn('Backend unavailable, using fallback data:', error)
  }
  
  // Fallback to local storage
  try {
    const fallbackData = localStorage.getItem(FALLBACK_STORAGE_KEY)
    if (fallbackData) {
      const data = JSON.parse(fallbackData)
      return data.metadata || {
        version: '1.0',
        last_updated: new Date().toISOString(),
        total_modules: 0,
        total_lessons: 0
      }
    }
  } catch (error) {
    console.warn('Fallback data unavailable:', error)
  }
  
  return {
    version: '1.0',
    last_updated: new Date().toISOString(),
    total_modules: 0,
    total_lessons: 0
  }
}

// Admin functions for content management
export const createModule = async (moduleData) => {
  try {
    const response = await apiPost(API_ENDPOINTS.MODULES, moduleData)
    if (response.ok) {
      const data = await response.json()
      // Refresh local cache
      await getAllModules()
      return data
    } else {
      throw new Error('Failed to create module')
    }
  } catch (error) {
    console.error('Error creating module:', error)
    throw error
  }
}

export const updateModule = async (moduleId, moduleData) => {
  try {
    const response = await apiPost(API_ENDPOINTS.MODULE(moduleId), moduleData, 'PUT')
    if (response.ok) {
      const data = await response.json()
      // Refresh local cache
      await getAllModules()
      return data
    } else {
      throw new Error('Failed to update module')
    }
  } catch (error) {
    console.error('Error updating module:', error)
    throw error
  }
}

export const deleteModule = async (moduleId) => {
  try {
    const response = await apiPost(API_ENDPOINTS.MODULE(moduleId), {}, 'DELETE')
    if (response.ok) {
      // Refresh local cache
      await getAllModules()
      return { message: 'Module deleted successfully' }
    } else {
      throw new Error('Failed to delete module')
    }
  } catch (error) {
    console.error('Error deleting module:', error)
    throw error
  }
}

export const addLesson = async (moduleId, lessonData) => {
  try {
    const response = await apiPost(API_ENDPOINTS.LESSONS(moduleId), lessonData)
    if (response.ok) {
      const data = await response.json()
      // Refresh local cache
      await getAllModules()
      return data
    } else {
      throw new Error('Failed to add lesson')
    }
  } catch (error) {
    console.error('Error adding lesson:', error)
    throw error
  }
}

export const updateLesson = async (moduleId, lessonId, lessonData) => {
  try {
    const response = await apiPost(API_ENDPOINTS.LESSON(moduleId, lessonId), lessonData, 'PUT')
    if (response.ok) {
      const data = await response.json()
      // Refresh local cache
      await getAllModules()
      return data
    } else {
      throw new Error('Failed to update lesson')
    }
  } catch (error) {
    console.error('Error updating lesson:', error)
    throw error
  }
}

export const deleteLesson = async (moduleId, lessonId) => {
  try {
    const response = await apiPost(API_ENDPOINTS.LESSON(moduleId, lessonId), {}, 'DELETE')
    if (response.ok) {
      // Refresh local cache
      await getAllModules()
      return { message: 'Lesson deleted successfully' }
    } else {
      throw new Error('Failed to delete lesson')
    }
  } catch (error) {
    console.error('Error deleting lesson:', error)
    throw error
  }
}

// Update user progress
export const updateProgress = async (moduleId, progressData) => {
  try {
    const response = await apiPost(API_ENDPOINTS.PROGRESS(moduleId), progressData)
    if (response.ok) {
      const data = await response.json()
      // Also store locally as backup
      localStorage.setItem(`module_progress_${moduleId}`, JSON.stringify(data.progress))
      return data
    } else {
      throw new Error('Failed to update progress')
    }
  } catch (error) {
    console.warn('Backend unavailable, storing progress locally:', error)
    // Store locally as fallback
    const localProgress = {
      module_id: moduleId,
      completed: progressData.completed || false,
      score: progressData.score || 0,
      started_at: new Date().toISOString(),
      completed_at: progressData.completed ? new Date().toISOString() : null
    }
    localStorage.setItem(`module_progress_${moduleId}`, JSON.stringify(localProgress))
    return { progress: localProgress }
  }
}

// Export content (admin only)
export const exportContent = async () => {
  try {
    const response = await apiGet(API_ENDPOINTS.EXPORT)
    if (response.ok) {
      const data = await response.json()
      return data
    } else {
      throw new Error('Failed to export content')
    }
  } catch (error) {
    console.error('Error exporting content:', error)
    throw error
  }
}

// Import content (admin only)
export const importContent = async (contentData) => {
  try {
    const response = await apiPost(API_ENDPOINTS.IMPORT, contentData)
    if (response.ok) {
      const data = await response.json()
      // Refresh local cache
      await getAllModules()
      return data
    } else {
      throw new Error('Failed to import content')
    }
  } catch (error) {
    console.error('Error importing content:', error)
    throw error
  }
}
