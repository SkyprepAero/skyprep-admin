import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, X } from 'lucide-react'
import { enrollmentAPI, roleAPI, subjectAPI } from '@/lib/api'
import toast from 'react-hot-toast'

const FocusOneEnrollForm = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [teachers, setTeachers] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loadingTeachers, setLoadingTeachers] = useState(true)
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    selectedSubjectIds: [], // Subjects the student wants to enroll in
    teacherSubjectMappings: [], // Array of { teacher: string, subject: string }
    startedAt: ''
  })

  useEffect(() => {
    fetchTeachers()
    fetchSubjects()
  }, [])


  const fetchTeachers = async () => {
    try {
      setLoadingTeachers(true)
      const response = await roleAPI.getUsersByRole('teacher', { limit: 100 })
      const teachersData = response.data.data || []
      setTeachers(teachersData)
    } catch (error) {
      console.error('Error fetching teachers:', error)
      toast.error('Failed to fetch teachers')
    } finally {
      setLoadingTeachers(false)
    }
  }

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true)
      const response = await subjectAPI.getAll({ limit: 100 })
      const responseData = response.data.data
      const subjectsData = responseData.subjects || responseData || []
      setSubjects(subjectsData)
    } catch (error) {
      console.error('Error fetching subjects:', error)
      toast.error('Failed to fetch subjects')
    } finally {
      setLoadingSubjects(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  // Toggle subject selection
  const handleSubjectToggle = (subjectId) => {
    setFormData(prev => {
      const currentIds = prev.selectedSubjectIds || []
      const isSelected = currentIds.includes(subjectId)
      const newSelectedIds = isSelected
        ? currentIds.filter(id => id !== subjectId)
        : [...currentIds, subjectId]
      
      // Remove mappings for unselected subjects
      const updatedMappings = prev.teacherSubjectMappings.filter(
        m => newSelectedIds.includes(m.subject)
      )

      return {
        ...prev,
        selectedSubjectIds: newSelectedIds,
        teacherSubjectMappings: updatedMappings
      }
    })
  }

  // Add a mapping (teacher + subject pair) - only for selected subjects
  const addMapping = (subjectId, teacherId) => {
    if (!subjectId || !teacherId) return

    setFormData(prev => {
      // Only allow mapping if subject is selected
      if (!prev.selectedSubjectIds.includes(subjectId)) return prev

      const mappings = prev.teacherSubjectMappings || []
      // Check if this mapping already exists
      const exists = mappings.some(m => m.subject === subjectId && m.teacher === teacherId)
      if (exists) return prev

      return {
        ...prev,
        teacherSubjectMappings: [...mappings, { teacher: teacherId, subject: subjectId }]
      }
    })
  }

  // Remove a mapping
  const removeMapping = (index) => {
    setFormData(prev => ({
      ...prev,
      teacherSubjectMappings: prev.teacherSubjectMappings.filter((_, i) => i !== index)
    }))
  }

  // Get mappings for a specific subject
  const getMappingsForSubject = (subjectId) => {
    return (formData.teacherSubjectMappings || []).filter(m => m.subject === subjectId)
  }

  // Check if a teacher is assigned to a subject
  const isTeacherAssignedToSubject = (teacherId, subjectId) => {
    return (formData.teacherSubjectMappings || []).some(
      m => m.teacher === teacherId && m.subject === subjectId
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!formData.selectedSubjectIds || formData.selectedSubjectIds.length === 0) {
        toast.error('Please select at least one subject')
        return
      }

      // Validate that each selected subject has at least one teacher
      for (const subjectId of formData.selectedSubjectIds) {
        const mappingsForSubject = formData.teacherSubjectMappings.filter(m => m.subject === subjectId)
        if (mappingsForSubject.length === 0) {
          const subject = subjects.find(s => s._id === subjectId)
          toast.error(`Please assign at least one teacher to ${subject?.name || 'selected subject'}`)
          return
        }
      }

      const submitData = {
        email: formData.email.trim(),
        teacherSubjectMappings: formData.teacherSubjectMappings,
        ...(formData.startedAt && { startedAt: formData.startedAt })
      }
      await enrollmentAPI.enroll(submitData)
      toast.success('Student enrolled successfully! Password setup email has been sent.')
      navigate('/focus-one')
    } catch (error) {
      console.error('Error enrolling student:', error)
      const errorMessage = error.response?.data?.message || 'Failed to enroll student'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/focus-one')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enroll Student in Focus One</h1>
          <p className="mt-2 text-gray-600">
            Enroll a new student in Focus One (One-to-One Teaching Program)
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enroll Student</CardTitle>
          <CardDescription>
            Enter the student's email to invite them. They will receive an email to set up their password and complete their profile.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email">Student Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="student@example.com"
              />
              <p className="text-sm text-gray-500 mt-1">
                The student will receive an invitation email to set up their password
              </p>
            </div>

            <div>
              <Label>Select Subjects *</Label>
              <p className="text-sm text-gray-500 mb-3">
                First, select the subjects the student wants to enroll in.
              </p>
              
              {loadingSubjects ? (
                <p className="text-sm text-gray-500">Loading subjects...</p>
              ) : (
                <div className="border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                  {subjects.length === 0 ? (
                    <p className="text-sm text-gray-500">No subjects available</p>
                  ) : (
                    <div className="space-y-2">
                      {subjects.map((subject) => {
                        const isSelected = (formData.selectedSubjectIds || []).includes(subject._id)
                        return (
                          <label key={subject._id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleSubjectToggle(subject._id)}
                              className="rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm">
                              {subject.name}
                              {subject.description && (
                                <span className="text-gray-500 ml-1">- {subject.description}</span>
                              )}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}
              
              {formData.selectedSubjectIds && formData.selectedSubjectIds.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.selectedSubjectIds.map(subjectId => {
                    const subject = subjects.find(s => s._id === subjectId)
                    return subject ? (
                      <span key={subjectId} className="inline-flex items-center px-2 py-1 rounded-md bg-blue-100 text-blue-800 text-sm">
                        {subject.name}
                      </span>
                    ) : null
                  })}
                </div>
              )}
            </div>

            {formData.selectedSubjectIds && formData.selectedSubjectIds.length > 0 && (
              <div>
                <Label>Assign Teachers to Subjects *</Label>
                <p className="text-sm text-gray-500 mb-3">
                  Assign teachers to each selected subject. At least one teacher must be assigned per subject.
                </p>
                
                {loadingTeachers ? (
                  <p className="text-sm text-gray-500">Loading teachers...</p>
                ) : (
                  <div className="space-y-4 border border-gray-300 rounded-md p-4">
                    {formData.selectedSubjectIds.map((subjectId) => {
                      const subject = subjects.find(s => s._id === subjectId)
                      if (!subject) return null

                      return (
                        <div key={subject._id} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-base font-semibold">
                              {subject.name}
                              {subject.description && (
                                <span className="text-gray-500 font-normal ml-2">- {subject.description}</span>
                              )}
                            </Label>
                            <select
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                              onChange={(e) => {
                                if (e.target.value) {
                                  addMapping(subject._id, e.target.value)
                                  e.target.value = '' // Reset select
                                }
                              }}
                              value=""
                            >
                              <option value="">Select a teacher...</option>
                              {teachers.map((teacher) => (
                                <option 
                                  key={teacher._id} 
                                  value={teacher._id}
                                  disabled={isTeacherAssignedToSubject(teacher._id, subject._id)}
                                >
                                  {teacher.name} ({teacher.email})
                                  {isTeacherAssignedToSubject(teacher._id, subject._id) ? ' (already assigned)' : ''}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          {/* Show assigned teachers for this subject */}
                          {getMappingsForSubject(subject._id).length > 0 ? (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {getMappingsForSubject(subject._id).map((mapping, idx) => {
                                const mappingIndex = formData.teacherSubjectMappings.findIndex(
                                  m => m.subject === mapping.subject && m.teacher === mapping.teacher
                                )
                                const teacher = teachers.find(t => t._id === mapping.teacher)
                                return teacher ? (
                                  <span 
                                    key={idx}
                                    className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-sm"
                                  >
                                    {teacher.name}
                                    <button
                                      type="button"
                                      onClick={() => removeMapping(mappingIndex)}
                                      className="ml-2 hover:text-primary/80"
                                    >
                                      <X className="h-3 w-3" />
                                    </button>
                                  </span>
                                ) : null
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-orange-600 mt-2">⚠ No teacher assigned yet. Please assign at least one teacher.</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Show all mappings summary */}
                {formData.teacherSubjectMappings && formData.teacherSubjectMappings.length > 0 && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm font-semibold text-blue-900 mb-2">
                      Total Mappings: {formData.teacherSubjectMappings.length}
                    </p>
                    <div className="text-xs text-blue-700 space-y-1">
                      {formData.teacherSubjectMappings.map((mapping, idx) => {
                        const teacher = teachers.find(t => t._id === mapping.teacher)
                        const subject = subjects.find(s => s._id === mapping.subject)
                        return teacher && subject ? (
                          <div key={idx}>
                            {teacher.name} → {subject.name}
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div>
              <Label htmlFor="startedAt">Start Date</Label>
              <Input
                id="startedAt"
                name="startedAt"
                type="date"
                value={formData.startedAt}
                onChange={handleChange}
              />
              <p className="text-sm text-gray-500 mt-1">
                When the student's classes should begin. Leave empty to start immediately.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-md">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Enrollment Information</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p><span className="font-medium">Enrolled Date:</span> {new Date().toLocaleDateString()}</p>
                <p><span className="font-medium">Enrolled By:</span> You (Current Admin)</p>
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/focus-one')}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Enrolling...' : 'Enroll Student'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default FocusOneEnrollForm
