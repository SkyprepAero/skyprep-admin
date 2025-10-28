import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit, Trash2, RotateCcw, HelpCircle } from 'lucide-react'
import { questionAPI, chapterAPI, subjectAPI } from '@/lib/api'
import toast from 'react-hot-toast'

const Questions = () => {
  const [questions, setQuestions] = useState([])
  const [chapters, setChapters] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedChapter, setSelectedChapter] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [selectedDifficulty, setSelectedDifficulty] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  })

  useEffect(() => {
    fetchSubjects()
    fetchChapters()
    fetchQuestions()
  }, [pagination.currentPage, searchTerm, selectedChapter, selectedSubject, selectedDifficulty, showDeleted])

  const fetchSubjects = async () => {
    try {
      const response = await subjectAPI.getAll({ limit: 100 })
      setSubjects(response.data.data.subjects || response.data.data)
    } catch (error) {
      console.error('Error fetching subjects:', error)
    }
  }

  const fetchChapters = async () => {
    try {
      const response = await chapterAPI.getAll({ limit: 100 })
      setChapters(response.data.data.chapters || response.data.data)
    } catch (error) {
      console.error('Error fetching chapters:', error)
    }
  }

  const fetchQuestions = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchTerm || undefined,
        chapter: selectedChapter || undefined,
        subject: selectedSubject || undefined,
        difficulty: selectedDifficulty || undefined,
        isActive: showDeleted ? undefined : true
      }

      const response = showDeleted 
        ? await questionAPI.getDeleted(params)
        : await questionAPI.getAll(params)

      const responseData = response.data.data
      setQuestions(responseData.questions || responseData)
      setPagination(responseData.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: responseData.length || 0,
        itemsPerPage: 10
      })
    } catch (error) {
      console.error('Error fetching questions:', error)
      toast.error('Failed to fetch questions')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        await questionAPI.delete(id)
        toast.success('Question deleted successfully')
        fetchQuestions()
      } catch (error) {
        console.error('Error deleting question:', error)
        toast.error('Failed to delete question')
      }
    }
  }

  const handleRestore = async (id) => {
    try {
      await questionAPI.restore(id)
      toast.success('Question restored successfully')
      fetchQuestions()
    } catch (error) {
      console.error('Error restoring question:', error)
      toast.error('Failed to restore question')
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleChapterFilter = (e) => {
    setSelectedChapter(e.target.value)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleSubjectFilter = (e) => {
    setSelectedSubject(e.target.value)
    setSelectedChapter('') // Reset chapter when subject changes
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleDifficultyFilter = (e) => {
    setSelectedDifficulty(e.target.value)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  const getChapterName = (chapter) => {
    // Handle both populated chapter object and chapter ID
    if (typeof chapter === 'object' && chapter.name) {
      return chapter.name
    }
    
    // Fallback to looking up by ID
    const chapterObj = chapters.find(c => c._id === chapter)
    return chapterObj ? chapterObj.name : 'Unknown Chapter'
  }

  const getSubjectName = (chapter) => {
    // Handle both populated chapter object and chapter ID
    if (typeof chapter === 'object' && chapter.subject) {
      // If chapter has populated subject
      if (typeof chapter.subject === 'object' && chapter.subject.name) {
        return chapter.subject.name
      }
      // If chapter has subject ID, look it up
      const subject = subjects.find(s => s._id === chapter.subject)
      return subject ? subject.name : 'Unknown Subject'
    }
    
    // Fallback to looking up by ID
    const chapterObj = chapters.find(c => c._id === chapter)
    if (!chapterObj) return 'Unknown Subject'
    const subject = subjects.find(s => s._id === chapterObj.subject)
    return subject ? subject.name : 'Unknown Subject'
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'hard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Questions</h1>
          <p className="mt-2 text-gray-600">
            Manage questions within your chapters
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={showDeleted ? "default" : "outline"}
            onClick={() => setShowDeleted(!showDeleted)}
          >
            {showDeleted ? 'Show Active' : 'Show Deleted'}
          </Button>
          <Link to="/questions/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search questions..."
            value={searchTerm}
            onChange={handleSearch}
            className="pl-10"
          />
        </div>
        <Select value={selectedSubject} onChange={handleSubjectFilter}>
          <option value="">All Subjects</option>
          {subjects.map(subject => (
            <option key={subject._id} value={subject._id}>
              {subject.name}
            </option>
          ))}
        </Select>
        <Select value={selectedChapter} onChange={handleChapterFilter}>
          <option value="">All Chapters</option>
          {chapters
            .filter(chapter => !selectedSubject || chapter.subject === selectedSubject)
            .map(chapter => (
              <option key={chapter._id} value={chapter._id}>
                {chapter.name}
              </option>
            ))}
        </Select>
        <Select value={selectedDifficulty} onChange={handleDifficultyFilter}>
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </Select>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <HelpCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showDeleted ? 'No deleted questions' : 'No questions found'}
            </h3>
            <p className="text-gray-500 text-center">
              {showDeleted 
                ? 'There are no deleted questions to restore.'
                : 'Get started by creating your first question.'
              }
            </p>
            {!showDeleted && (
              <Link to="/questions/new" className="mt-4">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Question
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {questions.map((question) => (
            <Card key={question._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">
                      {question.questionText}
                    </CardTitle>
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant={question.isActive ? "default" : "secondary"}>
                        {question.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge className={getDifficultyColor(question.difficulty)}>
                        {question.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        {question.marks} mark{question.marks !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    <strong>Subject:</strong> {getSubjectName(question.chapter)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Chapter:</strong> {getChapterName(question.chapter)}
                  </div>
                  {question.explanation && (
                    <div className="text-sm text-gray-600">
                      <strong>Explanation:</strong> {question.explanation}
                    </div>
                  )}
                  <div className="text-sm text-gray-500">
                    Created: {new Date(question.createdAt).toLocaleDateString()}
                  </div>
                  {question.deletedAt && (
                    <div className="text-sm text-red-500">
                      Deleted: {new Date(question.deletedAt).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex space-x-2 pt-2">
                    {showDeleted ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestore(question._id)}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Restore
                      </Button>
                    ) : (
                      <>
                        <Link to={`/questions/${question._id}/edit`}>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(question._id)}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
            >
              Previous
            </Button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={page === pagination.currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                  className="w-8 h-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
            >
              Next
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of {pagination.totalItems} results
          </div>
        </div>
      )}
    </div>
  )
}

export default Questions
