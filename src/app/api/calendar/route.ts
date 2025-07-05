import { getServerSession } from "next-auth/next"
import { google } from "googleapis"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { getCachedCalendarData, setCachedCalendarData, getCacheStats } from "@/lib/calendar-cache"
import { processScheduleParams, validateScheduleParams, type ScheduleParams, type ProcessedScheduleParams } from "@/lib/schedule-processor"

export async function GET(request: NextRequest) {
  try {
    // セッション確認
    const session = await getServerSession(authOptions) as any
    
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    // Check for token refresh errors
    if (session.error === "RefreshAccessTokenError") {
      return NextResponse.json(
        { error: "認証トークンの更新に失敗しました。再ログインが必要です。" },
        { status: 401 }
      )
    }

    console.log("Session info:", {
      hasSession: !!session,
      hasAccessToken: !!session.accessToken,
      userEmail: session.user?.email,
      error: session.error
    })

    // Google Calendar API設定
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // クエリパラメータの取得
    const { searchParams } = new URL(request.url)
    const emails = searchParams.get('emails')?.split(',') || [session.user.email]
    
    // スケジュールパラメータの取得
    const scheduleParams: ScheduleParams = {
      selectedPeriod: searchParams.get('selectedPeriod') || '直近1週間',
      selectedTimeSlot: searchParams.get('selectedTimeSlot') || 'デフォルト',
      customTimeStart: searchParams.get('customTimeStart') || '',
      customTimeEnd: searchParams.get('customTimeEnd') || '',
      meetingDuration: searchParams.get('meetingDuration') || '60分',
      bufferTimeBefore: searchParams.get('bufferTimeBefore') || '0分',
      bufferTimeAfter: searchParams.get('bufferTimeAfter') || '0分',
      customDuration: searchParams.get('customDuration') || '',
      customPeriodStart: searchParams.get('customPeriodStart') || undefined,
      customPeriodEnd: searchParams.get('customPeriodEnd') || undefined,
    }
    
    // パラメータ検証
    const validation = validateScheduleParams(scheduleParams)
    if (!validation.isValid) {
      return NextResponse.json({
        success: false,
        error: `パラメータエラー: ${validation.errors.join(', ')}`,
        warnings: validation.warnings
      }, { status: 400 })
    }
    
    // パラメータ処理
    const processedParams = processScheduleParams(scheduleParams)
    const timeMin = processedParams.timeRange.start.toISOString()
    const timeMax = processedParams.timeRange.end.toISOString()

    // ログ出力: リクエスト情報
    console.log(`🔍 Calendar API Request:`)
    console.log(`   Time range: ${timeMin} to ${timeMax}`)
    console.log(`   Emails: ${emails.join(', ')}`)
    console.log(`   Cache stats:`, getCacheStats())

    // 複数のカレンダーから空き時間を取得
    const busyTimesPromises = emails.map(async (email) => {
      try {
        // キャッシュをチェック
        const cachedData = getCachedCalendarData(email, timeMin, timeMax)
        if (cachedData) {
          console.log(`🎯 Using cached data for ${email}`)
          return {
            email,
            busy: cachedData.busyPeriods,
            source: 'cache',
            cachedAt: new Date(cachedData.cachedAt).toISOString()
          }
        }

        console.log(`📡 Fetching fresh calendar data for ${email}...`)
        
        const response = await calendar.freebusy.query({
          requestBody: {
            timeMin,
            timeMax,
            items: [{ id: email }],
          },
        })
        
        const busyPeriods = response.data.calendars?.[email]?.busy || []
        const calendarErrors = response.data.calendars?.[email]?.errors || []
        
        if (calendarErrors.length > 0) {
          console.warn(`⚠️ Calendar errors for ${email}:`, calendarErrors)
        }
        
        const processedBusy = busyPeriods.map((period: any) => ({
          start: period.start || '',
          end: period.end || ''
        })).filter((period: any) => period.start && period.end)
        
        // キャッシュに保存
        setCachedCalendarData(email, timeMin, timeMax, processedBusy)
        
        console.log(`✅ Fetched ${processedBusy.length} busy periods for ${email}`)
        if (processedBusy.length > 0) {
          console.log(`📅 Busy periods:`, processedBusy.map(p => `${p.start} - ${p.end}`))}
        
        return {
          email,
          busy: processedBusy,
          errors: calendarErrors,
          source: 'api'
        }
      } catch (error: any) {
        console.error(`Error fetching calendar for ${email}:`, error)
        
        // Log detailed error information
        if (error.response) {
          console.error('API Response Error:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
          })
        }
        
        return {
          email,
          busy: [],
          error: error.response?.status === 401 ? 
            'Authentication error - token may be expired' : 
            'カレンダーアクセスエラー',
        }
      }
    })

    const busyTimes = await Promise.all(busyTimesPromises)
    console.log('All busy times collected:', JSON.stringify(busyTimes, null, 2))

    // エラーチェック
    const firstError = busyTimes.find(bt => bt.error)
    if (firstError) {
      return NextResponse.json({
        success: false,
        error: `カレンダー「${firstError.email}」の取得に失敗しました: ${firstError.error}`,
        errorDetails: busyTimes.filter(bt => bt.error)
      }, { status: 502 }) // Bad Gateway
    }

    // 空き時間の計算（処理されたパラメータを使用）
    const freeSlots = calculateFreeSlots(busyTimes, processedParams)
    console.log('Calculated free slots:', JSON.stringify(freeSlots, null, 2))

    return NextResponse.json({
      success: true,
      data: {
        freeSlots,
        busyTimes,
        timeRange: { timeMin, timeMax },
        participants: emails,
      },
    })

  } catch (error) {
    console.error('Calendar API error:', error)
    return NextResponse.json(
      { error: "カレンダー情報の取得に失敗しました" },
      { status: 500 }
    )
  }
}

// 空き時間計算関数
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
  
  console.log(`📊 Calculating free slots with parameters:`)
  console.log(`   Time range: ${start.toISOString()} to ${end.toISOString()}`)
  console.log(`   Working hours: ${workingHours.start}:00-${workingHours.end}:00`)
  console.log(`   Meeting duration: ${meetingDuration} minutes`)
  console.log(`   Buffer time before: ${bufferTimeBefore} minutes`)
  console.log(`   Buffer time after: ${bufferTimeAfter} minutes`)
  
  for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
    // 土日をスキップ
    if (date.getDay() === 0 || date.getDay() === 6) {
      console.log(`⏭️ Skipping weekend: ${date.toDateString()}`)
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
      let conflictDetails = []
      
      for (const { email, busy } of busyTimes) {
        for (const { start: busyStart, end: busyEnd } of busy) {
          const busyStartTime = new Date(busyStart)
          const busyEndTime = new Date(busyEnd)
          
          const hasConflict = (
            (slotStart < busyEndTime && slotEnd > busyStartTime)
          )
          
          if (hasConflict) {
            isSlotFree = false
            conflictDetails.push({
              email,
              busyPeriod: `${busyStartTime.toISOString()} - ${busyEndTime.toISOString()}`,
              slotPeriod: `${slotStart.toISOString()} - ${slotEnd.toISOString()}`,
              reason: 'Time conflict'
            })
            console.log(`    ❌ CONFLICT with ${email}: busy ${busyStart} - ${busyEnd}`)
          }
        }
      }
      
      if (isSlotFree) {
        const meetingStart = new Date(slotStart.getTime() + bufferTimeBefore * 60 * 1000);
        const meetingEnd = new Date(meetingStart.getTime() + meetingDuration * 60 * 1000);

        console.log(`    ✅ FREE slot (${meetingDuration}min meeting + ${bufferTimeBefore}min before + ${bufferTimeAfter}min after)`)
        
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
        metadata: {
          workingHours: `${workingHours.start}:00-${workingHours.end}:00`,
          meetingDuration: `${meetingDuration}分`,
          bufferTimeBefore: `${bufferTimeBefore}分`,
          bufferTimeAfter: `${bufferTimeAfter}分`
        }
      })
    } else {
      console.log(`  📋 No free slots found for this date`)
    }
  }
  
  console.log(`\n🎯 Final result: ${slots.length} days with free slots`)
  return slots
}