import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  // Simulate a frontend call with all the expected parameters
  const mockScheduleParams = {
    selectedMembers: ['Test User'],
    selectedPeriod: '直近2週間',
    selectedTimeSlot: '時間指定',
    customTimeStart: '09:00',
    customTimeEnd: '18:00',
    meetingDuration: '30分',
    bufferTime: '15分',
    customDuration: '',
    teamMembers: [
      {
        email: 'test@example.com',
        name: 'Test User',
        displayName: 'Test User',
        calendarId: 'test@example.com',
        accessRole: 'self',
        source: 'self'
      }
    ]
  }

  // Test URL construction like the frontend should do
  const testSearchParams = new URLSearchParams({
    timeMin: new Date().toISOString(),
    timeMax: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    emails: 'test@example.com'
  })

  // Add schedule parameters
  const scheduleParams = {
    selectedPeriod: mockScheduleParams.selectedPeriod,
    selectedTimeSlot: mockScheduleParams.selectedTimeSlot,
    customTimeStart: mockScheduleParams.customTimeStart,
    customTimeEnd: mockScheduleParams.customTimeEnd,
    meetingDuration: mockScheduleParams.meetingDuration,
    bufferTime: mockScheduleParams.bufferTime,
    customDuration: mockScheduleParams.customDuration
  }

  Object.entries(scheduleParams).forEach(([key, value]) => {
    if (value) {
      testSearchParams.append(key, value)
    }
  })

  const testUrl = `/api/calendar?${testSearchParams.toString()}`
  const debugUrl = `/api/debug/schedule-settings-test?${testSearchParams.toString()}`

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    simulation: {
      mockFrontendCall: mockScheduleParams,
      generatedUrl: testUrl,
      debugUrl: debugUrl,
      urlParameters: Object.fromEntries(testSearchParams.entries()),
      parameterCount: testSearchParams.toString().split('&').length
    },
    instructions: {
      message: 'This simulates what the frontend should be sending to the API',
      testSteps: [
        'Copy the debugUrl below and test it',
        'Check if all schedule parameters are received correctly',
        'Compare with what the frontend is actually sending',
        'If parameters are missing from frontend, check useScheduleSearch implementation'
      ]
    },
    analysis: {
      expectedParameters: Object.keys(scheduleParams),
      currentIssue: 'Frontend is not sending schedule parameters to API',
      possibleCauses: [
        'useScheduleSearch is not receiving the schedule state values',
        'Schedule state is not being passed from Scheduler component',
        'API service is not appending schedule parameters correctly',
        'URL encoding issues with Japanese characters'
      ]
    }
  })
}

export async function POST(request: Request) {
  // This endpoint can be used to test parameter sending from frontend
  const body = await request.json()
  
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    receivedBody: body,
    analysis: {
      hasScheduleParams: Object.keys(body).some(key => 
        ['selectedPeriod', 'selectedTimeSlot', 'meetingDuration', 'bufferTime'].includes(key)
      ),
      parameterCount: Object.keys(body).length,
      message: 'This shows what parameters the frontend is actually sending'
    }
  })
}
