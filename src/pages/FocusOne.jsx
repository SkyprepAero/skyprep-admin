import { useState, useEffect, useCallback, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Eye, Pause, Play, GraduationCap, Users } from 'lucide-react'
import { enrollmentAPI, focusOneAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { DataTable } from '@/components/ui/data-table'

const FocusOne = () => {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20
  })
  const [pausingUserId, setPausingUserId] = useState(null)
  const [isPauseDialogOpen, setIsPauseDialogOpen] = useState(false)
  const [pauseReason, setPauseReason] = useState('')
  const [pauseNotes, setPauseNotes] = useState('')
  const navigate = useNavigate()

  const fetchEnrollments = useCallback(async () => {
    try {
      setLoading(true)
      const params = {
        page: pagination.currentPage,
        limit: pagination.itemsPerPage
      }

      // Only add search parameter if it's not empty
      if (debouncedSearchTerm && debouncedSearchTerm.length > 0) {
        params.search = debouncedSearchTerm
      }

      const response = await enrollmentAPI.getAll(params)
      const responseData = response.data.data
      setEnrollments(responseData.enrollments || [])
      
      const paginationData = responseData.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalItems: responseData.length || 0,
        itemsPerPage: 20
      }
      
      setPagination(paginationData)
    } catch (error) {
      console.error('Error fetching enrollments:', error)
      toast.error('Failed to fetch enrollments')
    } finally {
      setLoading(false)
    }
  }, [pagination.currentPage, pagination.itemsPerPage, debouncedSearchTerm])

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm.trim())
      setPagination(prev => ({ ...prev, currentPage: 1 }))
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  useEffect(() => {
    fetchEnrollments()
  }, [fetchEnrollments])

  const handlePause = async (userId, focusOneId) => {
    if (!pauseReason.trim()) {
      toast.error('Please provide a reason for pausing.')
      return
    }

    try {
      await focusOneAPI.pause(focusOneId, { reason: pauseReason, notes: pauseNotes })
      toast.success('Focus One program paused successfully.')
      setIsPauseDialogOpen(false)
      setPauseReason('')
      setPauseNotes('')
      setPausingUserId(null)
      fetchEnrollments()
    } catch (error) {
      console.error('Error pausing Focus One:', error)
      const errorMessage = error.response?.data?.message || 'Failed to pause Focus One program'
      toast.error(errorMessage)
    }
  }

  const handleResume = async (focusOneId) => {
    if (!window.confirm('Are you sure you want to resume this Focus One program?')) {
      return
    }

    try {
      await focusOneAPI.resume(focusOneId)
      toast.success('Focus One program resumed successfully.')
      fetchEnrollments()
    } catch (error) {
      console.error('Error resuming Focus One:', error)
      const errorMessage = error.response?.data?.message || 'Failed to resume Focus One program'
      toast.error(errorMessage)
    }
  }

  const openPauseDialog = (userId, focusOneId) => {
    setPausingUserId({ userId, focusOneId })
    setIsPauseDialogOpen(true)
  }

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'active': return 'default';
      case 'paused': return 'secondary';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  }

  const columns = useMemo(() => [
    {
      accessorKey: 'student',
      header: 'Student',
      cell: ({ row }) => {
        const enrollment = row.original
        return (
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 h-11 w-11 rounded-full bg-gradient-to-br from-primary/20 via-primary/15 to-primary/10 flex items-center justify-center ring-2 ring-primary/10 shadow-sm">
              <span className="text-sm font-bold text-primary">
                {(enrollment.name || enrollment.email?.split('@')[0] || 'N/A').charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="text-sm font-semibold text-gray-900 truncate">
                {enrollment.name || enrollment.email?.split('@')[0] || 'N/A'}
              </div>
              {enrollment.name && enrollment.email && (
                <div className="text-xs text-gray-500 mt-0.5 truncate">
                  {enrollment.email}
                </div>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'contact',
      header: 'Contact',
      cell: ({ row }) => {
        const enrollment = row.original
        return (
          <div className="flex flex-col space-y-1">
            {enrollment.email && !enrollment.name && (
              <div className="text-sm text-gray-900 font-medium">{enrollment.email}</div>
            )}
            {enrollment.phoneNumber ? (
              <div className="text-sm text-gray-700 flex items-center gap-1">
                <span className="text-gray-400">📞</span>
                {enrollment.phoneNumber}
              </div>
            ) : (
              <span className="text-xs text-gray-400 italic">No phone</span>
            )}
          </div>
        )
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const enrollment = row.original
        const focusOne = enrollment.focusOneEnrollment?.focusOne
        const focusOneStatus = focusOne?.status || enrollment.focusOneEnrollment?.status || 'active'
        return (
          <Badge 
            variant={getStatusBadgeVariant(focusOneStatus)}
            className="capitalize font-semibold px-3 py-1.5 text-xs shadow-sm"
          >
            {focusOneStatus}
          </Badge>
        )
      },
    },
    {
      accessorKey: 'enrolledAt',
      header: 'Enrolled',
      cell: ({ row }) => {
        const enrollment = row.original
        return (
          <div className="text-sm text-gray-700 font-medium">
            {enrollment.focusOneEnrollment?.enrolledAt
              ? new Date(enrollment.focusOneEnrollment.enrolledAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              : '-'}
          </div>
        )
      },
    },
    {
      accessorKey: 'actions',
      header: 'Actions',
      meta: { align: 'right' },
      cell: ({ row }) => {
        const enrollment = row.original
        const focusOne = enrollment.focusOneEnrollment?.focusOne
        const focusOneStatus = focusOne?.status || enrollment.focusOneEnrollment?.status || 'active'
        const focusOneIsActive = focusOne?.isActive !== false
        const isPaused = focusOneStatus === 'paused' || !focusOneIsActive
        const focusOneId = focusOne?._id || focusOne

        return (
          <div className="flex items-center justify-end gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                navigate(`/focus-one/enrollments/${enrollment._id}`)
              }}
              className="h-9 border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 shadow-sm hover:shadow transition-all duration-200 font-medium"
            >
              <Eye className="h-4 w-4 mr-1.5" />
              View
            </Button>
            {isPaused ? (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  handleResume(focusOneId)
                }}
                className="h-9 border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 hover:border-green-300 shadow-sm hover:shadow transition-all duration-200 font-medium"
              >
                <Play className="h-4 w-4 mr-1.5" />
                Resume
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  openPauseDialog(enrollment._id, focusOneId)
                }}
                className="h-9 border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:text-orange-800 hover:border-orange-300 shadow-sm hover:shadow transition-all duration-200 font-medium"
              >
                <Pause className="h-4 w-4 mr-1.5" />
                Pause
              </Button>
            )}
          </div>
        )
      },
    },
  ], [navigate, getStatusBadgeVariant, handleResume, openPauseDialog])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] space-y-5">
        <div className="relative">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary border-t-transparent absolute top-0 left-0"></div>
        </div>
        <div className="text-center space-y-1">
          <p className="text-base font-semibold text-gray-900">Loading students</p>
          <p className="text-sm text-gray-500">Please wait while we fetch the data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl shadow-sm">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">Focus One Students</h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage students enrolled in one-to-one teaching programs
              </p>
            </div>
          </div>
        </div>
        <Link to="/focus-one/enroll">
          <Button 
            variant="default" 
            size="lg" 
            className="shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Enroll Student
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <Card className="border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
            <Input
              placeholder="Search students by name, email, or phone..."
              value={searchTerm}
              onChange={handleSearch}
              className="pl-12 h-12 text-base border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white"
            />
          </div>
        </CardContent>
      </Card>

      {enrollments.length === 0 ? (
        <Card className="border border-gray-200/60 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-20 px-6">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-xl"></div>
              <div className="relative p-5 bg-gradient-to-br from-primary/10 to-primary/5 rounded-full">
                <GraduationCap className="h-14 w-14 text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              No students enrolled
            </h3>
            <p className="text-gray-600 text-center max-w-md mb-8 leading-relaxed">
              No students are currently enrolled in Focus One programs. Enroll your first student to get started.
            </p>
            <Link to="/focus-one/enroll">
              <Button 
                size="lg" 
                className="shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary px-8"
              >
                <Plus className="h-4 w-4 mr-2" />
                Enroll Student
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-gray-200/60 shadow-lg overflow-hidden bg-white">
          <CardContent className="p-0">
            <DataTable 
              columns={columns} 
              data={enrollments}
              pageSize={pagination.itemsPerPage}
              manualPagination={true}
              pageCount={pagination.totalPages}
              totalItems={pagination.totalItems}
              currentPage={pagination.currentPage}
              onPageChange={handlePageChange}
              className="px-6 pt-6 pb-6"
            />
          </CardContent>
        </Card>
      )}


      {/* Pause Dialog */}
      <Dialog open={isPauseDialogOpen} onOpenChange={setIsPauseDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-xl font-bold">Pause Focus One Program</DialogTitle>
            <DialogDescription className="text-sm text-gray-600">
              Provide a reason and optional notes for pausing this Focus One program.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="space-y-2">
              <Label htmlFor="pauseReason" className="text-sm font-semibold text-gray-700">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pauseReason"
                value={pauseReason}
                onChange={(e) => setPauseReason(e.target.value)}
                className="h-11 border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                placeholder="Enter reason for pausing..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pauseNotes" className="text-sm font-semibold text-gray-700">
                Notes <span className="text-gray-400 font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="pauseNotes"
                value={pauseNotes}
                onChange={(e) => setPauseNotes(e.target.value)}
                className="min-h-[100px] border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                placeholder="Add any additional notes..."
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsPauseDialogOpen(false)
                setPauseReason('')
                setPauseNotes('')
                setPausingUserId(null)
              }}
              className="border-gray-200 hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={() => pausingUserId && handlePause(pausingUserId.userId, pausingUserId.focusOneId)} 
              disabled={!pauseReason.trim()}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
            >
              Pause Program
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default FocusOne
