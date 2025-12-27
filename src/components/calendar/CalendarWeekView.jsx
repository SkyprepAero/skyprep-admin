import { format, startOfWeek, endOfWeek, eachDayOfInterval, setHours, setMinutes, addHours, isToday } from 'date-fns'
import { Plus } from 'lucide-react'
import CalendarEvent from './CalendarEvent'
import { cn } from '@/lib/utils'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function CalendarWeekView({ currentDate, sessions, publicHolidays, onDateClick }) {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 })
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 })
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

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

  const getSessionsForHour = (date, hour, sessions) => {
    return sessions.filter((session) => {
      const sessionStart = new Date(session.startTime)
      const sessionEnd = new Date(session.endTime)
      const hourStart = setMinutes(setHours(date, hour), 0)
      const hourEnd = addHours(hourStart, 1)
      
      return (
        (sessionStart >= hourStart && sessionStart < hourEnd) ||
        (sessionEnd > hourStart && sessionEnd <= hourEnd) ||
        (sessionStart <= hourStart && sessionEnd >= hourEnd)
      )
    })
  }

  return (
    <div className="flex flex-col border-t border-l border-border">
      {/* Week header */}
      <div className="grid grid-cols-8 border-b border-border">
        <div className="p-3 bg-gray-50"></div>
        {weekDays.map((day) => {
          const holiday = getHolidayForDate(day)
          const isTodayDate = isToday(day)
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'p-3 text-center border-l border-border bg-gray-50 relative group cursor-pointer hover:bg-gray-100 transition-colors',
                isTodayDate && 'bg-blue-50',
                holiday && 'bg-red-50'
              )}
            >
              <div className="text-xs text-gray-600 font-medium">
                {format(day, 'EEE')}
              </div>
              <div
                className={cn(
                  'text-lg font-semibold mt-1',
                  isTodayDate && 'text-blue-600',
                  holiday && 'text-red-600'
                )}
              >
                {format(day, 'd')}
              </div>
              {holiday && (
                <div className="text-[10px] bg-red-500 text-white px-1 py-0.5 rounded mt-1 inline-block">
                  {holiday.name}
                </div>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDateClick(day)
                }}
                className={cn(
                  'absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-blue-600 text-white px-2 py-1 rounded flex items-center gap-1 hover:bg-blue-700 shadow-sm',
                  holiday && 'opacity-100'
                )}
                title={holiday ? 'Edit public holiday' : 'Add public holiday'}
              >
                <Plus className="h-3 w-3" />
                {holiday ? 'Edit' : 'Add Holiday'}
              </button>
            </div>
          )
        })}
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: '600px' }}>
        {HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b border-border">
            <div className="p-4 border-r border-border text-sm text-gray-600 text-right pr-5 bg-gray-50 col-span-1">
              {format(setHours(new Date(), hour), 'h a')}
            </div>
            {weekDays.map((day) => {
              const daySessions = getSessionsForDate(day)
              const hourSessions = getSessionsForHour(day, hour, daySessions)
              const holiday = getHolidayForDate(day)
              const isTodayDate = isToday(day)

              return (
              <div
                key={day.toISOString()}
                className={cn(
                  'p-2 border-l border-border min-h-[80px]',
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
                        className="mb-1"
                      />
                    ))}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

