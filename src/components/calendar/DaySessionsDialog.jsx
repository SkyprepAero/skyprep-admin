import { format } from 'date-fns'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

const getStatusBadgeColor = (status) => {
  switch (status) {
    case 'requested':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'accepted':
    case 'scheduled':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'ongoing':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'completed':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'rejected':
    case 'cancelled':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

export default function DaySessionsDialog({ open, onClose, date, sessions }) {
  // Sort sessions by start time
  const sortedSessions = [...(sessions || [])].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Sessions for {date ? format(date, 'EEEE, MMMM d, yyyy') : ''}
          </DialogTitle>
          <DialogDescription>
            {sortedSessions.length === 0 
              ? 'No sessions scheduled for this day'
              : `${sortedSessions.length} session${sortedSessions.length === 1 ? '' : 's'} scheduled`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          {sortedSessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No sessions scheduled for this day
            </div>
          ) : (
            sortedSessions.map((session) => {
              const startTime = new Date(session.startTime)
              const endTime = new Date(session.endTime)
              
              return (
                <div 
                  key={session._id} 
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors bg-white"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-semibold text-base mb-1">{session.title || 'Session'}</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Time:</span>
                          <span>{format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}</span>
                        </div>
                        {session.subject && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Subject:</span>
                            <span>{session.subject.name || session.subject}</span>
                          </div>
                        )}
                        {session.teacher && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Teacher:</span>
                            <span>{session.teacher.name || session.teacher}</span>
                          </div>
                        )}
                        {session.student && (
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Student:</span>
                            <span>{session.student.name || session.student}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <span className={cn(
                      'px-2 py-1 rounded text-xs font-medium border',
                      getStatusBadgeColor(session.status)
                    )}>
                      {session.status}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

