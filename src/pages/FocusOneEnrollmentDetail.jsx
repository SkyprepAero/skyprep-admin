import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Trash2, X, Pause, Play } from 'lucide-react'
import { enrollmentAPI, roleAPI, subjectAPI, focusOneAPI } from '@/lib/api'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['active', 'completed', 'cancelled']

const FocusOneEnrollmentDetail = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pausing, setPausing] = useState(false)
  const [resuming, setResuming] = useState(false)
  const [enrollment, setEnrollment] = useState(null)
  const [focusOne, setFocusOne] = useState(null)
  const [teachers, setTeachers] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loadingTeachers, setLoadingTeachers] = useState(true)
  const [loadingSubjects, setLoadingSubjects] = useState(true)
  const [formData, setFormData] = useState({
    teacherSubjectMappings: [], // Array of { teacher: string, subject: string }
    startedAt: '',
    endedAt: ''
  })
  const [pauseReason, setPauseReason] = useState('')
  const [pauseNotes, setPauseNotes] = useState('')

  useEffect(() => {
    fetchEnrollment()
    fetchTeachers()
    fetchSubjects()
  }, [userId])

  const fetchEnrollment = async () => {
    try {
      setLoading(true)
      const response = await enrollmentAPI.getById(userId)
      const user = response.data.data
      setEnrollment(user)
      
      if (user.focusOneEnrollment) {
        const mappings = user.focusOneEnrollment.teacherSubjectMappings || []
        setFormData({
          teacherSubjectMappings: mappings.map(m => ({
            teacher: (m.teacher._id || m.teacher).toString(),
            subject: (m.subject._id || m.subject).toString()
          })),
          startedAt: user.focusOneEnrollment.startedAt 
            ? new Date(user.focusOneEnrollment.startedAt).toISOString().split('T')[0]
            : '',
          endedAt: user.focusOneEnrollment.endedAt
            ? new Date(user.focusOneEnrollment.endedAt).toISOString().split('T')[0]
            : ''
        })

        // Fetch FocusOne details to get status and pause history
        const focusOneId = user.focusOneEnrollment.focusOne?._id || user.focusOneEnrollment.focusOne
        if (focusOneId) {
          try {
            const focusOneResponse = await focusOneAPI.getById(focusOneId)
            setFocusOne(focusOneResponse.data.data)
          } catch (error) {
            console.error('Error fetching FocusOne:', error)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching enrollment:', error)
      toast.error('Failed to fetch enrollment details')
      navigate('/focus-one')
    } finally {
      setLoading(false)
    }
  }

  const fetchTeachers = async () => {
    try {
      setLoadingTeachers(true)
      const response = await roleAPI.getUsersByRole('teacher', { limit: 100 })
      const teachersData = response.data.data || []
      setTeachers(teachersData)
    } catch (error) {
      console.error('Error fetching teachers:', error)
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
    } finally {
      setLoadingSubjects(false)
    }
  }

  // Add a mapping (teacher + subject pair)
  const addMapping = (subjectId, teacherId) => {
    if (!subjectId || !teacherId) return

    setFormData(prev => {
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await enrollmentAPI.update(userId, {
        teacherSubjectMappings: formData.teacherSubjectMappings,
        startedAt: formData.startedAt || undefined,
        endedAt: formData.endedAt || undefined
      })
      toast.success('Enrollment updated successfully')
      fetchEnrollment()
    } catch (error) {
      console.error('Error updating enrollment:', error)
      const errorMessage = error.response?.data?.message || 'Failed to update enrollment'
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handlePause = async () => {
    if (!focusOne || !focusOne._id) {
      toast.error('FocusOne not loaded')
      return
    }

    setPausing(true)
    try {
      await focusOneAPI.pause(focusOne._id, {
        reason: pauseReason || undefined,
        notes: pauseNotes || undefined
      })
      toast.success('Focus One paused successfully')
      setPauseReason('')
      setPauseNotes('')
      fetchEnrollment()
    } catch (error) {
      console.error('Error pausing Focus One:', error)
      const errorMessage = error.response?.data?.message || 'Failed to pause Focus One'
      toast.error(errorMessage)
    } finally {
      setPausing(false)
    }
  }

  const handleResume = async () => {
    if (!focusOne || !focusOne._id) {
      toast.error('FocusOne not loaded')
      return
    }

    setResuming(true)
    try {
      await focusOneAPI.resume(focusOne._id)
      toast.success('Focus One resumed successfully')
      fetchEnrollment()
    } catch (error) {
      console.error('Error resuming Focus One:', error)
      const errorMessage = error.response?.data?.message || 'Failed to resume Focus One'
      toast.error(errorMessage)
    } finally {
      setResuming(false)
    }
  }

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this enrollment?')) {
      return
    }

    try {
      await enrollmentAPI.cancel(userId)
      toast.success('Enrollment cancelled successfully')
      navigate(`/focus-one/${enrollment.focusOneEnrollment?.focusOne?._id || enrollment.focusOneEnrollment?.focusOne}/enrollments`)
    } catch (error) {
      console.error('Error cancelling enrollment:', error)
      toast.error('Failed to cancel enrollment')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!enrollment || !enrollment.focusOneEnrollment) {
    return (
      <div className="space-y-6">
        <Button
          variant="outline"
          onClick={() => navigate('/focus-one')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Enrollment not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const focusOneId = enrollment.focusOneEnrollment.focusOne?._id || enrollment.focusOneEnrollment.focusOne
  const focusOneStatus = focusOne?.status || 'active'

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
          <h1 className="text-3xl font-bold text-gray-900">Enrollment Details</h1>
          <p className="mt-2 text-gray-600">
            View and manage student enrollment
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Student Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-gray-500">Name</Label>
              <p className="text-lg font-semibold">{enrollment.name || 'N/A'}</p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Email</Label>
              <p className="text-lg">{enrollment.email}</p>
            </div>
            {enrollment.phoneNumber && (
              <div>
                <Label className="text-sm text-gray-500">Phone Number</Label>
                <p className="text-lg">{enrollment.phoneNumber}</p>
              </div>
            )}
            {enrollment.city && (
              <div>
                <Label className="text-sm text-gray-500">City</Label>
                <p className="text-lg">{enrollment.city}</p>
              </div>
            )}
            <div>
              <Label className="text-sm text-gray-500">Enrolled At</Label>
              <p className="text-lg">
                {new Date(enrollment.focusOneEnrollment.enrolledAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Focus One Program Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm text-gray-500">Program ID</Label>
              <p className="text-lg font-semibold">
                Focus One #{focusOneId?.slice(-6) || 'N/A'}
              </p>
            </div>
            <div>
              <Label className="text-sm text-gray-500">Status</Label>
              <div className="mt-1">
                <Badge 
                  variant={
                    focusOneStatus === 'active' ? 'default' :
                    focusOneStatus === 'paused' ? 'secondary' :
                    focusOneStatus === 'completed' ? 'default' :
                    'outline'
                  }
                  className="capitalize"
                >
                  {focusOneStatus}
                </Badge>
              </div>
            </div>
            {focusOne?.description && (
              <div>
                <Label className="text-sm text-gray-500">Description</Label>
                <p className="text-lg">{focusOne.description}</p>
              </div>
            )}
            {focusOne?.pausedAt && (
              <div>
                <Label className="text-sm text-gray-500">Paused At</Label>
                <p className="text-lg">{new Date(focusOne.pausedAt).toLocaleString()}</p>
              </div>
            )}
            {focusOne?.pausedBy && (
              <div>
                <Label className="text-sm text-gray-500">Paused By</Label>
                <p className="text-lg">
                  {focusOne.pausedBy.name || focusOne.pausedBy.email}
                </p>
              </div>
            )}
            {focusOne?.resumedAt && (
              <div>
                <Label className="text-sm text-gray-500">Resumed At</Label>
                <p className="text-lg">{new Date(focusOne.resumedAt).toLocaleString()}</p>
              </div>
            )}
            {/* Pause/Resume buttons */}
            <div className="flex space-x-2 pt-2">
              {focusOneStatus === 'active' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePause}
                  disabled={pausing}
                  className="text-orange-600 hover:text-orange-700"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  {pausing ? 'Pausing...' : 'Pause'}
                </Button>
              )}
              {focusOneStatus === 'paused' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResume}
                  disabled={resuming}
                  className="text-green-600 hover:text-green-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {resuming ? 'Resuming...' : 'Resume'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pause History */}
      {focusOne?.pauseHistory && focusOne.pauseHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pause History</CardTitle>
            <CardDescription>History of pause and resume actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {focusOne.pauseHistory.map((pause, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold">
                        Paused: {new Date(pause.pausedAt).toLocaleString()}
                      </p>
                      {pause.pausedBy && (
                        <p className="text-sm text-gray-600">
                          By: {pause.pausedBy.name || pause.pausedBy.email}
                        </p>
                      )}
                      {pause.resumedAt && (
                        <>
                          <p className="font-semibold mt-2">
                            Resumed: {new Date(pause.resumedAt).toLocaleString()}
                          </p>
                          {pause.resumedBy && (
                            <p className="text-sm text-gray-600">
                              By: {pause.resumedBy.name || pause.resumedBy.email}
                            </p>
                          )}
                        </>
                      )}
                      {!pause.resumedAt && (
                        <Badge variant="secondary" className="mt-2">Currently Paused</Badge>
                      )}
                      {pause.reason && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Reason:</span> {pause.reason}
                        </p>
                      )}
                      {pause.notes && (
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Notes:</span> {pause.notes}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Teacher-Subject Mappings Display */}
      {enrollment.focusOneEnrollment.teacherSubjectMappings && 
       enrollment.focusOneEnrollment.teacherSubjectMappings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Current Teacher-Subject Mappings</CardTitle>
            <CardDescription>Current assignment of teachers to subjects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {enrollment.focusOneEnrollment.teacherSubjectMappings.map((mapping, idx) => {
                const teacher = mapping.teacher
                const subject = mapping.subject
                return (
                  <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                      <span className="font-medium">{subject?.name || 'Unknown Subject'}</span>
                      <span className="text-gray-500 mx-2">→</span>
                      <span>{teacher?.name || teacher?.email || 'Unknown Teacher'}</span>
                      {teacher?.email && (
                        <span className="text-gray-500 ml-2">({teacher.email})</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Update Teacher-Subject Mappings</CardTitle>
          <CardDescription>
            Update which teachers are assigned to which subjects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Teacher-Subject Mappings</Label>
              <p className="text-sm text-gray-500 mb-3">
                Assign teachers to specific subjects. A subject can have multiple teachers.
              </p>
              
              {loadingSubjects || loadingTeachers ? (
                <p className="text-sm text-gray-500">Loading subjects and teachers...</p>
              ) : (
                <div className="space-y-4 border border-gray-300 rounded-md p-4">
                  {subjects.map((subject) => (
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
                      {getMappingsForSubject(subject._id).length > 0 && (
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
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="startedAt">Started At</Label>
                <Input
                  id="startedAt"
                  name="startedAt"
                  type="date"
                  value={formData.startedAt}
                  onChange={handleChange}
                />
              </div>

              <div>
                <Label htmlFor="endedAt">Ended At</Label>
                <Input
                  id="endedAt"
                  name="endedAt"
                  type="date"
                  value={formData.endedAt}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Pause form (only show when active) */}
            {focusOneStatus === 'active' && (
              <div className="p-4 bg-orange-50 border border-orange-200 rounded-md">
                <Label className="text-base font-semibold text-orange-900 mb-2 block">
                  Pause Focus One Program
                </Label>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="pauseReason" className="text-sm">Reason (Optional)</Label>
                    <Input
                      id="pauseReason"
                      type="text"
                      value={pauseReason}
                      onChange={(e) => setPauseReason(e.target.value)}
                      placeholder="Reason for pausing..."
                    />
                  </div>
                  <div>
                    <Label htmlFor="pauseNotes" className="text-sm">Notes (Optional)</Label>
                    <Input
                      id="pauseNotes"
                      type="text"
                      value={pauseNotes}
                      onChange={(e) => setPauseNotes(e.target.value)}
                      placeholder="Additional notes..."
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePause}
                    disabled={pausing}
                    className="text-orange-600 hover:text-orange-700 border-orange-300"
                  >
                    <Pause className="h-4 w-4 mr-2" />
                    {pausing ? 'Pausing...' : 'Pause Program'}
                  </Button>
                </div>
              </div>
            )}

            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Cancel Enrollment
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default FocusOneEnrollmentDetail
