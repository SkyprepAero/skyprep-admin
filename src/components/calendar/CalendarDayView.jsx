import { format, startOfDay, setHours, setMinutes, addHours, isToday } from 'date-fns'
import { Plus } from 'lucide-react'
import CalendarEvent from './CalendarEvent'
import { cn } from '@/lib/utils'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function CalendarDayView({ currentDate, sessions, publicHolidays, onDateClick }) {
  const dayStart = startOfDay(currentDate)
  const isTodayDate = isToday(currentDate)

  // Filter sessions for the current day
  const daySessions = sessions.filter((session) => {
    const sessionDate = new Date(session.startTime)
    return format(sessionDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
  })

  // Sort sessions by start time
  const sortedSessions = [...daySessions].sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  )

  // Check if there's a holiday for this date
  const holiday = publicHolidays.find(h => {
    const holidayDate = new Date(h.date)
    return format(holidayDate, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd')
  })

  const getSessionsForHour = (hour) => {
    return sortedSessions.filter((session) => {
      const sessionStart = new Date(session.startTime)
      const sessionEnd = new Date(session.endTime)
      const hourStart = setMinutes(setHours(dayStart, hour), 0)
      const hourEnd = addHours(hourStart, 1)

      return (
        (sessionStart >= hourStart && sessionStart < hourEnd) ||
        (sessionEnd > hourStart && sessionEnd <= hourEnd) ||
        (sessionStart <= hourStart && sessionEnd >= hourEnd)
      )
    })
  }

  return (
    <div className="flex flex-col border-t border-l border-r border-border">
      {/* Day header */}
      <div
        className={cn(
          'p-5 text-center border-b border-border bg-gray-50 relative group hover:bg-gray-100 transition-colors',
          isTodayDate && 'bg-blue-50',
          holiday && 'bg-red-50'
        )}
      >
        <div className="text-sm font-medium text-gray-600">
          {format(currentDate, 'EEEE')}
        </div>
        <div
          className={cn(
            'text-2xl font-semibold mt-1',
            isTodayDate && 'text-blue-600',
            holiday && 'text-red-600'
          )}
        >
          {format(currentDate, 'MMMM d, yyyy')}
        </div>
        {holiday && (
          <div className="mt-2 inline-block bg-red-500 text-white px-3 py-1 rounded text-sm font-medium">
            {holiday.name}
          </div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDateClick(currentDate)
          }}
          className={cn(
            'absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-blue-600 text-white px-3 py-1.5 rounded flex items-center gap-1.5 hover:bg-blue-700 shadow-sm',
            holiday && 'opacity-100'
          )}
          title={holiday ? 'Edit public holiday' : 'Add public holiday'}
        >
          <Plus className="h-3.5 w-3.5" />
          {holiday ? 'Edit Holiday' : 'Add Holiday'}
        </button>
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: '600px' }}>
        {HOURS.map((hour) => {
          const hourSessions = getSessionsForHour(hour)

          return (
            <div key={hour} className="grid grid-cols-12 border-b border-border">
              <div className="p-4 border-r border-border text-sm text-gray-600 text-right pr-5 bg-gray-50 col-span-2">
                {format(setHours(new Date(), hour), 'h a')}
              </div>
              <div
                className={cn(
                  'p-4 col-span-10 min-h-[80px]',
                  isTodayDate && 'bg-blue-50/30',
                  holiday && 'bg-red-50/30'
                )}
                onClick={(e) => e.stopPropagation()}
              >
                {hourSessions
                  .filter((session) => {
                    const sessionStart = new Date(session.startTime)
                    return sessionStart.getHours() === hour
                  })
                  .map((session) => (
                    <CalendarEvent
                      key={session._id}
                      session={session}
                      className="mb-2 max-w-md"
                    />
                  ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

