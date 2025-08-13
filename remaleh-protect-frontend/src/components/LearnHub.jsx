import React, { useState, useEffect } from 'react'
import { BookOpen, CheckCircle, ArrowLeft, Search, Shield } from 'lucide-react'
import { MobileCard, MobileCardHeader, MobileCardContent } from './ui/mobile-card'
import { MobileButton } from './ui/mobile-button'
import { MobileInput } from './ui/mobile-input'
import { useAuth } from '../hooks/useAuth'
import { 
  getAllModules, 
  getModuleProgress, 
  getOverallProgress,
  getNextRecommendedLesson,
  searchLearningContent,
  getContentByDifficulty
} from '../utils/contentManager'

export default function LearnHub({ setActiveTab }) {
  const { isAuthenticated } = useAuth()
  const [selectedModule, setSelectedModule] = useState(null)
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('all')
  const [completedLessons, setCompletedLessons] = useState([])
  const [showCompleted, setShowCompleted] = useState(false)
  
  // Load completed lessons from localStorage (in production, this would come from your backend)
  useEffect(() => {
    const saved = localStorage.getItem('remaleh-completed-lessons')
    if (saved) {
      setCompletedLessons(JSON.parse(saved))
    }
  }, [])
  
  // Save completed lessons to localStorage
  const markLessonComplete = (lessonId) => {
    const newCompleted = [...new Set([...completedLessons, lessonId])]
    setCompletedLessons(newCompleted)
    localStorage.setItem('remaleh-completed-lessons', JSON.stringify(newCompleted))
  }
  
  // Get filtered modules based on search and difficulty
  const getFilteredModules = () => {
    let modules = getAllModules()
    
    if (difficultyFilter !== 'all') {
      modules = getContentByDifficulty(difficultyFilter)
    }
    
    if (searchTerm) {
      const searchResults = searchLearningContent(searchTerm)
      const moduleIds = [...new Set(searchResults.map(result => 
        result.type === 'module' ? result.id : result.moduleId
      ))]
      modules = modules.filter(module => moduleIds.includes(module.id))
    }
    
    return modules
  }
  
  const filteredModules = getFilteredModules()
  const overallProgress = getOverallProgress(completedLessons)
  const nextLesson = getNextRecommendedLesson(completedLessons)

  return (
    <div className="space-y-4 p-4">
      {/* Header with Back Button */}
      <div className="flex items-center mb-6">
        <button
          onClick={() => setActiveTab('learn')}
          className="p-2 mr-3 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold text-gray-900">Learning Hub</h1>
          <p className="text-gray-600 text-sm">We understand learning is not enough and sometimes one has to be guided and this is why Remaleh exists. If there is anything you don't feel confident doing or implementing, reach out to us and a Remaleh Guardian will guide you and walk you through implementing it and leave you empowered and confident.</p>
          <p className="text-gray-500 text-xs mt-2 italic">No one ever learns driving by reading alone - they were guided by an expert. Let us be your guide! 🚗✨</p>
        </div>
      </div>

      {/* Progress Overview */}
      <MobileCard className="mb-4">
        <MobileCardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Your Progress</h3>
            <div className="text-sm text-gray-600">
              {overallProgress.completed}/{overallProgress.total} lessons
            </div>
          </div>
        </MobileCardHeader>
        <MobileCardContent>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-[#21a1ce] h-2 rounded-full transition-all duration-300" 
              style={{ width: `${overallProgress.progress}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>{overallProgress.progress}% Complete</span>
            {nextLesson && (
              <span className="text-sm text-[#21a1ce] font-medium">
                Next: {nextLesson.lessonTitle}
              </span>
            )}
          </div>
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
        </div>
      </div>

      {/* Main Content */}
      {!selectedModule ? (
        /* Module Selection View */
        <div className="space-y-4">
          {filteredModules.map(module => {
            const progress = getModuleProgress(module.id, completedLessons)
            return (
              <MobileCard key={module.id} className="cursor-pointer hover:shadow-md transition-shadow" 
                         onClick={() => setSelectedModule(module)}>
                <MobileCardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-white`} 
                           style={{ backgroundColor: module.color }}>
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
                        <p className="text-sm text-gray-600">{module.subtitle}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                          <span>{module.lessons.length} lessons</span>
                          <span>{module.estimatedTime}</span>
                          <span className="capitalize">{module.difficulty}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-[#21a1ce]">{progress.progress}%</div>
                      <div className="text-xs text-gray-500">{progress.completed}/{progress.total}</div>
                    </div>
                  </div>
                </MobileCardHeader>
                
                <MobileCardContent>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-[#21a1ce] h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${progress.progress}%` }}
                    ></div>
                  </div>
                </MobileCardContent>
              </MobileCard>
            )
          })}
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
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedModule.title}</h2>
                  <p className="text-gray-600">{selectedModule.subtitle}</p>
                </div>
              </div>
            </MobileCardHeader>
            
            <MobileCardContent>
              <div className="space-y-3">
                {selectedModule.lessons.map(lesson => {
                  const isCompleted = completedLessons.includes(lesson.id)
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
                          <p className="text-sm text-gray-600">{lesson.duration} • {lesson.contentType}</p>
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
            {!completedLessons.includes(selectedLesson.id) && (
              <MobileButton 
                onClick={() => markLessonComplete(selectedLesson.id)}
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


