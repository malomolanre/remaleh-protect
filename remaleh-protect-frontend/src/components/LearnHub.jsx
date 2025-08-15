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
      console.error('Error loading learning data:', err)
      setError('Failed to load learning content. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  // Load completed lessons from backend lesson progress data
  useEffect(() => {
    console.log('🔄 Progress loading useEffect triggered')
    console.log('🔄 overallProgress:', overallProgress)
    console.log('🔄 Current completedLessons state before update:', completedLessons)
    
    if (overallProgress.lesson_progress_records && overallProgress.lesson_progress_records.length > 0) {
      // Extract completed lesson IDs from lesson progress records
      // IMPORTANT: We need to create unique identifiers that combine module_id and lesson_id
      // because lesson IDs are not globally unique across modules
      const backendCompletedKeys = overallProgress.lesson_progress_records
        .filter(record => record.completed)
        .map(record => `${record.module_id}_${record.lesson_id}`)
      
      console.log('📊 Raw lesson progress records:', overallProgress.lesson_progress_records)
      console.log('📊 Backend completed lesson keys:', backendCompletedKeys)
      console.log('📊 Current local completedLessons:', completedLessons)
      
      // Debug: Check for any mismatches between backend and frontend
      const backendCompletedSet = new Set(backendCompletedKeys)
      const frontendCompletedSet = new Set(completedLessons)
      
      const missingInFrontend = backendCompletedKeys.filter(key => !frontendCompletedSet.has(key))
      const extraInFrontend = completedLessons.filter(key => !backendCompletedSet.has(key))
      
      if (missingInFrontend.length > 0) {
        console.log('⚠️ Lessons completed in backend but missing in frontend:', missingInFrontend)
      }
      if (extraInFrontend.length > 0) {
        console.log('⚠️ Lessons marked complete in frontend but not in backend:', extraInFrontend)
      }
      
      // Only update if backend has more completed lessons than local state
      // This prevents overwriting local progress with stale backend data
      if (backendCompletedKeys.length > completedLessons.length) {
        console.log('📊 Backend has more completed lessons, updating local state')
        setCompletedLessons(backendCompletedKeys)
      } else if (backendCompletedKeys.length === completedLessons.length) {
        console.log('📊 Backend and local state have same count, checking for new keys')
        // Check if there are any new keys in backend that aren't in local state
        const newKeys = backendCompletedKeys.filter(key => !completedLessons.includes(key))
        if (newKeys.length > 0) {
          console.log('📊 Found new keys in backend:', newKeys)
          const updatedKeys = [...new Set([...completedLessons, ...newKeys])]
          setCompletedLessons(updatedKeys)
        } else {
          console.log('📊 No new keys found, keeping local state unchanged')
        }
      } else {
        console.log('📊 Backend has fewer completed lessons, keeping local state unchanged')
      }
    } else {
      console.log('📊 No lesson progress records found or empty')
    }
  }, [overallProgress])
  
  // Mark lesson as complete and update backend progress
  const markLessonComplete = async (moduleId, lessonId) => {
    try {
      console.log('🔄 markLessonComplete called with:', { moduleId, lessonId })
      console.log('🔄 Current modules:', modules)
      
      // Find the module by provided moduleId (avoid cross-module ID collisions)
      const module = modules.find(m => String(m.id) === String(moduleId))
      if (!module) {
        console.error('❌ Module not found for ids:', { moduleId, lessonId })
        return
      }

      console.log('🔄 Found module for lesson:', {
        moduleId: module.id,
        moduleTitle: module.title,
        lessonId: lessonId,
        allLessonsInModule: module.content?.lessons?.map(l => ({ id: l.id, title: l.title }))
      })

      // If already completed, skip backend call
      const lessonKeyPre = `${String(module.id)}_${String(lessonId)}`
      if (completedLessons.includes(lessonKeyPre)) {
        console.log('ℹ️ Lesson already completed, skipping update:', lessonKeyPre)
        return
      }

      // Update backend lesson progress
      const progressData = {
        completed: true,
        score: 100, // Full score for completing lesson
        completed_at: new Date().toISOString()
      }

      console.log('🔄 Calling updateLessonProgress with:', {
        moduleId: module.id,
        lessonId: lessonId,
        progressData
      })

      // Import updateLessonProgress function for lesson-level tracking
      const { updateLessonProgress } = await import('../utils/contentManager')
      const result = await updateLessonProgress(module.id, lessonId, progressData)
      // Normalize backend response and ensure completed flag is true
      const backendKey = `${String(result?.progress?.module_id ?? module.id)}_${String(result?.progress?.lesson_id ?? lessonId)}`
      const backendCompleted = Boolean(result?.progress?.completed ?? true)
      
      console.log('🔄 updateLessonProgress result:', result)

      // Update local state - prefer backend key if present
      const lessonKey = backendCompleted ? backendKey : `${String(module.id)}_${String(lessonId)}`
      setCompletedLessons(prev => {
        const updated = [...new Set([...prev, lessonKey])]
        return updated
      })
      console.log('🔄 Updated completedLessons state with key:', lessonKey)
      
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
      console.log('🔄 Refreshing overall progress...')
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
      console.log('🔄 Overall progress refreshed and merged with local state')
      
      console.log('✅ Lesson marked as complete:', lessonId)
    } catch (error) {
      console.error('❌ Failed to mark lesson complete:', error)
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
        <div className="bg-gradient-to-r from-[#21a1ce] to-[#1a8bb8] rounded-2xl p-6 text-white shadow-lg">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-white bg-opacity-20 p-3 rounded-full mr-3">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Learning Hub</h1>
            </div>
            
            <div className="bg-white bg-opacity-10 rounded-xl p-4 mb-4 backdrop-blur-sm">
              <p className="text-white text-base leading-relaxed font-medium">
                Remaleh isn't just about learning it's about doing. Stuck or unsure? A Remaleh Guardian will guide you step-by-step until you're confident, capable, and ready to take action.
              </p>
            </div>
            
            <div className="bg-white bg-opacity-15 rounded-lg p-3 inline-block">
              <p className="text-white text-sm italic font-medium">
                🚗 No one ever learns driving by reading alone - they were guided by an expert. Let us be your guide! ✨
              </p>
            </div>
          </div>
        </div>

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
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#21a1ce] to-[#1a8bb8] rounded-2xl p-6 mb-6 text-white shadow-lg">
        <div className="text-center">
          {/* Icon and Title */}
          <div className="flex items-center justify-center mb-4">
            <div className="bg-white bg-opacity-20 p-3 rounded-full mr-3">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold">Learning Hub</h1>
            <button
              onClick={loadData}
              disabled={loading}
              className="ml-4 bg-white bg-opacity-20 p-2 rounded-full hover:bg-opacity-30 transition-all disabled:opacity-50"
              title="Refresh content"
            >
              <RefreshCw className={`w-5 h-5 text-white ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          
          {/* Main Message */}
          <div className="bg-white bg-opacity-10 rounded-xl p-4 mb-4 backdrop-blur-sm">
            <p className="text-white text-base leading-relaxed font-medium">
              Remaleh isn't just about learning it's about doing. Stuck or unsure? A Remaleh Guardian will guide you step-by-step until you're confident, capable, and ready to take action.
            </p>
          </div>
          
          {/* Cheeky Driving Analogy */}
          <div className="bg-white bg-opacity-15 rounded-lg p-3 inline-block">
            <p className="text-white text-sm italic font-medium">
              🚗 No one ever learns driving by reading alone - they were guided by an expert. Let us be your guide! ✨
            </p>
          </div>
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
            <div className="text-xs text-gray-500">
              Debug: {overallProgress.completion_percentage || 0}% width
            </div>
            {nextLesson && (
              <span className="text-sm text-[#21a1ce] font-medium">
                Next: {nextLesson.lesson_title}
              </span>
            )}
          </div>
          {/* Debug Progress Info */}
          {!loading && (
            <div className="mt-2 text-xs text-gray-500 border-t pt-2">
              <div>Total Lessons: {overallProgress.total_lessons || 0}</div>
              <div>Completed Lessons: {overallProgress.completed_lessons || 0}</div>
              <div>Raw Percentage: {overallProgress.completion_percentage || 0}%</div>
              <div>Frontend State: {completedLessons.length} keys</div>
              <div>Backend Records: {overallProgress.lesson_progress_records?.length || 0}</div>
              <div className="mt-1 font-medium">Backend Progress Records:</div>
              {overallProgress.lesson_progress_records?.map((record, index) => (
                <div key={index} className="text-xs">
                  Module {record.module_id}, Lesson {record.lesson_id}: {record.completed ? '✅' : '❌'}
                </div>
              ))}
            </div>
          )}
        </MobileCardContent>
      </MobileCard>

      {/* Remaleh Guardian Support */}
      <MobileCard className="mb-4">
        <MobileCardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#21a1ce] rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Need Help Implementing?</h3>
              <p className="text-sm text-gray-600">Don't struggle alone - get expert guidance</p>
            </div>
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
          <div className="mt-4 pt-4 border-t border-gray-200">
            <MobileButton 
              onClick={() => setActiveTab('chat')}
              variant="primary"
              className="w-full"
            >
              Connect with a Remaleh Guardian
            </MobileButton>
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
        
        <div className="flex space-x-2">
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
            filteredModules.map(module => {
              const lessonCount = module.content?.lessons?.length || 0
              const completedLessonsInModule = module.content?.lessons?.filter(lesson => 
                completedLessons.includes(`${String(module.id)}_${String(lesson.id)}`)
              ).length || 0
              const progressPercent = lessonCount > 0 ? (completedLessonsInModule / lessonCount) * 100 : 0
              
              // Debug logging for module progress
              console.log(`📊 Module ${module.id} (${module.title}): ${completedLessonsInModule}/${lessonCount} = ${Math.round(progressPercent)}%`)
              console.log(`📊 Module ${module.id} lessons:`, module.content?.lessons?.map(l => ({ id: l.id, title: l.title })))
              console.log(`📊 Module ${module.id} completed keys:`, completedLessons.filter(key => key.startsWith(`${module.id}_`)))
              
              return (
                <MobileCard key={module.id} className="cursor-pointer hover:shadow-md transition-shadow" 
                           onClick={() => setSelectedModule(module)}>
                  <MobileCardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white`} 
                             style={{ backgroundColor: module.color || '#21a1ce' }}>
                          <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
                          <p className="text-sm text-gray-600">{module.description}</p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                            <span>{lessonCount} lessons</span>
                            <span>{module.estimated_time} min</span>
                            <span className="capitalize">{module.difficulty}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-[#21a1ce]">{Math.round(progressPercent)}%</div>
                        <div className="text-xs text-gray-500">{completedLessonsInModule}/{lessonCount}</div>
                      </div>
                    </div>
                  </MobileCardHeader>
                  
                  <MobileCardContent>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-[#21a1ce] h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                  </MobileCardContent>
                </MobileCard>
              )
            })
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
                  
                  // Debug logging for each lesson
                  console.log(`📊 Lesson ${lesson.id} in Module ${selectedModule.id}:`, {
                    lessonKey,
                    isCompleted,
                    title: lesson.title,
                    inCompletedLessons: completedLessons.includes(lessonKey),
                    allCompletedKeys: completedLessons
                  })
                  
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
                          <p className="text-sm text-gray-600">{lesson.duration} min • {lesson.contentType}</p>
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
                      {/* Debug info for each lesson */}
                      <div className="text-xs text-gray-400 ml-2">
                        {lessonKey}
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
                <span>{selectedLesson.duration}</span>
                <span>•</span>
                <span className="capitalize">{selectedLesson.contentType}</span>
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
            <p className="text-gray-700">{lesson.content}</p>
            <div className="space-y-3">
              {lesson.tips?.map((tip, index) => (
                <div key={index} className="flex items-start">
                  <div className="p-1 rounded-full mr-3 mt-1 bg-green-100">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  </div>
                  <div>
                    <p className="font-medium">{tip.title}</p>
                    <p className="text-sm text-gray-600">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'warning-signs':
        return (
          <div className="space-y-4">
            <p className="text-gray-700">{lesson.content}</p>
            <div className="space-y-3">
              {lesson.signs?.map((sign, index) => (
                <div key={index} className="flex items-start">
                  <div className={`p-1 rounded-full mr-3 mt-1 ${sign.danger ? 'bg-red-100' : 'bg-green-100'}`}>
                    <div className={`w-2 h-2 rounded-full ${sign.danger ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  </div>
                  <div>
                    <p className="font-medium">{sign.title}</p>
                    <p className="text-sm text-gray-600">{sign.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'steps':
        return (
          <div className="space-y-4">
            <p className="text-gray-700">{lesson.content}</p>
            <div className="space-y-2">
              {lesson.steps?.map((step, index) => (
                <div key={index} className="flex items-start">
                  <div className="w-6 h-6 rounded-full bg-[#21a1ce] text-white text-sm font-bold flex items-center justify-center mr-3 mt-0.5">
                    {index + 1}
                  </div>
                  <p className="text-gray-700">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'list':
        return (
          <div className="space-y-4">
            <p className="text-gray-700">{lesson.content}</p>
            <ul className="space-y-2 ml-4">
              {lesson.items?.map((item, index) => (
                <li key={index} className="text-gray-700">• {item}</li>
              ))}
            </ul>
          </div>
        )
      
      case 'warning':
      case 'warning-list':
        return (
          <div className={`p-4 rounded-lg border ${getContentStyle(lesson.contentStyle)}`}>
            <h4 className="font-bold mb-2 text-red-800">Important</h4>
            <p className="text-red-700 mb-3">{lesson.content}</p>
            {lesson.items && (
              <ul className="space-y-1 text-red-700">
                {lesson.items.map((item, index) => (
                  <li key={index}>• {item}</li>
                ))}
              </ul>
            )}
          </div>
        )
      
      case 'action-list':
        return (
          <div className={`p-4 rounded-lg border ${getContentStyle(lesson.contentStyle)}`}>
            <h4 className="font-bold mb-2 text-green-800">Actions to Take</h4>
            <p className="text-green-700 mb-3">{lesson.content}</p>
            <ul className="space-y-1 text-green-700">
              {lesson.actions?.map((action, index) => (
                <li key={index}>• {action}</li>
              ))}
            </ul>
          </div>
        )
      
      case 'example':
        return (
          <div className={`p-4 rounded-lg border ${getContentStyle(lesson.contentStyle)}`}>
            <h4 className="font-bold mb-2">Real-World Example</h4>
            <p className="text-gray-700">{lesson.content}</p>
          </div>
        )
      
      default:
        return (
          <div className={`p-4 rounded-lg border ${getContentStyle(lesson.contentStyle)}`}>
            <p className="text-gray-700">{lesson.content}</p>
          </div>
        )
    }
  }

  return (
    <div className="space-y-6">
      {renderContent()}
    </div>
  )
}


