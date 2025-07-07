// API Service Layer - Centralized API calls
import type { 
  ApiResponse, 
  Member, 
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

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data.error || `HTTP error! status: ${response.status}`
      throw new ApiError(errorMessage, response.status)
    }

    return data
  } catch (error) {
    
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
  },

  async addMember(email: string): Promise<ApiResponse<{ member: Member }>> {
    return apiRequest<{ member: Member }>('/api/members/add', {
      method: 'POST',
      body: JSON.stringify({ email })
    })
  }
}

export const calendarApi = {
  async searchAvailableSlots(
    params: CalendarSearchParams, 
    scheduleParams?: {
      selectedPeriod?: string
      selectedTimeSlot?: string
      customTimeStart?: string
      customTimeEnd?: string
      meetingDuration?: string
      bufferTimeBefore?: string
      bufferTimeAfter?: string
      customDuration?: string
      customPeriodStart?: string
      customPeriodEnd?: string
    }
  ): Promise<ApiResponse<ScheduleSearchResult>> {
    const searchParams = new URLSearchParams({
      timeMin: params.timeMin,
      timeMax: params.timeMax,
      emails: params.emails.join(',')
    })
    
    // スケジュールパラメータを追加
    if (scheduleParams) {
      Object.entries(scheduleParams).forEach(([key, value]) => {
        if (value) {
          searchParams.append(key, value)
        }
      })
    }
    
    const finalUrl = `/api/calendar?${searchParams}`
    
    return apiRequest<ScheduleSearchResult>(finalUrl)
  }
}

// Unified API client
export const api = {
  members: membersApi,
  calendar: calendarApi,
}