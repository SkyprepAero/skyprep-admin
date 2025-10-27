import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { ArrowLeft, Save } from 'lucide-react'
import { chapterAPI, subjectAPI } from '@/lib/api'
import toast from 'react-hot-toast'

const ChapterForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    order: 0,
    isActive: true
  })
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEdit)

  useEffect(() => {
    fetchSubjects()
    if (isEdit) {
      fetchChapter()
    }
  }, [id, isEdit])

  const fetchSubjects = async () => {
    try {
      const response = await subjectAPI.getAll({ limit: 100 })
      setSubjects(response.data.data.subjects || response.data.data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
      toast.error('Failed to fetch subjects')
    }
  }

  const fetchChapter = async () => {
    try {
      setInitialLoading(true)
      const response = await chapterAPI.getById(id)
      setFormData(response.data.data)
    } catch (error) {
      console.error('Error fetching chapter:', error)
      toast.error('Failed to fetch chapter')
      navigate('/chapters')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 0 : value)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Chapter name is required')
      return
    }

    if (!formData.subject) {
      toast.error('Please select a subject')
      return
    }

    try {
      setLoading(true)
      
      if (isEdit) {
        await chapterAPI.update(id, formData)
        toast.success('Chapter updated successfully')
      } else {
        await chapterAPI.create(formData)
        toast.success('Chapter created successfully')
      }
      
      navigate('/chapters')
    } catch (error) {
      console.error('Error saving chapter:', error)
      const errorMessage = error.response?.data?.message || 'Failed to save chapter'
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
          onClick={() => navigate('/chapters')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Chapter' : 'Create Chapter'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEdit ? 'Update chapter information' : 'Add a new chapter to a subject'}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Chapter Details</CardTitle>
          <CardDescription>
            Fill in the information for your chapter
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              >
                <option value="">Select a subject</option>
                {subjects.map(subject => (
                  <option key={subject._id} value={subject._id}>
                    {subject.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Chapter Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter chapter name"
                required
                maxLength={100}
              />
              <p className="text-sm text-gray-500">
                {formData.name.length}/100 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter chapter description"
                rows={4}
                maxLength={500}
              />
              <p className="text-sm text-gray-500">
                {formData.description.length}/500 characters
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Order</Label>
              <Input
                id="order"
                name="order"
                type="number"
                value={formData.order}
                onChange={handleChange}
                placeholder="Enter chapter order"
                min="0"
              />
              <p className="text-sm text-gray-500">
                Lower numbers appear first
              </p>
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
                onClick={() => navigate('/chapters')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEdit ? 'Update Chapter' : 'Create Chapter'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default ChapterForm
