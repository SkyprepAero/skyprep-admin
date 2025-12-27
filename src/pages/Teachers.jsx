import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, Search, Mail, Phone, MapPin, UserCog } from 'lucide-react'
import { teacherAPI } from '@/lib/api'
import toast from 'react-hot-toast'

const Teachers = () => {
  const navigate = useNavigate()
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  useEffect(() => {
    fetchTeachers()
  }, [page, searchTerm])

  const fetchTeachers = async () => {
    try {
      setLoading(true)
      const params = {
        page,
        limit,
        search: searchTerm || undefined
      }
      const response = await teacherAPI.getAll(params)
      const responseData = response.data.data || response.data
      
      if (Array.isArray(responseData)) {
        setTeachers(responseData)
        setTotal(responseData.length)
        setTotalPages(1)
      } else {
        // Handle paginated response
        setTeachers(responseData.users || responseData.data || [])
        setTotal(responseData.total || responseData.count || 0)
        setTotalPages(responseData.pagination?.totalPages || Math.ceil((responseData.total || 0) / limit))
      }
    } catch (error) {
      console.error('Error fetching teachers:', error)
      toast.error('Failed to fetch teachers')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchTeachers()
  }

  const handleAddTeacher = () => {
    navigate('/teachers/register')
  }

  if (loading && teachers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teachers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teachers</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage teachers and their details
          </p>
        </div>
        <Button onClick={handleAddTeacher}>
          <Plus className="h-4 w-4 mr-2" />
          Add Teacher
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Teachers</CardTitle>
          <CardDescription>
            Search and manage teachers ({total} total)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="outline">
                Search
              </Button>
            </div>
          </form>

          {teachers.length === 0 ? (
            <div className="text-center py-12">
              <UserCog className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm
                  ? 'Try adjusting your search criteria'
                  : 'Get started by adding a new teacher'}
              </p>
              {!searchTerm && (
                <Button onClick={handleAddTeacher}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Teacher
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {teachers.map((teacher) => (
                  <Card key={teacher._id || teacher.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {teacher.name || 'No name provided'}
                            </h3>
                            {teacher.isActive === false && (
                              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">
                                Inactive
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              <span>{teacher.email}</span>
                            </div>
                            {teacher.phoneNumber && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4" />
                                <span>{teacher.phoneNumber}</span>
                              </div>
                            )}
                            {teacher.city && (
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                <span>{teacher.city}</span>
                              </div>
                            )}
                          </div>
                          {teacher.roles && teacher.roles.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {teacher.roles.map((role) => (
                                <span
                                  key={role._id || role.id || role}
                                  className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded"
                                >
                                  {typeof role === 'string' ? role : (role.name || role.displayName || 'Teacher')}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Page {page} of {totalPages} ({total} total)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Teachers

