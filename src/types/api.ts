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
}

export interface CalendarSlot {
  date: string
  times: string[]
}

export interface CalendarSearchParams {
  timeMin: string
  timeMax: string
  emails: string[]
}

export interface ScheduleSearchResult {
  freeSlots: CalendarSlot[]
}

export interface MembersResult {
  members: Member[]
}