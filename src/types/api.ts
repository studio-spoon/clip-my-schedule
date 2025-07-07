// Shared API types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface Member {
  email: string
  name: string
  displayName: string
  calendarId: string
  accessRole: string
  source: 'self' | 'shared' | 'organization'
  photo?: string
}

export interface CalendarSlot {
  date: string
  times: string[]
  debug?: {
    slotDetails?: Array<{
      time: string
      duration: number
      bufferBefore: number
      bufferAfter: number
      slotStart: string
      slotEnd: string
      totalDuration: number
    }>
  }
}

export interface CalendarSearchParams {
  timeMin: string
  timeMax: string
  emails: string[]
}

export interface BusyTime {
  email: string
  busy: Array<{
    start: string
    end: string
    summary?: string
    responseStatus?: string
  }>
  error?: string
  source?: string
  cachedAt?: string
}

export interface ScheduleSearchResult {
  freeSlots: CalendarSlot[]
  availableTimes?: CalendarSlot[]
  busyTimes?: BusyTime[]
  timeRange?: {
    timeMin: string
    timeMax: string
  }
  participants?: string[]
  filters?: {
    timeSlot: string
    meetingDuration: string | number
    bufferBefore: string | number
    bufferAfter: string | number
  }
}

export interface MembersResult {
  members: Member[]
}