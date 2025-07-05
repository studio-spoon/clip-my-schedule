// API Service Layer - Centralized API calls
import type { 
  ApiResponse, 
  Member, 
  CalendarSlot, 
  CalendarSearchParams,
  ScheduleSearchResult,
  MembersResult
} from '@/types/api'

class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message)
    this.name = 'ApiError'
  }
}

async function apiRequest<T>(url: string, options?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new ApiError(`HTTP error! status: ${response.status}`, response.status)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error('API request failed:', error)
    
    if (error instanceof ApiError) {
      return {
        success: false,
        error: error.message
      }
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export const membersApi = {
  async getMembers(): Promise<ApiResponse<MembersResult>> {
    return apiRequest<MembersResult>('/api/members')
  }
}

export const calendarApi = {
  async searchAvailableSlots(params: CalendarSearchParams): Promise<ApiResponse<ScheduleSearchResult>> {
    const searchParams = new URLSearchParams({
      timeMin: params.timeMin,
      timeMax: params.timeMax,
      emails: params.emails.join(',')
    })
    
    return apiRequest<ScheduleSearchResult>(`/api/calendar?${searchParams}`)
  }
}

// Unified API client
export const api = {
  members: membersApi,
  calendar: calendarApi,
}