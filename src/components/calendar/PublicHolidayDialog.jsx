import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { publicHolidayAPI } from '@/lib/api'
import toast from 'react-hot-toast'

export default function PublicHolidayDialog({ open, onClose, holiday, date }) {
  const [name, setName] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [description, setDescription] = useState('')
  const [isActive, setIsActive] = useState(true)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (holiday) {
      setName(holiday.name || '')
      setSelectedDate(format(new Date(holiday.date), 'yyyy-MM-dd'))
      setDescription(holiday.description || '')
      setIsActive(holiday.isActive !== undefined ? holiday.isActive : true)
    } else if (date) {
      setName('')
      setSelectedDate(format(date, 'yyyy-MM-dd'))
      setDescription('')
      setIsActive(true)
    }
  }, [holiday, date, open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!name.trim()) {
      toast.error('Holiday name is required')
      return
    }

    if (!selectedDate) {
      toast.error('Date is required')
      return
    }

    try {
      setLoading(true)
      
      if (holiday) {
        // Update existing holiday
        await publicHolidayAPI.update(holiday._id, {
          name: name.trim(),
          date: selectedDate,
          description: description.trim() || null,
          isActive
        })
        toast.success('Public holiday updated successfully')
      } else {
        // Create new holiday
        await publicHolidayAPI.create({
          name: name.trim(),
          date: selectedDate,
          description: description.trim() || null,
          isActive
        })
        toast.success('Public holiday created successfully')
      }
      
      onClose()
    } catch (error) {
      console.error('Error saving public holiday:', error)
      const errorMessage = error.response?.data?.error?.message || error.response?.data?.message || 'Failed to save public holiday'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!holiday) return
    
    if (!window.confirm(`Are you sure you want to delete the holiday "${holiday.name}"?`)) {
      return
    }

    try {
      setLoading(true)
      await publicHolidayAPI.delete(holiday._id)
      toast.success('Public holiday deleted successfully')
      onClose()
    } catch (error) {
      console.error('Error deleting public holiday:', error)
      toast.error('Failed to delete public holiday')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {holiday ? 'Edit Public Holiday' : 'Add Public Holiday'}
          </DialogTitle>
          <DialogDescription>
            {holiday 
              ? 'Update the public holiday details. Sessions cannot be booked on this date.'
              : 'Create a new public holiday. Sessions cannot be booked on this date.'
            }
          </DialogDescription>
        </DialogHeader>
        
        {!holiday && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Important Notice
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    After setting this date as a public holiday, <strong>no sessions will be allowed to be booked on this date</strong> throughout the platform. This will prevent all students and teachers from scheduling sessions on this day.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Holiday Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Independence Day"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">
              Date <span className="text-red-500">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              required
              disabled={loading || !!holiday}
            />
            {holiday && (
              <p className="text-xs text-gray-500">
                Date cannot be changed. Delete and create a new holiday to change the date.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description for this holiday"
              rows={3}
              disabled={loading}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              disabled={loading}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isActive" className="font-normal cursor-pointer">
              Active (Holiday will block session bookings)
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {holiday && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : holiday ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

