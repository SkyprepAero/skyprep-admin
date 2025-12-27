import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { ArrowLeft, Save, X } from 'lucide-react'
import { courseAPI, subjectAPI } from '@/lib/api'
import toast from 'react-hot-toast'

const COURSE_TYPES = [
  { value: 'focus_one', label: 'Focus One' },
  { value: 'cohort', label: 'Cohort' },
  { value: 'test_series', label: 'Test Series' }
]

// Helper to generate slug from name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const CourseForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: '',
    description: '',
    tags: '',
    isActive: true,
    enrollmentConfig: {
      maxSeats: '',
      allowWaitlist: false,
      autoApproveEnrollments: true
    }
  })
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEdit)

  useEffect(() => {
    fetchSubjects()
    if (isEdit) {
      fetchCourse()
    }
  }, [id, isEdit])

  const fetchSubjects = async () => {
    try {
      const response = await subjectAPI.getAll({ limit: 100 })
      const responseData = response.data.data
      setSubjects(responseData.subjects || responseData || [])
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }

  const fetchCourse = async () => {
    try {
      setInitialLoading(true)
      const response = await courseAPI.getById(id)
      const courseData = response.data.data
      setFormData({
        name: courseData.name || '',
        slug: courseData.slug || '',
        type: courseData.type || '',
        description: courseData.description || '',
        tags: courseData.tags ? courseData.tags.join(', ') : '',
        isActive: courseData.isActive ?? true,
        enrollmentConfig: {
          maxSeats: courseData.enrollmentConfig?.maxSeats || '',
          allowWaitlist: courseData.enrollmentConfig?.allowWaitlist ?? false,
          autoApproveEnrollments: courseData.enrollmentConfig?.autoApproveEnrollments ?? true
        }
      })
    } catch (error) {
      console.error('Error fetching course:', error)
      toast.error('Failed to fetch course')
      navigate('/courses')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.startsWith('enrollmentConfig.')) {
      const field = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        enrollmentConfig: {
          ...prev.enrollmentConfig,
          [field]: type === 'checkbox' ? checked : (field === 'maxSeats' ? value : value)
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
      
      // Auto-generate slug when name changes (only if slug is empty or matches old name)
      if (name === 'name' && !isEdit) {
        setFormData(prev => ({
          ...prev,
          slug: generateSlug(value)
        }))
      }
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Course name is required')
      return
    }

    if (!formData.type) {
      toast.error('Course type is required')
      return
    }

    if (!formData.slug.trim()) {
      toast.error('Course slug is required')
      return
    }

    try {
      setLoading(true)
      
      // Prepare data for submission
      const submitData = {
        name: formData.name.trim(),
        slug: formData.slug.trim().toLowerCase(),
        type: formData.type,
        description: formData.description.trim(),
        tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(t => t) : [],
        isActive: formData.isActive,
        enrollmentConfig: {
          maxSeats: formData.enrollmentConfig.maxSeats ? parseInt(formData.enrollmentConfig.maxSeats) : null,
          allowWaitlist: formData.enrollmentConfig.allowWaitlist,
          autoApproveEnrollments: formData.enrollmentConfig.autoApproveEnrollments
        }
      }
      
      if (isEdit) {
        await courseAPI.update(id, submitData)
        toast.success('Course updated successfully')
      } else {
        await courseAPI.create(submitData)
        toast.success('Course created successfully')
      }
      
      navigate('/courses')
    } catch (error) {
      console.error('Error saving course:', error)
      const errorMessage = error.response?.data?.message || 'Failed to save course'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button
          variant="outline"
          onClick={() => navigate('/courses')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Course' : 'Create Course'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEdit ? 'Update course information' : 'Add a new course template'}
          </p>
        </div>
      </div>

      <Card className="max-w-3xl">
        <CardHeader>
          <CardTitle>Course Details</CardTitle>
          <CardDescription>
            Fill in the information for your course
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Course Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter course name"
                  required
                  maxLength={100}
                />
                <p className="text-sm text-gray-500">
                  {formData.name.length}/100 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Course Type *</Label>
                <Select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select course type</option>
                  {COURSE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="course-slug"
                required
                pattern="[a-z0-9-]+"
                title="Slug must contain only lowercase letters, numbers, and hyphens"
              />
              <p className="text-sm text-gray-500">
                URL-friendly identifier (lowercase, hyphens only)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter course description"
                rows={4}
                maxLength={1000}
              />
              <p className="text-sm text-gray-500">
                {formData.description.length}/1000 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="tag1, tag2, tag3"
              />
              <p className="text-sm text-gray-500">
                Separate tags with commas
              </p>
            </div>

            <div className="space-y-4 rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900">Enrollment Configuration</h3>
              
              <div className="space-y-2">
                <Label htmlFor="maxSeats">Maximum Seats</Label>
                <Input
                  id="maxSeats"
                  name="enrollmentConfig.maxSeats"
                  type="number"
                  value={formData.enrollmentConfig.maxSeats}
                  onChange={handleChange}
                  placeholder="Leave empty for unlimited"
                  min="0"
                />
                <p className="text-sm text-gray-500">
                  Maximum number of students. Leave empty for unlimited.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="allowWaitlist"
                  name="enrollmentConfig.allowWaitlist"
                  checked={formData.enrollmentConfig.allowWaitlist}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="allowWaitlist">Allow Waitlist</Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoApproveEnrollments"
                  name="enrollmentConfig.autoApproveEnrollments"
                  checked={formData.enrollmentConfig.autoApproveEnrollments}
                  onChange={handleChange}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="autoApproveEnrollments">Auto-approve Enrollments</Label>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <Label htmlFor="isActive">Active</Label>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/courses')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEdit ? 'Update Course' : 'Create Course'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default CourseForm

