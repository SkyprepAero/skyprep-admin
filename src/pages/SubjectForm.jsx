import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Save } from 'lucide-react'
import { subjectAPI } from '@/lib/api'
import toast from 'react-hot-toast'

const SubjectForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  })
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEdit)

  useEffect(() => {
    if (isEdit) {
      fetchSubject()
    }
  }, [id, isEdit])

  const fetchSubject = async () => {
    try {
      setInitialLoading(true)
      const response = await subjectAPI.getById(id)
      setFormData(response.data.data)
    } catch (error) {
      console.error('Error fetching subject:', error)
      toast.error('Failed to fetch subject')
      navigate('/subjects')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Subject name is required')
      return
    }

    try {
      setLoading(true)
      
      if (isEdit) {
        await subjectAPI.update(id, formData)
        toast.success('Subject updated successfully')
      } else {
        await subjectAPI.create(formData)
        toast.success('Subject created successfully')
      }
      
      navigate('/subjects')
    } catch (error) {
      console.error('Error saving subject:', error)
      const errorMessage = error.response?.data?.message || 'Failed to save subject'
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
          onClick={() => navigate('/subjects')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Subject' : 'Create Subject'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEdit ? 'Update subject information' : 'Add a new subject to your test series'}
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Subject Details</CardTitle>
          <CardDescription>
            Fill in the information for your subject
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Subject Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter subject name"
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
                placeholder="Enter subject description"
                rows={4}
                maxLength={500}
              />
              <p className="text-sm text-gray-500">
                {formData.description.length}/500 characters
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
                onClick={() => navigate('/subjects')}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEdit ? 'Update Subject' : 'Create Subject'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default SubjectForm
