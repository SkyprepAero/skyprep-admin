import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit, Trash2, RotateCcw, FileText } from 'lucide-react'
import { chapterAPI, subjectAPI } from '@/lib/api'
import toast from 'react-hot-toast'

const Chapters = () => {
  const [chapters, setChapters] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
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
  }, [pagination.currentPage, searchTerm, selectedSubject, showDeleted])

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
      setLoading(true)
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchTerm || undefined,
        subject: selectedSubject || undefined,
        isActive: showDeleted ? undefined : true
      }

      const response = showDeleted 
        ? await chapterAPI.getDeleted(params)
        : await chapterAPI.getAll(params)

      setChapters(response.data.data.chapters || response.data.data)
      setPagination(response.data.data.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: response.data.data.length || 0,
        itemsPerPage: 10
      })
    } catch (error) {
      console.error('Error fetching chapters:', error)
      toast.error('Failed to fetch chapters')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this chapter?')) {
      try {
        await chapterAPI.delete(id)
        toast.success('Chapter deleted successfully')
        fetchChapters()
      } catch (error) {
        console.error('Error deleting chapter:', error)
        toast.error('Failed to delete chapter')
      }
    }
  }

  const handleRestore = async (id) => {
    try {
      await chapterAPI.restore(id)
      toast.success('Chapter restored successfully')
      fetchChapters()
    } catch (error) {
      console.error('Error restoring chapter:', error)
      toast.error('Failed to restore chapter')
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handleSubjectFilter = (e) => {
    setSelectedSubject(e.target.value)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  const getSubjectName = (subject) => {
    // Handle both populated subject object and subject ID
    if (typeof subject === 'object' && subject.name) {
      return subject.name
    }
    
    // Fallback to looking up by ID
    const subjectObj = subjects.find(s => s._id === subject)
    return subjectObj ? subjectObj.name : 'Unknown Subject'
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
          <h1 className="text-3xl font-bold text-gray-900">Chapters</h1>
          <p className="mt-2 text-gray-600">
            Manage chapters within your subjects
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={showDeleted ? "default" : "outline"}
            onClick={() => setShowDeleted(!showDeleted)}
          >
            {showDeleted ? 'Show Active' : 'Show Deleted'}
          </Button>
          <Link to="/chapters/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Chapter
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search chapters..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
        </div>
        <div className="w-64">
          <Select value={selectedSubject} onChange={handleSubjectFilter}>
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject._id} value={subject._id}>
                {subject.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {chapters.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showDeleted ? 'No deleted chapters' : 'No chapters found'}
            </h3>
            <p className="text-gray-500 text-center">
              {showDeleted 
                ? 'There are no deleted chapters to restore.'
                : 'Get started by creating your first chapter.'
              }
            </p>
            {!showDeleted && (
              <Link to="/chapters/new" className="mt-4">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Chapter
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {chapters.map((chapter) => (
            <Card key={chapter._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{chapter.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {chapter.description || 'No description'}
                    </CardDescription>
                  </div>
                  <Badge variant={chapter.isActive ? "default" : "secondary"}>
                    {chapter.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    <strong>Subject:</strong> {getSubjectName(chapter.subject)}
                  </div>
                  <div className="text-sm text-gray-600">
                    <strong>Order:</strong> {chapter.order}
                  </div>
                  <div className="text-sm text-gray-500">
                    Created: {new Date(chapter.createdAt).toLocaleDateString()}
                  </div>
                  {chapter.deletedAt && (
                    <div className="text-sm text-red-500">
                      Deleted: {new Date(chapter.deletedAt).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex space-x-2 pt-2">
                    {showDeleted ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestore(chapter._id)}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Restore
                      </Button>
                    ) : (
                      <>
                        <Link to={`/chapters/${chapter._id}/edit`}>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(chapter._id)}
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
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            Previous
          </Button>
          <span className="flex items-center px-4 py-2 text-sm text-gray-700">
            Page {pagination.currentPage} of {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

export default Chapters
