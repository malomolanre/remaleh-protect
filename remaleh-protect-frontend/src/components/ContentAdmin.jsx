import React, { useState, useEffect } from 'react'
import { Edit3, Save, X, Plus, Trash2, Eye, Search } from 'lucide-react'
import { MobileCard, MobileCardHeader, MobileCardContent } from './ui/mobile-card'
import { MobileButton } from './ui/mobile-button'
import { MobileInput } from './ui/mobile-input'
import { MobileTextarea } from './ui/textarea'
import learningContent from '../data/learning-content.json'

export default function ContentAdmin() {
  const [content, setContent] = useState(learningContent)
  const [editingModule, setEditingModule] = useState(null)
  const [editingLesson, setEditingLesson] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModule, setShowAddModule] = useState(false)
  const [showAddLesson, setShowAddLesson] = useState(false)

  // Save content to localStorage (in production, this would save to your backend)
  const saveContent = () => {
    localStorage.setItem('remaleh-learning-content', JSON.stringify(content))
    // In production, you'd make an API call here
    alert('Content saved successfully!')
  }

  // Load content from localStorage (in production, this would load from your backend)
  useEffect(() => {
    const saved = localStorage.getItem('remaleh-learning-content')
    if (saved) {
      setContent(JSON.parse(saved))
    }
  }, [])

  const filteredModules = content.modules.filter(module =>
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    module.subtitle.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const addModule = () => {
    const newModule = {
      id: `module-${Date.now()}`,
      title: 'New Module',
      subtitle: 'Module description',
      icon: 'BookOpen',
      color: '#21a1ce',
      estimatedTime: '10 minutes',
      difficulty: 'beginner',
      lessons: []
    }
    
    setContent(prev => ({
      ...prev,
      modules: [...prev.modules, newModule],
      metadata: {
        ...prev.metadata,
        totalModules: prev.modules.length + 1
      }
    }))
    setShowAddModule(false)
  }

  const addLesson = (moduleId) => {
    const newLesson = {
      id: `lesson-${Date.now()}`,
      title: 'New Lesson',
      type: 'content',
      content: 'Lesson content here...',
      contentType: 'info',
      contentStyle: 'blue',
      duration: '5 min'
    }
    
    setContent(prev => ({
      ...prev,
      modules: prev.modules.map(module =>
        module.id === moduleId
          ? { ...module, lessons: [...module.lessons, newLesson] }
          : module
      ),
      metadata: {
        ...prev.metadata,
        totalLessons: prev.metadata.totalLessons + 1
      }
    }))
    setShowAddLesson(false)
  }

  const deleteModule = (moduleId) => {
    if (confirm('Are you sure you want to delete this module?')) {
      setContent(prev => ({
        ...prev,
        modules: prev.modules.filter(module => module.id !== moduleId),
        metadata: {
          ...prev.metadata,
          totalModules: prev.modules.length - 1,
          totalLessons: prev.metadata.totalLessons - 
            prev.modules.find(m => m.id === moduleId)?.lessons.length
        }
      }))
    }
  }

  const deleteLesson = (moduleId, lessonId) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      setContent(prev => ({
        ...prev,
        modules: prev.modules.map(module =>
          module.id === moduleId
            ? { ...module, lessons: module.lessons.filter(lesson => lesson.id !== lessonId) }
            : module
        ),
        metadata: {
          ...prev.metadata,
          totalLessons: prev.metadata.totalLessons - 1
        }
      }))
    }
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
        <div className="flex space-x-2">
          <MobileButton onClick={() => setShowAddModule(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Module
          </MobileButton>
          <MobileButton onClick={saveContent} variant="primary">
            <Save className="w-4 h-4 mr-2" />
            Save All
          </MobileButton>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <MobileInput
          type="text"
          placeholder="Search modules and lessons..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Content Stats */}
      <MobileCard>
        <MobileCardHeader>
          <h3 className="text-lg font-semibold">Content Overview</h3>
        </MobileCardHeader>
        <MobileCardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[#21a1ce]">{content.metadata.totalModules}</div>
              <div className="text-sm text-gray-600">Modules</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#21a1ce]">{content.metadata.totalLessons}</div>
              <div className="text-sm text-gray-600">Lessons</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#21a1ce]">{content.metadata.version}</div>
              <div className="text-sm text-gray-600">Version</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#21a1ce]">{content.metadata.lastUpdated}</div>
              <div className="text-sm text-gray-600">Last Updated</div>
            </div>
          </div>
        </MobileCardContent>
      </MobileCard>

      {/* Modules List */}
      <div className="space-y-4">
        {filteredModules.map(module => (
          <MobileCard key={module.id}>
            <MobileCardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white`} 
                       style={{ backgroundColor: module.color }}>
                    <span className="text-lg font-bold">{module.title.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{module.title}</h3>
                    <p className="text-sm text-gray-600">{module.subtitle}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                      <span>{module.lessons.length} lessons</span>
                      <span>{module.estimatedTime}</span>
                      <span className="capitalize">{module.difficulty}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingModule(module)}
                    className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setShowAddLesson(module.id)}
                    className="p-2 text-[#21a1ce] hover:text-[#1a8bb8] transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteModule(module.id)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </MobileCardHeader>
            
            <MobileCardContent>
              <div className="space-y-2">
                {module.lessons.map(lesson => (
                  <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-[#21a1ce]"></div>
                      <div>
                        <h4 className="font-medium text-sm">{lesson.title}</h4>
                        <p className="text-xs text-gray-600">{lesson.duration} • {lesson.contentType}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingLesson({ ...lesson, moduleId: module.id })}
                        className="p-1 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => deleteLesson(module.id, lesson.id)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </MobileCardContent>
          </MobileCard>
        ))}
      </div>

      {/* Add Module Modal */}
      {showAddModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Module</h3>
            <MobileButton onClick={addModule} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create Module
            </MobileButton>
            <button
              onClick={() => setShowAddModule(false)}
              className="w-full mt-2 p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Add Lesson Modal */}
      {showAddLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add New Lesson</h3>
            <MobileButton onClick={() => addLesson(showAddLesson)} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create Lesson
            </MobileButton>
            <button
              onClick={() => setShowAddLesson(false)}
              className="w-full mt-2 p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Edit Module Modal */}
      {editingModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Module</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <MobileInput
                  value={editingModule.title}
                  onChange={(e) => setEditingModule({ ...editingModule, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <MobileInput
                  value={editingModule.subtitle}
                  onChange={(e) => setEditingModule({ ...editingModule, subtitle: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={editingModule.difficulty}
                  onChange={(e) => setEditingModule({ ...editingModule, difficulty: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <MobileButton
                onClick={() => {
                  setContent(prev => ({
                    ...prev,
                    modules: prev.modules.map(m => 
                      m.id === editingModule.id ? editingModule : m
                    )
                  }))
                  setEditingModule(null)
                }}
                className="flex-1"
              >
                Save Changes
              </MobileButton>
              <button
                onClick={() => setEditingModule(null)}
                className="flex-1 p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Lesson Modal */}
      {editingLesson && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Lesson</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <MobileInput
                  value={editingLesson.title}
                  onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                <MobileTextarea
                  value={editingLesson.content}
                  onChange={(e) => setEditingLesson({ ...editingLesson, content: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <MobileInput
                  value={editingLesson.duration}
                  onChange={(e) => setEditingLesson({ ...editingLesson, duration: e.target.value })}
                />
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <MobileButton
                onClick={() => {
                  setContent(prev => ({
                    ...prev,
                    modules: prev.modules.map(module =>
                      module.id === editingLesson.moduleId
                        ? {
                            ...module,
                            lessons: module.lessons.map(lesson =>
                              lesson.id === editingLesson.id ? editingLesson : lesson
                            )
                          }
                        : module
                    )
                  }))
                  setEditingLesson(null)
                }}
                className="flex-1"
              >
                Save Changes
              </MobileButton>
              <button
                onClick={() => setEditingLesson(null)}
                className="flex-1 p-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
