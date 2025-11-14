import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'
import { questionAPI, chapterAPI, subjectAPI, optionAPI } from '@/lib/api'
import toast from 'react-hot-toast'

const QuestionForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const isEdit = Boolean(id)
  const searchParams = new URLSearchParams(location.search)
  const initialChapterId = !isEdit
    ? searchParams.get('chapter') || ''
    : ''
  const rawRedirect = searchParams.get('redirect') || ''
  const redirectPath = rawRedirect.startsWith('/') ? rawRedirect : '/questions'
  
  const [formData, setFormData] = useState({
    questionText: '',
    explanation: '',
    chapter: initialChapterId,
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
      const chaptersData = response.data.data.chapters || response.data.data || []
      const sortedChapters = [...chaptersData].sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()
        return dateB - dateA
      })
      setChapters(sortedChapters)
    } catch (error) {
      console.error('Error fetching chapters:', error)
      toast.error('Failed to fetch chapters')
    }
  }

  const fetchQuestion = async () => {
    try {
      setInitialLoading(true)
      const response = await questionAPI.getById(id)
      const questionData = response.data.data
      
      // Handle populated chapter data
      const formData = {
        ...questionData,
        chapter: typeof questionData.chapter === 'object' 
          ? questionData.chapter._id 
          : questionData.chapter
      }
      
      setFormData(formData)
      
      // Fetch options for the question
      const optionsResponse = await optionAPI.getByQuestion(id)
      setOptions(optionsResponse.data.data || [])
    } catch (error) {
      console.error('Error fetching question:', error)
      toast.error('Failed to fetch question')
      navigate(redirectPath)
    } finally {
      setInitialLoading(false)
    }
  }

  const resolveDefaultMarksForChapter = (chapterId) => {
    if (!chapterId) return undefined
    const chapterObj = chapters.find(c => c._id === chapterId)
    if (!chapterObj) return undefined

    const subjectId = typeof chapterObj.subject === 'object' && chapterObj.subject !== null
      ? chapterObj.subject._id || chapterObj.subject.id
      : chapterObj.subject

    let subjectObj = null

    if (typeof chapterObj.subject === 'object' && chapterObj.subject !== null) {
      subjectObj = chapterObj.subject
    }

    if (!subjectObj) {
      subjectObj = subjects.find(s => s._id === subjectId)
    }

    if (!subjectObj) return undefined

    const defaultMarksRaw = subjectObj.defaultMarks
    const parsedMarks = typeof defaultMarksRaw === 'number'
      ? defaultMarksRaw
      : typeof defaultMarksRaw === 'string'
        ? Number(defaultMarksRaw)
        : NaN

    return Number.isFinite(parsedMarks) && parsedMarks > 0
      ? parsedMarks
      : undefined
  }

  const selectedChapterId = formData.chapter

  useEffect(() => {
    if (isEdit || !selectedChapterId) return
    const defaultMarks = resolveDefaultMarksForChapter(selectedChapterId)
    if (typeof defaultMarks !== 'number') return

    setFormData(prev => {
      if (prev.marks === defaultMarks) {
        return prev
      }

      return {
        ...prev,
        marks: defaultMarks
      }
    })
  }, [chapters, subjects, selectedChapterId, isEdit])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === 'chapter') {
      const chapterId = value
      const defaultMarks = !isEdit ? resolveDefaultMarksForChapter(chapterId) : undefined

      setFormData(prev => ({
        ...prev,
        chapter: chapterId,
        marks: !isEdit && typeof defaultMarks === 'number' ? defaultMarks : prev.marks
      }))
      return
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox'
        ? checked
        : type === 'number'
                  ? Math.max(1, Number.isFinite(parseInt(value, 10)) ? parseInt(value, 10) : prev[name])
          : value
    }))
  }

  const handleToggleActive = () => {
    setFormData(prev => ({
      ...prev,
      isActive: !prev.isActive
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
        navigate(redirectPath)
      } else {
        await questionAPI.create(questionData)
        toast.success('Question created successfully')
        setFormData(prev => ({
          ...prev,
          questionText: '',
          explanation: '',
          marks: resolveDefaultMarksForChapter(prev.chapter) || 1
        }))
        setOptions([
          { text: '', isCorrect: false },
          { text: '', isCorrect: false }
        ])
      }
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
          onClick={() => navigate(redirectPath)}
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

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]"
      >
        <Card className="order-2 xl:order-1">
          <CardHeader>
            <CardTitle>Question & Options</CardTitle>
            <CardDescription>
              Configure the question content and answer choices
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
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
                rows={8}
                required
                maxLength={1000}
              />
              <p className="text-sm text-gray-500">
                {formData.questionText.length}/1000 characters
              </p>
            </div>

            <div className="space-y-4 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Options</h3>
                <p className="text-sm text-gray-500">
                  Provide up to four answer choices and mark the correct ones
                </p>
              </div>

              <div className="space-y-3">
                {options.map((option, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-3 rounded-md border border-gray-200 p-3 sm:flex-row sm:items-center sm:gap-4 dark:border-gray-700"
                  >
                    <div className="flex-1">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                        maxLength={500}
                      />
                    </div>
                    <div className="flex items-center gap-2">
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
              </div>

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

              <div className="rounded-md bg-gray-50 p-4 text-sm text-gray-600 dark:bg-gray-900/40 dark:text-gray-300">
                <p>• At least 2 options are required</p>
                <p>• Mark at least 1 option as correct</p>
                <p>• Maximum 4 options allowed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="order-1 xl:order-2">
          <CardHeader>
            <CardTitle>Explanation & Settings</CardTitle>
            <CardDescription>
              Provide additional context and configure visibility
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="explanation">Explanation</Label>
              <Textarea
                id="explanation"
                name="explanation"
                value={formData.explanation}
                onChange={handleChange}
                placeholder="Enter explanation for the answer"
                rows={10}
                maxLength={2000}
              />
              <p className="text-sm text-gray-500">
                {formData.explanation.length}/2000 characters
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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

            <div className="flex items-center justify-between rounded-md border border-gray-200 px-3 py-2 dark:border-gray-800">
              <Label className="text-sm font-medium">
                Active
              </Label>
              <button
                type="button"
                role="switch"
                aria-checked={formData.isActive}
                aria-label="Toggle active state"
                onClick={handleToggleActive}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    handleToggleActive()
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  formData.isActive
                    ? 'bg-primary'
                    : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    formData.isActive ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(redirectPath)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white"></div>
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEdit ? 'Update Question' : 'Create Question'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

export default QuestionForm
