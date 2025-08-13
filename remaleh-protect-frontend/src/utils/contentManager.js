/**
 * Content Management Utility for Remaleh Protect Learning Hub
 * This makes it easy to update learning content without code changes
 */

import learningContent from '../data/learning-content.json'

/**
 * Get all learning modules
 */
export const getAllModules = () => {
  return learningContent.modules
}

/**
 * Get a specific module by ID
 */
export const getModuleById = (moduleId) => {
  return learningContent.modules.find(module => module.id === moduleId)
}

/**
 * Get a specific lesson by module and lesson ID
 */
export const getLessonById = (moduleId, lessonId) => {
  const module = getModuleById(moduleId)
  if (!module) return null
  
  return module.lessons.find(lesson => lesson.id === lessonId)
}

/**
 * Get module progress for a user
 */
export const getModuleProgress = (moduleId, completedLessons = []) => {
  const module = getModuleById(moduleId)
  if (!module) return { progress: 0, completed: 0, total: 0 }
  
  const completed = completedLessons.filter(lessonId => 
    module.lessons.some(lesson => lesson.id === lessonId)
  ).length
  
  const total = module.lessons.length
  const progress = Math.round((completed / total) * 100)
  
  return { progress, completed, total }
}

/**
 * Get overall learning progress
 */
export const getOverallProgress = (completedLessons = []) => {
  const totalLessons = learningContent.metadata.totalLessons
  const completed = completedLessons.length
  const progress = Math.round((completed / totalLessons) * 100)
  
  return { progress, completed, total: totalLessons }
}

/**
 * Get next recommended lesson
 */
export const getNextRecommendedLesson = (completedLessons = []) => {
  for (const module of learningContent.modules) {
    for (const lesson of module.lessons) {
      if (!completedLessons.includes(lesson.id)) {
        return {
          moduleId: module.id,
          moduleTitle: module.title,
          lessonId: lesson.id,
          lessonTitle: lesson.title,
          estimatedTime: lesson.duration
        }
      }
    }
  }
  return null
}

/**
 * Get learning statistics
 */
export const getLearningStats = () => {
  return {
    totalModules: learningContent.metadata.totalModules,
    totalLessons: learningContent.metadata.totalLessons,
    totalEstimatedTime: learningContent.modules.reduce((total, module) => {
      const moduleTime = module.lessons.reduce((sum, lesson) => {
        const timeStr = lesson.duration
        const minutes = parseInt(timeStr.match(/(\d+)/)?.[1] || '0')
        return sum + minutes
      }, 0)
      return total + moduleTime
    }, 0),
    difficultyBreakdown: learningContent.modules.reduce((acc, module) => {
      acc[module.difficulty] = (acc[module.difficulty] || 0) + 1
      return acc
    }, {}),
    lastUpdated: learningContent.metadata.lastUpdated
  }
}

/**
 * Search learning content
 */
export const searchLearningContent = (query) => {
  const searchTerm = query.toLowerCase()
  const results = []
  
  for (const module of learningContent.modules) {
    // Search in module title and subtitle
    if (module.title.toLowerCase().includes(searchTerm) || 
        module.subtitle.toLowerCase().includes(searchTerm)) {
      results.push({
        type: 'module',
        id: module.id,
        title: module.title,
        subtitle: module.subtitle,
        match: 'title'
      })
    }
    
    // Search in lessons
    for (const lesson of module.lessons) {
      if (lesson.title.toLowerCase().includes(searchTerm) || 
          lesson.content.toLowerCase().includes(searchTerm)) {
        results.push({
          type: 'lesson',
          moduleId: module.id,
          moduleTitle: module.title,
          lessonId: lesson.id,
          title: lesson.title,
          match: lesson.title.toLowerCase().includes(searchTerm) ? 'title' : 'content'
        })
      }
    }
  }
  
  return results
}

/**
 * Get content by difficulty level
 */
export const getContentByDifficulty = (difficulty) => {
  return learningContent.modules.filter(module => module.difficulty === difficulty)
}

/**
 * Get quick tips for a specific topic
 */
export const getQuickTips = (topic) => {
  const tips = []
  
  for (const module of learningContent.modules) {
    for (const lesson of module.lessons) {
      if (lesson.contentType === 'tips' && lesson.tips) {
        tips.push(...lesson.tips.map(tip => ({
          ...tip,
          module: module.title,
          lesson: lesson.title
        })))
      }
    }
  }
  
  // Filter by topic if specified
  if (topic) {
    const topicLower = topic.toLowerCase()
    return tips.filter(tip => 
      tip.title.toLowerCase().includes(topicLower) ||
      tip.description.toLowerCase().includes(topicLower)
    )
  }
  
  return tips
}

/**
 * Get content update info
 */
export const getContentUpdateInfo = () => {
  return {
    version: learningContent.metadata.version,
    lastUpdated: learningContent.metadata.lastUpdated,
    totalModules: learningContent.metadata.totalModules,
    totalLessons: learningContent.metadata.totalLessons
  }
}

export default {
  getAllModules,
  getModuleById,
  getLessonById,
  getModuleProgress,
  getOverallProgress,
  getNextRecommendedLesson,
  getLearningStats,
  searchLearningContent,
  getContentByDifficulty,
  getQuickTips,
  getContentUpdateInfo
}
