import React, { useState, useEffect } from 'react'
import { Edit3, Save, X, Plus, Trash2, Eye, Search, RefreshCw } from 'lucide-react'
import { MobileCard, MobileCardHeader, MobileCardContent } from './ui/mobile-card'
import { MobileButton } from './ui/mobile-button'
import { MobileInput } from './ui/mobile-input'
import { Textarea } from './ui/textarea'
import {
  getAllModules,
  createModule,
  updateModule,
  deleteModule,
  addLesson,
  updateLesson,
  deleteLesson,
  exportContent,
  importContent
} from '../utils/contentManager'

export default function ContentAdmin() {
  const [modules, setModules] = useState([])
  const [editingModule, setEditingModule] = useState(null)
  const [editingLesson, setEditingLesson] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModule, setShowAddModule] = useState(false)
  const [showAddLesson, setShowAddLesson] = useState(false)
  const [selectedModuleId, setSelectedModuleId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load modules from backend API
  useEffect(() => {
    loadModules()
  }, [])

  const loadModules = async () => {
    try {
      setLoading(true)
      setError(null)
      const modulesData = await getAllModules()
      setModules(modulesData)
    } catch (err) {
      setError('Failed to load modules: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredModules = modules.filter(module =>
    module.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (module.description && module.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const addModule = async () => {
    try {
      const newModuleData = {
        title: 'New Module',
        description: 'Module description',
        difficulty: 'BEGINNER',
        estimated_time: 10,
        content: { lessons: [] }
      }
      
      const result = await createModule(newModuleData)
      await loadModules() // Refresh the modules list
      setShowAddModule(false)
      alert('Module created successfully!')
    } catch (err) {
      alert('Failed to create module: ' + err.message)
    }
  }

  const addLesson = async (moduleId) => {
    try {
      const newLessonData = {
        title: 'New Lesson',
        type: 'info',
        content: 'Lesson content here...',
        contentType: 'info',
        contentStyle: 'default',
        duration: 5
      }
      
      const result = await addLesson(moduleId, newLessonData)
      await loadModules() // Refresh the modules list
      setShowAddLesson(false)
      alert('Lesson added successfully!')
    } catch (err) {
      alert('Failed to add lesson: ' + err.message)
    }
  }

  const handleDeleteModule = async (moduleId) => {
    if (confirm('Are you sure you want to delete this module?')) {
      try {
        await deleteModule(moduleId)
        await loadModules() // Refresh the modules list
        alert('Module deleted successfully!')
      } catch (err) {
        alert('Failed to delete module: ' + err.message)
      }
    }
  }

  const handleDeleteLesson = async (moduleId, lessonId) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      try {
        await deleteLesson(moduleId, lessonId)
        await loadModules() // Refresh the modules list
        alert('Lesson deleted successfully!')
      } catch (err) {
        alert('Failed to delete lesson: ' + err.message)
      }
    }
  }

  const saveModule = async () => {
    if (editingModule) {
      try {
        await updateModule(editingModule.id, {
          title: editingModule.title,
          description: editingModule.description,
          difficulty: editingModule.difficulty,
          estimated_time: editingModule.estimated_time,
          content: editingModule.content
        })
        await loadModules() // Refresh the modules list
        setEditingModule(null)
        alert('Module updated successfully!')
      } catch (err) {
        alert('Failed to update module: ' + err.message)
      }
    }
  }

  const saveLesson = async () => {
    if (editingLesson && selectedModuleId) {
      try {
        await updateLesson(selectedModuleId, editingLesson.id, {
          title: editingLesson.title,
          type: editingLesson.type,
          content: editingLesson.content,
          contentType: editingLesson.contentType,
          contentStyle: editingLesson.contentStyle,
          duration: editingLesson.duration
        })
        await loadModules() // Refresh the modules list
        setEditingLesson(null)
        alert('Lesson updated successfully!')
      } catch (err) {
        alert('Failed to update lesson: ' + err.message)
      }
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
          <MobileButton onClick={loadModules} variant="primary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </MobileButton>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

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
              <div className="text-2xl font-bold text-[#21a1ce]">
                {loading ? '...' : modules.length}
              </div>
              <div className="text-sm text-gray-600">Modules</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#21a1ce]">
                {loading ? '...' : modules.reduce((total, m) => total + (m.content?.lessons?.length || 0), 0)}
              </div>
              <div className="text-sm text-gray-600">Lessons</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#21a1ce]">v1.0</div>
              <div className="text-sm text-gray-600">Version</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[#21a1ce]">
                {loading ? '...' : (modules.length > 0 ? 'Active' : 'No Content')}
              </div>
              <div className="text-sm text-gray-600">Status</div>
            </div>
          </div>
        </MobileCardContent>
      </MobileCard>

      {/* Modules List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#21a1ce] mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading modules...</p>
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No modules found</p>
            <p className="text-sm text-gray-500">Create your first module to get started</p>
          </div>
        ) : (
          filteredModules.map(module => (
            <MobileCard key={module.id}>
              <MobileCardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white`} 
                         style={{ backgroundColor: module.color || '#21a1ce' }}>
                      <span className="text-lg font-bold">{module.title.charAt(0)}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{module.title}</h3>
                      <p className="text-sm text-gray-600">{module.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                        <span>{module.content?.lessons?.length || 0} lessons</span>
                        <span>{module.estimated_time} min</span>
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
                    onClick={() => handleDeleteModule(module.id)}
                    className="p-2 text-red-600 hover:text-red-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  </div>
                </div>
              </MobileCardHeader>
              
              <MobileCardContent>
                <div className="space-y-2">
                  {module.content?.lessons?.map(lesson => (
                    <div key={lesson.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-2 h-2 rounded-full bg-[#21a1ce]"></div>
                        <div>
                          <h4 className="font-medium text-sm">{lesson.title}</h4>
                          <p className="text-xs text-gray-600">{lesson.duration} min • {lesson.contentType}</p>
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
                        onClick={() => handleDeleteLesson(module.id, lesson.id)}
                        className="p-1 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-4 text-gray-500">
                      <p>No lessons yet</p>
                      <button
                        onClick={() => setShowAddLesson(module.id)}
                        className="text-[#21a1ce] hover:text-[#1a8bb8] text-sm mt-1"
                      >
                        Add first lesson
                      </button>
                    </div>
                  )}
                </div>
              </MobileCardContent>
            </MobileCard>
          ))
        )}
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <MobileInput
                  value={editingModule.description}
                  onChange={(e) => setEditingModule({ ...editingModule, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={editingModule.difficulty}
                  onChange={(e) => setEditingModule({ ...editingModule, difficulty: e.target.value })}
                  className="w-full p-1 border border-gray-300 rounded-lg"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Time (minutes)</label>
                <MobileInput
                  type="number"
                  value={editingModule.estimated_time || 10}
                  onChange={(e) => setEditingModule({ ...editingModule, estimated_time: parseInt(e.target.value) || 10 })}
                  min="1"
                  max="120"
                />
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <MobileButton
                onClick={saveModule}
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
                <Textarea
                  value={editingLesson.content}
                  onChange={(e) => setEditingLesson({ ...editingLesson, content: e.target.value })}
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                <select
                  value={editingLesson.contentType || 'info'}
                  onChange={(e) => setEditingLesson({ ...editingLesson, contentType: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="info">Information</option>
                  <option value="tips">Tips</option>
                  <option value="warning-signs">Warning Signs</option>
                  <option value="steps">Steps</option>
                  <option value="example">Example</option>
                  <option value="warning">Warning</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <MobileInput
                  type="number"
                  value={editingLesson.duration || 5}
                  onChange={(e) => setEditingLesson({ ...editingLesson, duration: parseInt(e.target.value) || 5 })}
                  min="1"
                  max="60"
                />
              </div>
            </div>
            <div className="flex space-x-2 mt-6">
              <MobileButton
                onClick={saveLesson}
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
