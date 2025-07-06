import { NextRequest, NextResponse } from 'next/server'

// 7/7(月)の実際のカレンダーデータをシミュレート
const testBusyTimes = [
  {
    email: 'test@example.com',
    busy: [
      // 10:00-10:30 (既存の予定)
      {
        start: '2025-07-07T10:00:00+09:00',
        end: '2025-07-07T10:30:00+09:00'
      },
      // 12:00-13:00 (既存の予定)
      {
        start: '2025-07-07T12:00:00+09:00',
        end: '2025-07-07T13:00:00+09:00'
      },
      // 14:00-17:00 (既存の予定)
      {
        start: '2025-07-07T14:00:00+09:00',
        end: '2025-07-07T17:00:00+09:00'
      }
    ]
  }
]

interface ProcessedScheduleParams {
  timeRange: { start: Date; end: Date }
  workingHours: { start: number; end: number }
  meetingDuration: number
  bufferTimeBefore: number
  bufferTimeAfter: number
  totalSlotDuration: number
}

// 隙間時間ロジックのテスト用関数（calendar/route.tsから抽出）
function calculateFreeSlots(
  busyTimes: Array<{ email: string; busy: Array<{ start: string; end: string }> }>,
  params: ProcessedScheduleParams
) {
  const slots = []
  const start = params.timeRange.start
  const end = params.timeRange.end
  const workingHours = params.workingHours
  const meetingDuration = params.meetingDuration
  const bufferTimeBefore = params.bufferTimeBefore
  const bufferTimeAfter = params.bufferTimeAfter
  
  console.log(`🧪 TEST: Calculating free slots with parameters:`)
  console.log(`   Time range: ${start.toISOString()} to ${end.toISOString()}`)
  console.log(`   Working hours: ${workingHours.start}:00-${workingHours.end}:00`)
  console.log(`   Meeting duration: ${meetingDuration} minutes`)
  console.log(`   Buffer time before: ${bufferTimeBefore} minutes`)
  console.log(`   Buffer time after: ${bufferTimeAfter} minutes`)
  console.log(`   Total slot duration: ${params.totalSlotDuration} minutes`)
  
  for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
    // 土日をスキップ
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue
    }
    
    console.log(`\n📅 Processing date: ${date.toDateString()}`)
    const daySlots = []
    
    const slotIncrement = 15; // 15分単位でチェック
    const totalSlotMinutes = params.totalSlotDuration;
    
    // 指定された時間範囲内でスロットをチェック
    for (let minute = workingHours.start * 60; minute <= workingHours.end * 60 - totalSlotMinutes; minute += slotIncrement) {
      const slotStart = new Date(date)
      slotStart.setHours(0, minute, 0, 0)
      
      const slotEnd = new Date(slotStart.getTime() + totalSlotMinutes * 60 * 1000)
      
      console.log(`  🕐 Checking slot ${slotStart.toLocaleTimeString()}-${slotEnd.toLocaleTimeString()}`)
      
      // 全員が空いているかチェック
      let isSlotFree = true
      const conflictDetails = []
      
      for (const { email, busy } of busyTimes) {
        for (const { start: busyStart, end: busyEnd } of busy) {
          const busyStartTime = new Date(busyStart)
          const busyEndTime = new Date(busyEnd)
          
          // 修正: 同じ日付で比較するために時刻のみで比較
          // slotStartとslotEndは既に同じ日付なので、時刻のみを比較
          const slotStartTime = slotStart.getTime()
          const slotEndTime = slotEnd.getTime()
          const busyStartTimeStamp = busyStartTime.getTime()
          const busyEndTimeStamp = busyEndTime.getTime()
          
          // 重複チェックの条件: 
          // 境界値を含めた正しい重複チェック
          // スロットの開始 < 予定の終了 AND スロットの終了 > 予定の開始
          const hasConflict = (
            slotStartTime < busyEndTimeStamp && slotEndTime > busyStartTimeStamp
          )
          
          // 特別ケース: 重複や接触のチェック
          // 隙間時間が0分の場合は、境界値での接触は許可する
          // 隙間時間がある場合は、境界値での接触も競合とみなす
          const isTouching = (
            slotEndTime === busyStartTimeStamp || slotStartTime === busyEndTimeStamp
          )
          
          // 隙間時間が0の場合は境界での接触を許可、隙間時間がある場合は禁止
          const shouldAvoidTouching = bufferTimeBefore > 0 || bufferTimeAfter > 0
          const finalHasConflict = hasConflict || (shouldAvoidTouching && isTouching)
          
          console.log(`      📋 Checking conflict:`)
          console.log(`         Slot: ${slotStart.toLocaleTimeString()} - ${slotEnd.toLocaleTimeString()}`)
          console.log(`         Busy: ${busyStartTime.toLocaleTimeString()} - ${busyEndTime.toLocaleTimeString()}`)
          console.log(`         Slot times: ${slotStartTime} - ${slotEndTime}`)
          console.log(`         Busy times: ${busyStartTimeStamp} - ${busyEndTimeStamp}`)
          console.log(`         Basic conflict: ${hasConflict}`)
          console.log(`         Is touching: ${isTouching}`)
          console.log(`         Should avoid touching: ${shouldAvoidTouching}`)
          console.log(`         Final conflict: ${finalHasConflict}`)
          
          if (finalHasConflict) {
            isSlotFree = false
            conflictDetails.push({
              email,
              busyPeriod: `${busyStartTime.toISOString()} - ${busyEndTime.toISOString()}`,
              slotPeriod: `${slotStart.toISOString()} - ${slotEnd.toISOString()}`,
              reason: 'Time conflict'
            })
            console.log(`    ❌ CONFLICT with ${email}: busy ${busyStart} - ${busyEnd}`)
            break // この予定との競合が見つかったら、他の予定をチェックする必要なし
          }
        }
        if (!isSlotFree) {
          break // すでに競合が見つかったら、他のユーザーをチェックする必要なし
        }
      }
      
      if (isSlotFree) {
        // 修正: 会議時間はslotStartから開始し、隙間時間は内部的に確保される
        const meetingStart = new Date(slotStart);
        const meetingEnd = new Date(meetingStart.getTime() + meetingDuration * 60 * 1000);
        
        console.log(`    ✅ FREE slot:`)
        console.log(`       Meeting time: ${meetingStart.toLocaleTimeString()}-${meetingEnd.toLocaleTimeString()} (${meetingDuration}min)`)
        console.log(`       Buffer before: ${bufferTimeBefore}min, after: ${bufferTimeAfter}min`)
        console.log(`       Total reserved: ${slotStart.toLocaleTimeString()}-${slotEnd.toLocaleTimeString()} (${totalSlotMinutes}min)`)
        
        daySlots.push({
          start: meetingStart.toISOString(),
          end: meetingEnd.toISOString(),
          time: `${meetingStart.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} - ${meetingEnd.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`,
          duration: meetingDuration,
          bufferBefore: bufferTimeBefore,
          bufferAfter: bufferTimeAfter
        })
      } else {
        console.log(`    ❌ BUSY slot - conflicts:`, conflictDetails.length)
      }
    }
    
    if (daySlots.length > 0) {
      const dateStr = date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'numeric', 
        day: 'numeric',
        weekday: 'short',
      })
      
      console.log(`  📋 Adding ${daySlots.length} free slots for ${dateStr}`)
      
      slots.push({
        date: dateStr,
        times: daySlots.map(slot => slot.time),
        slots: daySlots
      })
    } else {
      console.log(`  📋 No free slots found for this date`)
    }
  }
  
  return slots
}

export async function GET(request: NextRequest) {
  try {
    console.log('\n🧪 ========== BUFFER TIME LOGIC TEST ==========')
    console.log('Testing specific scenario: 7/7 Monday with existing appointments')
    console.log('Existing appointments:')
    console.log('  - 10:00-10:30')
    console.log('  - 12:00-13:00') 
    console.log('  - 14:00-17:00')
    console.log('Expected free slot for 60min meeting: 13:00-14:00 (with 0min buffer)')
    console.log('Expected free slots with 15min buffer: 0 slots')
    
    const testDate = new Date('2025-07-07T00:00:00+09:00')
    const testEndDate = new Date('2025-07-08T00:00:00+09:00')
    
    // テストケース1: 隙間時間0分の場合
    console.log('\n📋 TEST CASE 1: Buffer time 0min + 0min')
    const params1: ProcessedScheduleParams = {
      timeRange: { start: testDate, end: testEndDate },
      workingHours: { start: 10, end: 18 }, // 10:00-18:00
      meetingDuration: 60, // 60分の会議
      bufferTimeBefore: 0,
      bufferTimeAfter: 0,
      totalSlotDuration: 60 // 0 + 60 + 0
    }
    
    const result1 = calculateFreeSlots(testBusyTimes, params1)
    console.log(`✅ Result 1: Found ${result1.length > 0 ? result1[0].times.length : 0} free slots`)
    if (result1.length > 0) {
      console.log(`   Times: ${result1[0].times.join(', ')}`)
    }
    
    // テストケース2: 隙間時間15分(前)の場合  
    console.log('\n📋 TEST CASE 2: Buffer time 15min + 0min')
    const params2: ProcessedScheduleParams = {
      timeRange: { start: testDate, end: testEndDate },
      workingHours: { start: 10, end: 18 },
      meetingDuration: 60,
      bufferTimeBefore: 15, // 前に15分
      bufferTimeAfter: 0,
      totalSlotDuration: 75 // 15 + 60 + 0
    }
    
    const result2 = calculateFreeSlots(testBusyTimes, params2)
    console.log(`✅ Result 2: Found ${result2.length > 0 ? result2[0].times.length : 0} free slots`)
    if (result2.length > 0) {
      console.log(`   Times: ${result2[0].times.join(', ')}`)
    }
    
    // テストケース3: 隙間時間15分(後)の場合
    console.log('\n📋 TEST CASE 3: Buffer time 0min + 15min')
    const params3: ProcessedScheduleParams = {
      timeRange: { start: testDate, end: testEndDate },
      workingHours: { start: 10, end: 18 },
      meetingDuration: 60,
      bufferTimeBefore: 0,
      bufferTimeAfter: 15, // 後に15分
      totalSlotDuration: 75 // 0 + 60 + 15
    }
    
    const result3 = calculateFreeSlots(testBusyTimes, params3)
    console.log(`✅ Result 3: Found ${result3.length > 0 ? result3[0].times.length : 0} free slots`)
    if (result3.length > 0) {
      console.log(`   Times: ${result3[0].times.join(', ')}`)
    }
    
    // テストケース4: 隙間時間15分(前後)の場合
    console.log('\n📋 TEST CASE 4: Buffer time 15min + 15min')
    const params4: ProcessedScheduleParams = {
      timeRange: { start: testDate, end: testEndDate },
      workingHours: { start: 10, end: 18 },
      meetingDuration: 60,
      bufferTimeBefore: 15,
      bufferTimeAfter: 15,
      totalSlotDuration: 90 // 15 + 60 + 15
    }
    
    const result4 = calculateFreeSlots(testBusyTimes, params4)
    console.log(`✅ Result 4: Found ${result4.length > 0 ? result4[0].times.length : 0} free slots`)
    if (result4.length > 0) {
      console.log(`   Times: ${result4[0].times.join(', ')}`)
    }
    
    // 期待値との比較
    console.log('\n🎯 ========== TEST VALIDATION ==========')
    const test1Pass = result1.length > 0 && result1[0].times.includes('13:00 - 14:00')
    const test2Pass = result2.length === 0 || (result2.length > 0 && result2[0].times.length === 0)
    const test3Pass = result3.length === 0 || (result3.length > 0 && result3[0].times.length === 0)
    const test4Pass = result4.length === 0 || (result4.length > 0 && result4[0].times.length === 0)
    
    console.log(`Test 1 (0min buffer): ${test1Pass ? '✅ PASS' : '❌ FAIL'} - Expected 13:00-14:00`)
    console.log(`Test 2 (15min before): ${test2Pass ? '✅ PASS' : '❌ FAIL'} - Expected 0 slots`)
    console.log(`Test 3 (15min after): ${test3Pass ? '✅ PASS' : '❌ FAIL'} - Expected 0 slots`) 
    console.log(`Test 4 (15min both): ${test4Pass ? '✅ PASS' : '❌ FAIL'} - Expected 0 slots`)
    
    const allTestsPass = test1Pass && test2Pass && test3Pass && test4Pass
    console.log(`\n🏆 Overall Result: ${allTestsPass ? '✅ ALL TESTS PASS' : '❌ SOME TESTS FAILED'}`)
    
    return NextResponse.json({
      success: true,
      testResults: {
        case1: { pass: test1Pass, slots: result1.length > 0 ? result1[0].times : [] },
        case2: { pass: test2Pass, slots: result2.length > 0 ? result2[0].times : [] },
        case3: { pass: test3Pass, slots: result3.length > 0 ? result3[0].times : [] },
        case4: { pass: test4Pass, slots: result4.length > 0 ? result4[0].times : [] },
        allPass: allTestsPass
      },
      scenario: {
        date: '2025-07-07 (Monday)',
        workingHours: '10:00-18:00',
        existingAppointments: ['10:00-10:30', '12:00-13:00', '14:00-17:00'],
        meetingDuration: '60 minutes'
      }
    })
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}