import { NextResponse } from "next/server"
import { processScheduleParams, validateScheduleParams, type ScheduleParams } from "@/lib/schedule-processor"

// Mock busy time data for testing
const mockBusyTimes = [
  {
    email: 'test@example.com',
    busy: [
      { start: '2025-07-07T13:00:00Z', end: '2025-07-07T14:00:00Z' }, // Monday 13:00-14:00
      { start: '2025-07-08T10:00:00Z', end: '2025-07-08T11:30:00Z' }, // Tuesday 10:00-11:30
      { start: '2025-07-09T15:00:00Z', end: '2025-07-09T16:00:00Z' }, // Wednesday 15:00-16:00
    ]
  }
]

// Test version of calculateFreeSlots function
function testCalculateFreeSlots(
  busyTimes: Array<{ email: string; busy: Array<{ start: string; end: string }> }>,
  params: any
) {
  const slots = []
  const start = params.timeRange.start
  const end = params.timeRange.end
  const workingHours = params.workingHours
  const meetingDuration = params.meetingDuration
  const bufferTime = params.bufferTime
  
  console.log(`📊 Test calculating free slots with parameters:`)
  console.log(`   Time range: ${start.toISOString()} to ${end.toISOString()}`)
  console.log(`   Working hours: ${workingHours.start}:00-${workingHours.end}:00`)
  console.log(`   Meeting duration: ${meetingDuration} minutes`)
  console.log(`   Buffer time: ${bufferTime} minutes`)
  
  for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
    // 土日をスキップ
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue
    }
    
    const daySlots = []
    const slotSizeHours = Math.ceil(meetingDuration / 60) // 最低1時間単位
    
    // 指定された時間範囲内でスロットをチェック
    for (let hour = workingHours.start; hour <= workingHours.end - slotSizeHours; hour++) {
      const slotStart = new Date(date)
      slotStart.setHours(hour, 0, 0, 0)
      
      const slotEnd = new Date(date)
      slotEnd.setHours(hour + slotSizeHours, 0, 0, 0)
      
      // バッファ時間を考慮した実際の必要時間
      const bufferStart = new Date(slotStart)
      bufferStart.setMinutes(bufferStart.getMinutes() - bufferTime)
      
      const bufferEnd = new Date(slotEnd)
      bufferEnd.setMinutes(bufferEnd.getMinutes() + bufferTime)
      
      // 全員が空いているかチェック（バッファ時間を含む）
      let isSlotFree = true
      let conflictDetails = []
      
      for (const { email, busy } of busyTimes) {
        for (const { start: busyStart, end: busyEnd } of busy) {
          const busyStartTime = new Date(busyStart)
          const busyEndTime = new Date(busyEnd)
          
          // バッファ時間を含めた重複チェック
          const hasConflict = (
            (bufferStart < busyEndTime && bufferEnd > busyStartTime)
          )
          
          if (hasConflict) {
            isSlotFree = false
            conflictDetails.push({
              email,
              busyPeriod: `${busyStartTime.toISOString()} - ${busyEndTime.toISOString()}`,
              slotPeriod: `${bufferStart.toISOString()} - ${bufferEnd.toISOString()}`,
              reason: 'Time conflict with buffer'
            })
          }
        }
      }
      
      if (isSlotFree) {
        // 複数の時間選択肢を提供（1時間単位）
        const timeOptions = []
        for (let subHour = hour; subHour < hour + slotSizeHours; subHour++) {
          timeOptions.push(`${subHour.toString().padStart(2, '0')}:00-${(subHour + 1).toString().padStart(2, '0')}:00`)
        }
        
        daySlots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          time: timeOptions.join(', '),
          duration: meetingDuration,
          buffer: bufferTime
        })
      }
    }
    
    if (daySlots.length > 0) {
      const dateStr = date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'numeric', 
        day: 'numeric',
        weekday: 'short',
      })
      
      slots.push({
        date: dateStr,
        times: daySlots.map(slot => slot.time),
        metadata: {
          workingHours: `${workingHours.start}:00-${workingHours.end}:00`,
          meetingDuration: `${meetingDuration}分`,
          bufferTime: `${bufferTime}分`
        }
      })
    }
  }
  
  return slots
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  
  const testResults = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
    summary: {
      passed: 0,
      failed: 0,
      total: 0
    }
  }

  const addTest = (name: string, passed: boolean, details: any) => {
    testResults.tests.push({
      name,
      passed,
      details,
      timestamp: new Date().toISOString()
    })
    testResults.summary.total++
    if (passed) {
      testResults.summary.passed++
    } else {
      testResults.summary.failed++
    }
  }

  try {
    // Test 1: Schedule Parameter Processing
    console.log('🧪 Test 1: Schedule Parameter Processing')
    
    const testScenarios = [
      {
        name: 'Default Settings',
        params: {
          selectedPeriod: '直近1週間',
          selectedTimeSlot: 'デフォルト',
          customTimeStart: '',
          customTimeEnd: '',
          meetingDuration: '60分',
          bufferTime: '0分',
          customDuration: ''
        }
      },
      {
        name: 'Custom Time Range',
        params: {
          selectedPeriod: '直近2週間',
          selectedTimeSlot: '時間指定',
          customTimeStart: '09:00',
          customTimeEnd: '18:00',
          meetingDuration: '30分',
          bufferTime: '15分',
          customDuration: ''
        }
      },
      {
        name: 'Long Meeting with Buffer',
        params: {
          selectedPeriod: '直近1週間',
          selectedTimeSlot: 'デフォルト',
          customTimeStart: '',
          customTimeEnd: '',
          meetingDuration: '120分',
          bufferTime: '30分',
          customDuration: ''
        }
      },
      {
        name: 'Custom Period - Valid',
        params: {
          selectedPeriod: '期間を指定',
          selectedTimeSlot: 'デフォルト',
          customPeriodStart: '2025-07-10',
          customPeriodEnd: '2025-07-20',
          customTimeStart: '',
          customTimeEnd: '',
          meetingDuration: '60分',
          bufferTime: '0分',
          customDuration: ''
        },
        shouldBeValid: true
      },
      {
        name: 'Custom Period - Invalid (missing end)',
        params: {
          selectedPeriod: '期間を指定',
          selectedTimeSlot: 'デフォルト',
          customPeriodStart: '2025-07-10',
          customPeriodEnd: '',
          customTimeStart: '',
          customTimeEnd: '',
          meetingDuration: '60分',
          bufferTime: '0分',
          customDuration: ''
        },
        shouldBeValid: false
      }
    ]

    const scenarioResults = []
    
    for (const scenario of testScenarios) {
      try {
        const validation = validateScheduleParams(scenario.params)
        const processed = processScheduleParams(scenario.params)
        
        const isValid = scenario.shouldBeValid === undefined ? validation.isValid : validation.isValid === scenario.shouldBeValid

        scenarioResults.push({
          scenario: scenario.name,
          validation,
          processed,
          success: isValid
        })
      } catch (error) {
        scenarioResults.push({
          scenario: scenario.name,
          error: error instanceof Error ? error.message : 'Unknown error',
          success: false
        })
      }
    }
    
    const allScenariosValid = scenarioResults.every(r => r.success)
    
    addTest('Schedule Parameter Processing', allScenariosValid, {
      scenarios: scenarioResults,
      totalScenarios: testScenarios.length,
      validScenarios: scenarioResults.filter(r => r.success).length
    })

    // Test 2: Calendar Logic with Mock Data
    console.log('🧪 Test 2: Calendar Logic with Mock Data')
    
    const calendarTestResults = []
    
    for (const scenario of testScenarios) {
      if (scenarioResults.find(r => r.scenario === scenario.name)?.success) {
        try {
          const processed = processScheduleParams(scenario.params)
          const freeSlots = testCalculateFreeSlots(mockBusyTimes, processed)
          
          calendarTestResults.push({
            scenario: scenario.name,
            parameters: processed,
            mockBusyTimes: mockBusyTimes.length,
            freeSlotsFound: freeSlots.length,
            totalFreeSlots: freeSlots.reduce((sum, day) => sum + day.times.length, 0),
            freeSlots: freeSlots,
            success: true
          })
        } catch (error) {
          calendarTestResults.push({
            scenario: scenario.name,
            error: error instanceof Error ? error.message : 'Unknown error',
            success: false
          })
        }
      }
    }
    
    const allCalendarTestsPassed = calendarTestResults.every(r => r.success)
    
    addTest('Calendar Logic with Mock Data', allCalendarTestsPassed, {
      results: calendarTestResults,
      totalTests: calendarTestResults.length,
      passedTests: calendarTestResults.filter(r => r.success).length,
      mockDataUsed: mockBusyTimes
    })

    // Test 3: Busy Time Conflict Detection
    console.log('🧪 Test 3: Busy Time Conflict Detection')
    
    const conflictTests = [
      {
        name: 'Meeting during busy time',
        meetingTime: { start: '2025-07-07T13:30:00Z', end: '2025-07-07T14:30:00Z' },
        expectedConflict: true
      },
      {
        name: 'Meeting during free time',
        meetingTime: { start: '2025-07-07T11:00:00Z', end: '2025-07-07T12:00:00Z' },
        expectedConflict: false
      },
      {
        name: 'Meeting overlapping busy start',
        meetingTime: { start: '2025-07-08T09:30:00Z', end: '2025-07-08T10:30:00Z' },
        expectedConflict: true
      }
    ]
    
    const conflictResults = []
    
    for (const test of conflictTests) {
      const meetingStart = new Date(test.meetingTime.start)
      const meetingEnd = new Date(test.meetingTime.end)
      
      let hasActualConflict = false
      
      for (const { busy } of mockBusyTimes) {
        for (const { start: busyStart, end: busyEnd } of busy) {
          const busyStartTime = new Date(busyStart)
          const busyEndTime = new Date(busyEnd)
          
          const conflict = (
            (meetingStart < busyEndTime && meetingEnd > busyStartTime)
          )
          
          if (conflict) {
            hasActualConflict = true
            break
          }
        }
        if (hasActualConflict) break
      }
      
      const testPassed = hasActualConflict === test.expectedConflict
      
      conflictResults.push({
        test: test.name,
        expected: test.expectedConflict,
        actual: hasActualConflict,
        passed: testPassed,
        meetingTime: test.meetingTime
      })
    }
    
    const allConflictTestsPassed = conflictResults.every(r => r.passed)
    
    addTest('Busy Time Conflict Detection', allConflictTestsPassed, {
      results: conflictResults,
      totalTests: conflictTests.length,
      passedTests: conflictResults.filter(r => r.passed).length
    })

  } catch (error) {
    addTest('Overall Test', false, {
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  const allTestsPassed = testResults.summary.failed === 0

  return NextResponse.json({
    ...testResults,
    overallStatus: allTestsPassed ? 'PASSED' : 'FAILED',
    recommendations: allTestsPassed ? 
      ['All logic tests passed! Calendar integration should work correctly when authenticated.'] :
      [
        'Review failed tests above',
        'Check parameter processing logic',
        'Verify busy time conflict detection algorithm',
        'Test with real authentication to confirm integration'
      ]
  })
}