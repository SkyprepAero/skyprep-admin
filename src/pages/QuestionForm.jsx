import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save, Plus, Trash2, Check } from 'lucide-react'
import { questionAPI, chapterAPI, subjectAPI, optionAPI } from '@/lib/api'
import toast from 'react-hot-toast'

const QuestionForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  
  const [formData, setFormData] = useState({
    questionText: '',
    explanation: '',
    chapter: '',
    difficulty: 'medium',
    marks: 1,
    isActive: true
  })
  const [options, setOptions] = useState([
    { text: '', isCorrect: false },
    { text: '', isCorrect: false }
  ])
  const [chapters, setChapters] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEdit)

  useEffect(() => {
    fetchSubjects()
    fetchChapters()
    if (isEdit) {
      fetchQuestion()
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

  const fetchChapters = async () => {
    try {
      const response = await chapterAPI.getAll({ limit: 100 })
      setChapters(response.data.data.chapters || response.data.data)
    } catch (error) {
      console.error('Error fetching chapters:', error)
      toast.error('Failed to fetch chapters')
    }
  }

  const fetchQuestion = async () => {
    try {
      setInitialLoading(true)
      const response = await questionAPI.getById(id)
      setFormData(response.data.data)
      
      // Fetch options for the question
      const optionsResponse = await optionAPI.getByQuestion(id)
      setOptions(optionsResponse.data.data || [])
    } catch (error) {
      console.error('Error fetching question:', error)
      toast.error('Failed to fetch question')
      navigate('/questions')
    } finally {
      setInitialLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (type === 'number' ? parseInt(value) || 1 : value)
    }))
  }

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options]
    newOptions[index] = { ...newOptions[index], [field]: value }
    setOptions(newOptions)
  }

  const addOption = () => {
    if (options.length < 4) {
      setOptions([...options, { text: '', isCorrect: false }])
    }
  }

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index)
      setOptions(newOptions)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.questionText.trim()) {
      toast.error('Question text is required')
      return
    }

    if (!formData.chapter) {
      toast.error('Please select a chapter')
      return
    }

    const validOptions = options.filter(option => option.text.trim())
    if (validOptions.length < 2) {
      toast.error('At least 2 options are required')
      return
    }

    const correctOptions = validOptions.filter(option => option.isCorrect)
    if (correctOptions.length === 0) {
      toast.error('At least one correct option is required')
      return
    }

    try {
      setLoading(true)
      
      const questionData = {
        ...formData,
        options: validOptions
      }
      
      if (isEdit) {
        await questionAPI.update(id, questionData)
        toast.success('Question updated successfully')
      } else {
        await questionAPI.create(questionData)
        toast.success('Question created successfully')
      }
      
      navigate('/questions')
    } catch (error) {
      console.error('Error saving question:', error)
      const errorMessage = error.response?.data?.message || 'Failed to save question'
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
          onClick={() => navigate('/questions')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEdit ? 'Edit Question' : 'Create Question'}
          </h1>
          <p className="mt-2 text-gray-600">
            {isEdit ? 'Update question information' : 'Add a new question to a chapter'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Question Details</CardTitle>
            <CardDescription>
              Fill in the question information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="chapter">Chapter *</Label>
                <Select
                  id="chapter"
                  name="chapter"
                  value={formData.chapter}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a chapter</option>
                  {chapters.map(chapter => {
                    const subject = subjects.find(s => s._id === chapter.subject)
                    return (
                      <option key={chapter._id} value={chapter._id}>
                        {subject?.name} - {chapter.name}
                      </option>
                    )
                  })}
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="questionText">Question Text *</Label>
                <Textarea
                  id="questionText"
                  name="questionText"
                  value={formData.questionText}
                  onChange={handleChange}
                  placeholder="Enter your question"
                  rows={4}
                  required
                  maxLength={1000}
                />
                <p className="text-sm text-gray-500">
                  {formData.questionText.length}/1000 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="explanation">Explanation</Label>
                <Textarea
                  id="explanation"
                  name="explanation"
                  value={formData.explanation}
                  onChange={handleChange}
                  placeholder="Enter explanation for the answer"
                  rows={3}
                  maxLength={2000}
                />
                <p className="text-sm text-gray-500">
                  {formData.explanation.length}/2000 characters
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select
                    id="difficulty"
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleChange}
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="marks">Marks</Label>
                  <Input
                    id="marks"
                    name="marks"
                    type="number"
                    value={formData.marks}
                    onChange={handleChange}
                    min="1"
                    max="10"
                  />
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
                  onClick={() => navigate('/questions')}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {isEdit ? 'Update Question' : 'Create Question'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Options</CardTitle>
            <CardDescription>
              Add answer options for the question
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                  <div className="flex-1">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option.text}
                      onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                      maxLength={500}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={option.isCorrect}
                      onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <Label className="text-sm">Correct</Label>
                    {options.length > 2 && (
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => removeOption(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              
              {options.length < 4 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addOption}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Option
                </Button>
              )}

              <div className="text-sm text-gray-500">
                <p>• At least 2 options are required</p>
                <p>• At least 1 correct option is required</p>
                <p>• Maximum 4 options allowed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default QuestionForm
