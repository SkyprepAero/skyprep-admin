import { useState, useMemo, useCallback, useEffect } from 'react'
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, startOfDay, endOfDay, format } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { sessionAPI, publicHolidayAPI } from '@/lib/api'
import toast from 'react-hot-toast'
import CalendarMonthView from '@/components/calendar/CalendarMonthView'
import CalendarWeekView from '@/components/calendar/CalendarWeekView'
import CalendarDayView from '@/components/calendar/CalendarDayView'
import PublicHolidayDialog from '@/components/calendar/PublicHolidayDialog'
import DaySessionsDialog from '@/components/calendar/DaySessionsDialog'

const CalendarViewTypes = {
  MONTH: 'month',
  WEEK: 'week',
  DAY: 'day'
}

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState(CalendarViewTypes.MONTH)
  const [sessions, setSessions] = useState([])
  const [publicHolidays, setPublicHolidays] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedHoliday, setSelectedHoliday] = useState(null)
  const [isHolidayDialogOpen, setIsHolidayDialogOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [isSessionsDialogOpen, setIsSessionsDialogOpen] = useState(false)
  const [selectedSessionsDate, setSelectedSessionsDate] = useState(null)
  const [selectedSessions, setSelectedSessions] = useState([])

  // Calculate date range based on view
  const dateRange = useMemo(() => {
    switch (view) {
      case CalendarViewTypes.MONTH:
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate),
        }
      case CalendarViewTypes.WEEK:
        return {
          start: startOfWeek(currentDate, { weekStartsOn: 0 }),
          end: endOfWeek(currentDate, { weekStartsOn: 0 }),
        }
      case CalendarViewTypes.DAY:
        return {
          start: startOfDay(currentDate),
          end: endOfDay(currentDate),
        }
      default:
        return {
          start: startOfMonth(currentDate),
          end: endOfMonth(currentDate),
        }
    }
  }, [view, currentDate])

  // Fetch sessions and public holidays for the date range
  const fetchCalendarData = useCallback(async () => {
    try {
      setLoading(true)

      const [sessionsResponse, holidaysResponse] = await Promise.all([
        sessionAPI.getAll({
          page: 1,
          limit: 1000,
        }).catch(() => ({ data: { data: { sessions: [] } } })),
        publicHolidayAPI.getAll({
          startDate: dateRange.start.toISOString().split('T')[0],
          endDate: dateRange.end.toISOString().split('T')[0],
        }).catch(() => ({ data: { data: { holidays: [] } } }))
      ])

      // Filter sessions that fall within the visible date range
      const allSessions = sessionsResponse.data.data.sessions || []
      const filteredSessions = allSessions.filter((session) => {
        const sessionStart = new Date(session.startTime)
        const sessionEnd = new Date(session.endTime)
        return (
          (sessionStart >= dateRange.start && sessionStart <= dateRange.end) ||
          (sessionEnd >= dateRange.start && sessionEnd <= dateRange.end) ||
          (sessionStart <= dateRange.start && sessionEnd >= dateRange.end)
        )
      })

      setSessions(filteredSessions)
      setPublicHolidays(holidaysResponse.data.data.holidays || [])
    } catch (error) {
      console.error('Error fetching calendar data:', error)
      toast.error('Failed to load calendar data')
    } finally {
      setLoading(false)
    }
  }, [dateRange.start, dateRange.end])

  useEffect(() => {
    fetchCalendarData()
  }, [fetchCalendarData])

  const handlePrevious = () => {
    switch (view) {
      case CalendarViewTypes.MONTH:
        setCurrentDate(subMonths(currentDate, 1))
        break
      case CalendarViewTypes.WEEK:
        setCurrentDate(subWeeks(currentDate, 1))
        break
      case CalendarViewTypes.DAY:
        setCurrentDate(subDays(currentDate, 1))
        break
    }
  }

  const handleNext = () => {
    switch (view) {
      case CalendarViewTypes.MONTH:
        setCurrentDate(addMonths(currentDate, 1))
        break
      case CalendarViewTypes.WEEK:
        setCurrentDate(addWeeks(currentDate, 1))
        break
      case CalendarViewTypes.DAY:
        setCurrentDate(addDays(currentDate, 1))
        break
    }
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleDateClick = (date) => {
    setSelectedDate(date)
    // Check if there's already a holiday on this date
    const existingHoliday = publicHolidays.find(h => {
      const holidayDate = new Date(h.date)
      return format(holidayDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    })
    if (existingHoliday) {
      setSelectedHoliday(existingHoliday)
    } else {
      setSelectedHoliday(null)
    }
    setIsHolidayDialogOpen(true)
  }

  const handleHolidayDialogClose = () => {
    setIsHolidayDialogOpen(false)
    setSelectedHoliday(null)
    setSelectedDate(null)
    fetchCalendarData() // Refresh calendar data
  }

  const handleViewMoreSessions = (date, sessions) => {
    setSelectedSessionsDate(date)
    setSelectedSessions(sessions)
    setIsSessionsDialogOpen(true)
  }

  const handleSessionsDialogClose = () => {
    setIsSessionsDialogOpen(false)
    setSelectedSessionsDate(null)
    setSelectedSessions([])
  }

  const getViewTitle = () => {
    switch (view) {
      case CalendarViewTypes.MONTH:
        return format(currentDate, 'MMMM yyyy')
      case CalendarViewTypes.WEEK:
        return `Week of ${format(dateRange.start, 'MMM d')} - ${format(dateRange.end, 'MMM d, yyyy')}`
      case CalendarViewTypes.DAY:
        return format(currentDate, 'EEEE, MMMM d, yyyy')
      default:
        return format(currentDate, 'MMMM yyyy')
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
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="mt-2 text-gray-600">
            View all sessions and manage public holidays
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold">{getViewTitle()}</h2>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 border rounded-md">
                <Button
                  variant={view === CalendarViewTypes.MONTH ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView(CalendarViewTypes.MONTH)}
                >
                  Month
                </Button>
                <Button
                  variant={view === CalendarViewTypes.WEEK ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView(CalendarViewTypes.WEEK)}
                >
                  Week
                </Button>
                <Button
                  variant={view === CalendarViewTypes.DAY ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView(CalendarViewTypes.DAY)}
                >
                  Day
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="min-h-[600px]">
            {view === CalendarViewTypes.MONTH && (
              <CalendarMonthView
                currentDate={currentDate}
                sessions={sessions}
                publicHolidays={publicHolidays}
                onDateClick={handleDateClick}
                onViewMoreSessions={handleViewMoreSessions}
              />
            )}
            {view === CalendarViewTypes.WEEK && (
              <CalendarWeekView
                currentDate={currentDate}
                sessions={sessions}
                publicHolidays={publicHolidays}
                onDateClick={handleDateClick}
              />
            )}
            {view === CalendarViewTypes.DAY && (
              <CalendarDayView
                currentDate={currentDate}
                sessions={sessions}
                publicHolidays={publicHolidays}
                onDateClick={handleDateClick}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {isHolidayDialogOpen && (
        <PublicHolidayDialog
          open={isHolidayDialogOpen}
          onClose={handleHolidayDialogClose}
          holiday={selectedHoliday}
          date={selectedDate}
        />
      )}

      {isSessionsDialogOpen && (
        <DaySessionsDialog
          open={isSessionsDialogOpen}
          onClose={handleSessionsDialogClose}
          date={selectedSessionsDate}
          sessions={selectedSessions}
        />
      )}
    </div>
  )
}

export default Calendar

