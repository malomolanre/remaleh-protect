import React, { useState, useEffect } from 'react'
import { BookOpen, CheckCircle, Search, Shield, ArrowLeft, RefreshCw } from 'lucide-react'
import { MobileCard, MobileCardHeader, MobileCardContent } from './ui/mobile-card'
import { MobileButton } from './ui/mobile-button'
import { MobileInput } from './ui/mobile-input'
import { useAuth } from '../hooks/useAuth'
import { 
  getAllModules, 
  getOverallProgress,
  computeNextRecommendedLesson
} from '../utils/contentManager'

export default function LearnHub({ setActiveTab }) {
  const { isAuthenticated } = useAuth()
  const [selectedModule, setSelectedModule] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [completedLessons, setCompletedLessons] = useState([])
  const [showCompleted, setShowCompleted] = useState(false)
  const [modules, setModules] = useState([])
  const [overallProgress, setOverallProgress] = useState({ completed: 0, total: 0, progress: 0 })
  const [nextLesson, setNextLesson] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const getLessonTypeLabel = (lesson) => {
    const rawType = (lesson?.type || '').toLowerCase()
    if (rawType === 'quiz') return 'Quiz'
    if (rawType === 'assessment') return 'Assessment'
    const ct = (lesson?.contentType || '').toLowerCase()
    switch (ct) {
      case 'info':
        return 'Information'
      case 'tips':
        return 'Tips'
      case 'example':
        return 'Example'
      case 'list':
        return 'List'
      case 'warning':
        return 'Warning'
      case 'warning-signs':
        return 'Warning Signs'
      case 'steps':
        return 'Steps'
      case 'action-list':
        return 'Actions'
      case 'warning-list':
        return 'Warning List'
      case 'markdown':
      case 'html':
        return 'Information'
      default:
        return 'Information'
    }
  }

  const formatDuration = (value) => {
    try {
      if (value === null || value === undefined) return '—'
      if (typeof value === 'number') {
        return `${Math.max(0, value)} min`
      }
      const str = String(value).trim()
      const lower = str.toLowerCase()
      // If it already includes a unit, return as-is
      if (/[a-z]/.test(lower)) {
        // Normalize common shorthand
        if (/(^|\s)(m|mins?)($|\s)/.test(lower)) return str.replace(/\bm\b/i, 'min')
        if (/(^|\s)(s|secs?)($|\s)/.test(lower)) return str.replace(/\bs\b/i, 'sec')
        if (/(^|\s)(h|hrs?)($|\s)/.test(lower)) return str.replace(/\bh\b/i, 'hr')
        return str
      }
      // If it's numeric text, append min
      const num = parseInt(str, 10)
      if (!isNaN(num)) return `${num} min`
      return str
    } catch {
      return String(value)
    }
  }
  
  // Load data from backend APIs
  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    } else {
      // Set loading to false for non-authenticated users
      setLoading(false)
    }
  }, [isAuthenticated])
  
  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // Load modules and progress in parallel
      const [modulesData, progressData] = await Promise.all([
        getAllModules(),
        getOverallProgress()
      ])
      
      setModules(modulesData)
      setOverallProgress(progressData)
      setNextLesson(computeNextRecommendedLesson(modulesData, progressData))
      
      // Avoid extra per-module progress calls; compute view state locally from overallProgress
      
    } catch (err) {
      setError('Failed to load learning content. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Load completed lessons from backend lesson progress data
  useEffect(() => {
    if (overallProgress.lesson_progress_records && overallProgress.lesson_progress_records.length > 0) {
      // Extract completed lesson IDs from lesson progress records
      // IMPORTANT: We need to create unique identifiers that combine module_id and lesson_id
      // because lesson IDs are not globally unique across modules
      const backendCompletedKeys = overallProgress.lesson_progress_records
        .filter(record => record.completed)
        .map(record => `${record.module_id}_${record.lesson_id}`)
      
      // Optional: detect mismatches between backend and frontend (no UI/log output)
      const backendCompletedSet = new Set(backendCompletedKeys)
      const frontendCompletedSet = new Set(completedLessons)
      const missingInFrontend = backendCompletedKeys.filter(key => !frontendCompletedSet.has(key))
      const extraInFrontend = completedLessons.filter(key => !backendCompletedSet.has(key))
      
      // Only update if backend has more completed lessons than local state
      // This prevents overwriting local progress with stale backend data
      if (backendCompletedKeys.length > completedLessons.length) {
        setCompletedLessons(backendCompletedKeys)
      } else if (backendCompletedKeys.length === completedLessons.length) {
        // Check if there are any new keys in backend that aren't in local state
        const newKeys = backendCompletedKeys.filter(key => !completedLessons.includes(key))
        if (newKeys.length > 0) {
          const updatedKeys = [...new Set([...completedLessons, ...newKeys])]
          setCompletedLessons(updatedKeys)
        }
      }
    }
  }, [overallProgress])
  
  // Mark lesson as complete and update backend progress
  const markLessonComplete = async (moduleId, lessonId) => {
    try {
      // Find the module by provided moduleId (avoid cross-module ID collisions)
      const module = modules.find(m => String(m.id) === String(moduleId))
      if (!module) {
        return
      }

      // If already completed, skip backend call
      const lessonKeyPre = `${String(module.id)}_${String(lessonId)}`
      if (completedLessons.includes(lessonKeyPre)) {
        return
      }

      // Update backend lesson progress
      const progressData = {
        completed: true,
        score: 100, // Full score for completing lesson
        completed_at: new Date().toISOString()
      }

      // Import updateLessonProgress function for lesson-level tracking
      const { updateLessonProgress } = await import('../utils/contentManager')
      const result = await updateLessonProgress(module.id, lessonId, progressData)
      // Normalize backend response and ensure completed flag is true
      const backendKey = `${String(result?.progress?.module_id ?? module.id)}_${String(result?.progress?.lesson_id ?? lessonId)}`
      const backendCompleted = Boolean(result?.progress?.completed ?? true)

      // Update local state - prefer backend key if present
      const lessonKey = backendCompleted ? backendKey : `${String(module.id)}_${String(lessonId)}`
      setCompletedLessons(prev => {
        const updated = [...new Set([...prev, lessonKey])]
        return updated
      })
      
      // Optimistically update overall progress locally for instant UI feedback
      setOverallProgress(prev => {
        const prevRecords = Array.isArray(prev?.lesson_progress_records) ? prev.lesson_progress_records : []
        const updatedRecords = [...prevRecords]
        const targetModuleId = result?.progress?.module_id || module.id
        const targetLessonId = result?.progress?.lesson_id || lessonId
        const existingIndex = updatedRecords.findIndex(r => r.module_id === targetModuleId && r.lesson_id === targetLessonId)
        if (existingIndex >= 0) {
          updatedRecords[existingIndex] = { ...updatedRecords[existingIndex], completed: true, score: 100 }
        } else {
          updatedRecords.push({ module_id: targetModuleId, lesson_id: targetLessonId, completed: true, score: 100 })
        }
        const completedCount = updatedRecords.filter(r => r.completed).length
        const totalLessons = prev?.total_lessons || (modules.reduce((acc, m) => acc + (m.content?.lessons?.length || 0), 0))
        const percentage = totalLessons > 0 ? (completedCount / totalLessons) * 100 : prev?.completion_percentage || 0
        const next = {
          ...prev,
          lesson_progress_records: updatedRecords,
          completed_lessons: completedCount,
          completion_percentage: percentage
        }
        // Also optimistically compute next lesson locally
        setNextLesson(computeNextRecommendedLesson(modules, next))
        return next
      })

      // Lightweight refresh: only fetch overall progress and recompute next lesson
      const refreshedProgress = await getOverallProgress()
      // Merge backend progress with local optimistic completion to avoid UI regression
      const localCompletedSet = new Set([...(completedLessons || []), lessonKey])
      const mergedRecords = Array.isArray(refreshedProgress?.lesson_progress_records)
        ? [...refreshedProgress.lesson_progress_records]
        : []
      for (const key of localCompletedSet) {
        const [mIdStr, lIdStr] = key.split('_')
        const mId = Number(mIdStr)
        const lId = Number(lIdStr)
        const idx = mergedRecords.findIndex(r => r.module_id === mId && r.lesson_id === lId)
        if (idx >= 0) {
          mergedRecords[idx] = { ...mergedRecords[idx], completed: true, score: 100 }
        } else {
          mergedRecords.push({ module_id: mId, lesson_id: lId, completed: true, score: 100 })
        }
      }
      const mergedCompletedCount = mergedRecords.filter(r => r.completed).length
      const totalLessonsMerged = refreshedProgress?.total_lessons || (modules.reduce((acc, m) => acc + (m.content?.lessons?.length || 0), 0))
      const mergedPercentage = totalLessonsMerged > 0 ? (mergedCompletedCount / totalLessonsMerged) * 100 : (refreshedProgress?.completion_percentage || 0)
      const mergedProgress = {
        ...refreshedProgress,
        lesson_progress_records: mergedRecords,
        completed_lessons: mergedCompletedCount,
        completion_percentage: mergedPercentage
      }
      setOverallProgress(mergedProgress)
      setNextLesson(computeNextRecommendedLesson(modules, mergedProgress))
    } catch (error) {
      // Fallback to local storage if backend fails
      const fallbackKey = `${selectedModule?.id || 'unknown'}_${lessonId}`
      setCompletedLessons(prev => {
        const updated = [...new Set([...prev, fallbackKey])]
        return updated
      })
      try {
        const tentative = [...new Set([...completedLessons, fallbackKey])]
        localStorage.setItem('remaleh-completed-lessons', JSON.stringify(tentative))
      } catch {}
    }
  }
  
  // Get filtered modules based on search and difficulty
  const getFilteredModules = () => {
    let filtered = modules
    
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(module => (module.difficulty || '').toLowerCase() === difficultyFilter)
    }
    
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(module => 
        module.title.toLowerCase().includes(searchLower) ||
        (module.description && module.description.toLowerCase().includes(searchLower))
      )
    }
    
    return filtered
  }
  
  const filteredModules = getFilteredModules()

  // Show authentication required message for non-authenticated users
  if (!isAuthenticated) {
    return (
      <div className="space-y-6 p-4">
        <MobileCard>
          <div className="text-center py-8">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-6">Please log in to access the Learning Hub and track your progress.</p>
            <MobileButton 
              onClick={() => setActiveTab('login')}
              className="bg-[#21a1ce] hover:bg-[#1a8bb8] text-white"
            >
              Go to Login
            </MobileButton>
          </div>
        </MobileCard>
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 max-w-3xl mx-auto w-full overflow-x-hidden break-words">
      {/* Header centered like Community Hub */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-3">
          <div className="w-10 h-10 bg-[#21a1ce] rounded-lg flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Learning Hub</h1>
        <p className="text-gray-600 text-sm">Remaleh isn't just about learning it's about doing. Stuck or unsure? A Remaleh Guardian will guide you step-by-step until you're confident, capable, and ready to take action.</p>
        <div className="mt-2">
          <button
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-50 text-sm text-gray-700"
            title="Refresh content"
          >
            <RefreshCw className={`w-4 h-4 text-gray-600 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800">{error}</p>
          <button 
            onClick={loadData}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Progress Overview */}
      <MobileCard className="mb-4">
        <MobileCardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Progress</h3>
            <div className="text-sm text-gray-600">
              {loading ? 'Loading...' : `${overallProgress.completed_modules || 0}/${overallProgress.total_modules || 0} modules`}
            </div>
          </div>
        </MobileCardHeader>
        <MobileCardContent>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-[#21a1ce] h-2 rounded-full transition-all duration-300" 
              style={{ width: `${overallProgress.completion_percentage || 0}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{loading ? 'Loading...' : `${Math.round(overallProgress.completion_percentage || 0)}% Complete`}</span>
            
            {/* Debug Progress Bar Values */}
            
            {nextLesson && (
              <span className="text-sm text-[#21a1ce] font-medium">
                Next: {nextLesson.lesson_title}
              </span>
            )}
          </div>
          
        </MobileCardContent>
      </MobileCard>

      {/* Remaleh Guardian Support */}
      <MobileCard className="mb-4">
        <MobileCardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-[#21a1ce] rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Need Help Implementing?</h3>
                <p className="text-sm text-gray-600">Don't struggle alone - get expert guidance</p>
              </div>
            </div>
            <a
              href="https://www.remaleh.com.au/contact-us"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-[#21a1ce] hover:bg-[#1a8bb8] text-white rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap self-start sm:self-auto"
            >
              Connect with a Remaleh Guardian
            </a>
          </div>
        </MobileCardHeader>
        <MobileCardContent>
          <p className="text-gray-700 mb-4 text-sm">
            Learning is just the first step. When you're ready to implement cybersecurity measures, our Remaleh Guardians are here to guide you through every step of the process.
          </p>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-[#21a1ce] rounded-full mt-2"></div>
              <div className="text-sm text-gray-700">
                <span className="font-medium">Personal Guidance:</span> One-on-one support for your specific situation
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-[#21a1ce] rounded-full mt-2"></div>
              <div className="text-sm text-gray-700">
                <span className="font-medium">Step-by-Step Implementation:</span> We'll walk you through each process
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-[#21a1ce] rounded-full mt-2"></div>
              <div className="text-sm text-gray-700">
                <span className="font-medium">Ongoing Support:</span> We're here until you feel confident and empowered
              </div>
            </div>
          </div>
          
        </MobileCardContent>
      </MobileCard>

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <MobileInput
            type="text"
            placeholder="Search learning content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <MobileButton
            onClick={() => setDifficultyFilter('all')}
            variant={difficultyFilter === 'all' ? 'primary' : 'secondary'}
            className="text-sm px-3 py-2"
          >
            All
          </MobileButton>
          <MobileButton
            onClick={() => setDifficultyFilter('beginner')}
            variant={difficultyFilter === 'beginner' ? 'primary' : 'secondary'}
            className="text-sm px-3 py-2"
          >
            Beginner
          </MobileButton>
          <MobileButton
            onClick={() => setDifficultyFilter('intermediate')}
            variant={difficultyFilter === 'intermediate' ? 'primary' : 'secondary'}
            className="text-sm px-3 py-2"
          >
            Intermediate
          </MobileButton>
          <MobileButton
            onClick={() => setDifficultyFilter('advanced')}
            variant={difficultyFilter === 'advanced' ? 'primary' : 'secondary'}
            className="text-sm px-3 py-2"
          >
            Advanced
          </MobileButton>
        </div>
      </div>

      {/* Main Content */}
      {!selectedModule ? (
        /* Module Selection View */
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#21a1ce] mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading learning modules...</p>
            </div>
          ) : filteredModules.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No learning modules found</p>
              <p className="text-sm text-gray-500">Check back later for new content</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredModules.map(module => {
              const lessonCount = module.content?.lessons?.length || 0
              const completedLessonsInModule = module.content?.lessons?.filter(lesson => 
                completedLessons.includes(`${String(module.id)}_${String(lesson.id)}`)
              ).length || 0
              const progressPercent = lessonCount > 0 ? (completedLessonsInModule / lessonCount) * 100 : 0
              
              return (
                <MobileCard 
                  key={module.id}
                  className="cursor-pointer transition-colors hover:bg-gray-50 overflow-hidden"
                  padding="p-3"
                  onClick={() => setSelectedModule(module)}
                >
                  <MobileCardHeader className="mb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="w-9 h-9 bg-[#21a1ce] rounded-lg flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0 break-words">
                          <h3 className="text-base font-semibold text-gray-900 truncate">{module.title}</h3>
                          <p className="text-xs text-gray-600 leading-5 max-h-[2.5rem] overflow-hidden break-words">{module.description}</p>
                          <div className="flex items-center space-x-3 text-[11px] text-gray-500 mt-1">
                            <span>{lessonCount} lessons</span>
                            <span>{module.estimated_time} min</span>
                            <span className="capitalize">{module.difficulty}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right ml-2 flex-shrink-0">
                        <div className="text-xs font-medium text-[#21a1ce]">{Math.round(progressPercent)}%</div>
                        <div className="text-[11px] text-gray-500">{completedLessonsInModule}/{lessonCount}</div>
                      </div>
                    </div>
                  </MobileCardHeader>
                  <MobileCardContent>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="bg-[#21a1ce] h-1.5 rounded-full transition-all duration-300" 
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </MobileCardContent>
                </MobileCard>
              )
              })}
            </div>
          )}
        </div>
      ) : !selectedLesson ? (
        /* Lesson Selection View */
        <div>
          <div className="flex items-center mb-4">
            <button 
              onClick={() => setSelectedModule(null)}
              className="flex items-center text-[#21a1ce] hover:underline text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to modules
            </button>
          </div>
          
          <MobileCard>
            <MobileCardHeader>
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white`} 
                     style={{ backgroundColor: selectedModule.color }}>
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900">{selectedModule.title}</h2>
                  <p className="text-gray-600">{selectedModule.description}</p>
                  
                  {/* Module Progress Bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{selectedModule.content?.lessons?.filter(lesson => 
                        completedLessons.includes(`${String(selectedModule.id)}_${String(lesson.id)}`)
                      ).length || 0}/{selectedModule.content?.lessons?.length || 0} lessons</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#21a1ce] h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${selectedModule.content?.lessons?.length > 0 ? 
                            (selectedModule.content.lessons.filter(lesson => 
                              completedLessons.includes(`${String(selectedModule.id)}_${String(lesson.id)}`)
                            ).length / selectedModule.content.lessons.length) * 100 : 0
                          }%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </MobileCardHeader>
            
            <MobileCardContent>
              <div className="space-y-3">
                {selectedModule.content?.lessons?.map(lesson => {
                  const lessonKey = `${String(selectedModule.id)}_${String(lesson.id)}`
                  const isCompleted = completedLessons.includes(lessonKey)
                  
                  return (
                    <div 
                      key={lesson.id} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => setSelectedLesson(lesson)}
                    >
                      <div className="flex items-center space-x-3">
                        {isCompleted ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                        )}
                        <div>
                          <h4 className="font-medium">{lesson.title}</h4>
                          <p className="text-sm text-gray-600">{formatDuration(lesson.duration)} • {getLessonTypeLabel(lesson)}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {lesson.contentType === 'warning' && (
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        )}
                        {lesson.contentType === 'example' && (
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        )}
                        <ArrowLeft className="w-4 h-4 text-gray-400 transform rotate-180" />
                      </div>
                      
                    </div>
                  )
                })}
              </div>
            </MobileCardContent>
          </MobileCard>
        </div>
      ) : (
        /* Lesson Content View */
        <div>
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setSelectedLesson(null)}
              className="flex items-center text-[#21a1ce] hover:underline text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to lessons
            </button>
            {!completedLessons.includes(`${String(selectedModule.id)}_${String(selectedLesson.id)}`) && (
              <MobileButton 
                onClick={() => markLessonComplete(selectedModule.id, selectedLesson.id)}
                variant="primary"
                size="sm"
              >
                Mark Complete
              </MobileButton>
            )}
          </div>
          
          <MobileCard>
            <MobileCardHeader>
              <h2 className="text-xl font-bold text-gray-900">{selectedLesson.title}</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>{formatDuration(selectedLesson.duration)}</span>
                <span>•</span>
                <span>{getLessonTypeLabel(selectedLesson)}</span>
              </div>
            </MobileCardHeader>
            
            <MobileCardContent>
              <LessonContent lesson={selectedLesson} />
            </MobileCardContent>
          </MobileCard>
        </div>
      )}
    </div>
  )
}













function LessonContent({ lesson }) {
  const sanitizeHtml = (html) => {
    if (!html) return ''
    // Remove script/style and on* attributes
    let safe = html.replace(/<\/(?:script|style)>/gi, '\n')
    safe = safe.replace(/<\s*(script|style)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    safe = safe.replace(/ on[a-z]+\s*=\s*"[^"]*"/gi, '')
    safe = safe.replace(/ on[a-z]+\s*=\s*'[^']*'/gi, '')
    safe = safe.replace(/ on[a-z]+\s*=\s*[^\s>]+/gi, '')
    return safe
  }

  const markdownToHtml = (md) => {
    if (!md) return ''
    let out = md
    // Escape HTML first
    out = out.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    // Headings
    out = out.replace(/^### (.*)$/gm, '<h4 class="font-semibold text-gray-900 mb-2">$1</h4>')
             .replace(/^## (.*)$/gm, '<h3 class="font-semibold text-gray-900 mb-2">$1</h3>')
             .replace(/^# (.*)$/gm, '<h2 class="font-bold text-gray-900 mb-2">$1</h2>')
    // Bold
    out = out.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Links [text](url)
    out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-[#21a1ce] underline">$1</a>')
    // Bullet lines starting with - or *
    out = out.replace(/^(?:- |\* )(.*)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> into <ul>
    out = out.replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul class="list-disc list-inside space-y-1">${m}\n</ul>`) 
    // Line breaks
    out = out.replace(/\n\n/g, '<br/><br/>').replace(/\n/g, '<br/>')
    return out
  }
  const getContentStyle = (style) => {
    switch (style) {
      case 'blue':
        return 'bg-blue-50 border-blue-200'
      case 'yellow':
        return 'bg-yellow-50 border-yellow-200'
      case 'red':
        return 'bg-red-50 border-red-200'
      case 'green':
        return 'bg-green-50 border-green-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const renderContent = () => {
    switch (lesson.contentType) {
      case 'tips':
        return (
          <div className="space-y-4">
            <div className="text-gray-700 whitespace-pre-line break-words">{lesson.content}</div>
            <div className="space-y-3">
              {lesson.tips?.map((tip, index) => (
                <div key={index} className="flex items-start">
                  <div className="p-1 rounded-full mr-3 mt-1 bg-green-100">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <div>
                    <p className="font-medium whitespace-pre-line">{tip.title}</p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'warning-signs':
        return (
          <div className="space-y-4">
            <div className="text-gray-700 whitespace-pre-line break-words">{lesson.content}</div>
            <div className="space-y-3">
              {lesson.signs?.map((sign, index) => (
                <div key={index} className="flex items-start">
                  <div className={`p-1 rounded-full mr-3 mt-1 ${sign.danger ? 'bg-red-100' : 'bg-green-100'}`}>
                    <div className={`w-2 h-2 rounded-full ${sign.danger ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  </div>
                  <div>
                    <p className="font-medium whitespace-pre-line">{sign.title}</p>
                    <p className="text-sm text-gray-600 whitespace-pre-line">{sign.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'steps':
        return (
          <div className="space-y-4">
            <div className="text-gray-700 whitespace-pre-line break-words">{lesson.content}</div>
            <div className="space-y-2">
              {lesson.steps?.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-[#21a1ce] text-white text-sm font-bold flex items-center justify-center mr-3 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-700 whitespace-pre-line">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'list':
        return (
          <div className="space-y-4">
            <div className="text-gray-700 whitespace-pre-line">{lesson.content}</div>
            <ul className="space-y-2 ml-4">
              {lesson.items?.map((item, index) => (
                <li key={index} className="text-gray-700 whitespace-pre-line">• {item}</li>
              ))}
            </ul>
          </div>
        )
      
      case 'warning':
      case 'warning-list':
        return (
          <div className={`p-4 rounded-lg border ${getContentStyle(lesson.contentStyle)} break-words`}>
            <h4 className="font-bold mb-2 text-red-800">Important</h4>
            <div className="text-red-700 mb-3 whitespace-pre-line break-words">{lesson.content}</div>
            {lesson.items && (
              <ul className="space-y-1 text-red-700">
                {lesson.items.map((item, index) => (
                  <li key={index} className="whitespace-pre-line">• {item}</li>
                ))}
              </ul>
            )}
          </div>
        )
      
      case 'action-list':
        return (
          <div className={`p-4 rounded-lg border ${getContentStyle(lesson.contentStyle)} break-words`}>
            <h4 className="font-bold mb-2 text-green-800">Actions to Take</h4>
            <div className="text-green-700 mb-3 whitespace-pre-line break-words">{lesson.content}</div>
            <ul className="space-y-1 text-green-700">
              {lesson.actions?.map((action, index) => (
                <li key={index} className="whitespace-pre-line">• {action}</li>
              ))}
            </ul>
          </div>
        )
      
      case 'example':
        return (
          <div className={`p-4 rounded-lg border ${getContentStyle(lesson.contentStyle)} break-words`}>
            <h4 className="font-bold mb-2">Real-World Example</h4>
            <div className="text-gray-700 whitespace-pre-line break-words">{lesson.content}</div>
          </div>
        )
      
      case 'markdown':
        return (
          <div className={`p-4 rounded-lg border ${getContentStyle(lesson.contentStyle)} break-words`}>
            <div className="prose prose-sm max-w-none break-words" dangerouslySetInnerHTML={{ __html: sanitizeHtml(markdownToHtml(lesson.content)) }} />
          </div>
        )

      case 'html':
        return (
          <div className={`p-4 rounded-lg border ${getContentStyle(lesson.contentStyle)} break-words`}>
            <div className="prose prose-sm max-w-none break-words" dangerouslySetInnerHTML={{ __html: sanitizeHtml(lesson.content) }} />
          </div>
        )

      default:
        return (
          <div className={`p-4 rounded-lg border ${getContentStyle(lesson.contentStyle)} break-words`}>
            <div className="text-gray-700 whitespace-pre-line break-words">{lesson.content}</div>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6 break-words">
      {renderContent()}
      {Array.isArray(lesson.media) && lesson.media.length > 0 && (
        <div className="space-y-3">
          {lesson.media.map((item, idx) => (
            <div key={idx} className="space-y-2">
              {item.type === 'image' ? (
                <img
                  src={item.url}
                  alt={item.caption || lesson.title}
                  className="w-full max-h-72 object-cover rounded-lg border border-gray-200"
                  loading="lazy"
                />
              ) : item.type === 'video' ? (
                <video
                  controls
                  className="w-full max-h-80 rounded-lg border border-gray-200"
                >
                  <source src={item.url} />
                  Your browser does not support the video tag.
                </video>
              ) : null}
              {item.caption && (
                <div className="text-xs text-gray-500">{item.caption}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


