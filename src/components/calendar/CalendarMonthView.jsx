import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, startOfMonth, endOfMonth } from 'date-fns'
import { Plus } from 'lucide-react'
import CalendarEvent from './CalendarEvent'
import { cn } from '@/lib/utils'

export default function CalendarMonthView({ currentDate, sessions, publicHolidays, onDateClick, onViewMoreSessions }) {
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  // Group sessions by date
  const sessionsByDate = new Map()
  sessions.forEach((session) => {
    const dateKey = format(new Date(session.startTime), 'yyyy-MM-dd')
    if (!sessionsByDate.has(dateKey)) {
      sessionsByDate.set(dateKey, [])
    }
    sessionsByDate.get(dateKey).push(session)
  })

  // Group public holidays by date
  const holidaysByDate = new Map()
  publicHolidays.forEach((holiday) => {
    const dateKey = format(new Date(holiday.date), 'yyyy-MM-dd')
    holidaysByDate.set(dateKey, holiday)
  })

  const getSessionsForDate = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return sessionsByDate.get(dateKey) || []
  }

  const getHolidayForDate = (date) => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return holidaysByDate.get(dateKey) || null
  }

  return (
    <div className="grid grid-cols-7 divide-x divide-y divide-border border-t border-l border-border">
      {/* Weekday headers */}
      {weekDays.map((day) => (
        <div
          key={day}
          className="p-3 text-sm font-medium text-gray-600 bg-gray-50 text-center"
        >
          {day}
        </div>
      ))}

      {/* Calendar days */}
      {days.map((day) => {
        const daySessions = getSessionsForDate(day)
        const holiday = getHolidayForDate(day)
        const isCurrentMonth = isSameMonth(day, currentDate)
        const isTodayDate = isToday(day)

        return (
          <div
            key={day.toISOString()}
            className={cn(
              'min-h-[100px] p-3 bg-white cursor-pointer hover:bg-gray-50 transition-colors relative group',
              !isCurrentMonth && 'bg-gray-50 opacity-50',
              isTodayDate && 'bg-blue-50 border-2 border-blue-500',
              holiday && 'bg-red-50'
            )}
          >
            <div
              className={cn(
                'text-sm font-medium mb-2 flex items-center justify-between',
                isTodayDate && 'text-blue-600 font-semibold',
                !isCurrentMonth && 'text-gray-400',
                holiday && 'text-red-600'
              )}
            >
              <span>{format(day, 'd')}</span>
              <div className="flex items-center gap-1">
                {holiday && (
                  <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded">
                    {holiday.name}
                  </span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onDateClick(day)
                  }}
                  className={cn(
                    'opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-blue-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-700 shadow-sm',
                    holiday && 'opacity-100'
                  )}
                  title={holiday ? 'Edit public holiday' : 'Add public holiday'}
                >
                  <Plus className="h-3 w-3" />
                  {holiday ? 'Edit' : 'Add Holiday'}
                </button>
              </div>
            </div>
            <div className="space-y-0.5 overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {daySessions.slice(0, 3).map((session) => (
                <CalendarEvent
                  key={session._id}
                  session={session}
                />
              ))}
              {daySessions.length > 3 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onViewMoreSessions?.(day, daySessions)
                  }}
                  className="text-[10px] text-blue-600 font-medium px-1.5 py-0.5 hover:text-blue-800 hover:underline cursor-pointer"
                >
                  +{daySessions.length - 3} more
                </button>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

