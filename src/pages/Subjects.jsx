import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit, Trash2, RotateCcw, BookOpen } from 'lucide-react'
import { subjectAPI } from '@/lib/api'
import toast from 'react-hot-toast'

const Subjects = () => {
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showDeleted, setShowDeleted] = useState(false)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  })

  useEffect(() => {
    fetchSubjects()
  }, [pagination.currentPage, searchTerm, showDeleted])

  const fetchSubjects = async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        search: searchTerm || undefined,
        isActive: showDeleted ? undefined : true
      }

      const response = showDeleted 
        ? await subjectAPI.getDeleted(params)
        : await subjectAPI.getAll(params)

      const responseData = response.data.data
      setSubjects(responseData.subjects || responseData)
      
      const paginationData = responseData.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: responseData.length || 0,
        itemsPerPage: 10
      }
      
      // Debug pagination data
      if (import.meta.env.DEV) {
        console.log('Pagination data:', paginationData)
      }
      
      setPagination(paginationData)
    } catch (error) {
      console.error('Error fetching subjects:', error)
      toast.error('Failed to fetch subjects')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subject?')) {
      try {
        await subjectAPI.delete(id)
        toast.success('Subject deleted successfully')
        fetchSubjects()
      } catch (error) {
        console.error('Error deleting subject:', error)
        toast.error('Failed to delete subject')
      }
    }
  }

  const handleRestore = async (id) => {
    try {
      await subjectAPI.restore(id)
      toast.success('Subject restored successfully')
      fetchSubjects()
    } catch (error) {
      console.error('Error restoring subject:', error)
      toast.error('Failed to restore subject')
    }
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setPagination(prev => ({ ...prev, currentPage: 1 }))
  }

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (subject.description && subject.description.toLowerCase().includes(searchTerm.toLowerCase()))
  )

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
          <h1 className="text-3xl font-bold text-gray-900">Subjects</h1>
          <p className="mt-2 text-gray-600">
            Manage your test series subjects
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={showDeleted ? "default" : "outline"}
            onClick={() => setShowDeleted(!showDeleted)}
          >
            {showDeleted ? 'Show Active' : 'Show Deleted'}
          </Button>
          <Link to="/subjects/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search subjects..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {filteredSubjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {showDeleted ? 'No deleted subjects' : 'No subjects found'}
            </h3>
            <p className="text-gray-500 text-center">
              {showDeleted 
                ? 'There are no deleted subjects to restore.'
                : 'Get started by creating your first subject.'
              }
            </p>
            {!showDeleted && (
              <Link to="/subjects/new" className="mt-4">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subject
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSubjects.map((subject) => (
            <Card key={subject._id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{subject.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {subject.description || 'No description'}
                    </CardDescription>
                  </div>
                  <Badge variant={subject.isActive ? "default" : "secondary"}>
                    {subject.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-gray-500">
                    Created: {new Date(subject.createdAt).toLocaleDateString()}
                  </div>
                  {subject.deletedAt && (
                    <div className="text-sm text-red-500">
                      Deleted: {new Date(subject.deletedAt).toLocaleDateString()}
                    </div>
                  )}
                  <div className="flex space-x-2 pt-2">
                    {showDeleted ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestore(subject._id)}
                      >
                        <RotateCcw className="h-4 w-4 mr-1" />
                        Restore
                      </Button>
                    ) : (
                      <>
                        <Link to={`/subjects/${subject._id}/edit`}>
                          <Button size="sm" variant="outline">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(subject._id)}
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

export default Subjects
