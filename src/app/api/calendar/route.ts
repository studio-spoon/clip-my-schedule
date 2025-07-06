import { getServerSession } from "next-auth/next"
import { Session } from "next-auth"
import { google } from "googleapis"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { getCachedCalendarData, setCachedCalendarData, getCacheStats } from "@/lib/calendar-cache"
import { processScheduleParams, validateScheduleParams, type ScheduleParams, type ProcessedScheduleParams } from "@/lib/schedule-processor"

export async function GET(request: NextRequest) {
  try {
    // セッション確認
    const session: Session | null = await getServerSession(authOptions)
    
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
    
    // タイムゾーン情報をログ出力
    const now = new Date()
    console.log(`🌍 Environment timezone info:`)
    console.log(`   Current time: ${now.toISOString()} (ISO)`)
    console.log(`   Current time: ${now.toString()} (toString)`)
    console.log(`   Timezone offset: ${now.getTimezoneOffset()} minutes`)
    console.log(`   Detected timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`)
    console.log(`   Process timezone: ${process.env.TZ || 'not set'}`)

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
        
        const processedBusy = busyPeriods.map((period: { start?: string | null; end?: string | null }) => ({
          start: period.start || '',
          end: period.end || ''
        })).filter((period: { start: string; end: string }) => period.start && period.end)
        
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  const totalSlotMinutes = params.totalSlotDuration
  
  console.log(`📊 Calculating free slots with parameters:`)
  console.log(`   Time range: ${start.toISOString()} to ${end.toISOString()}`)
  console.log(`   Working hours: ${workingHours.start}:00-${workingHours.end}:00`)
  console.log(`   Meeting duration: ${meetingDuration} minutes`)
  console.log(`   Buffer time before: ${bufferTimeBefore} minutes`)
  console.log(`   Buffer time after: ${bufferTimeAfter} minutes`)
  console.log(`   Total slot duration: ${totalSlotMinutes} minutes`)
  
  // タイムゾーン情報をログ出力（計算開始時）
  const calcNow = new Date()
  console.log(`🌍 Calculation timezone info:`)
  console.log(`   Calc start time: ${calcNow.toISOString()} (ISO)`)
  console.log(`   Calc start time: ${calcNow.toString()} (toString)`)
  console.log(`   Timezone offset: ${calcNow.getTimezoneOffset()} minutes`)
  
  for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
    // 土日をスキップ
    if (date.getDay() === 0 || date.getDay() === 6) {
      console.log(`⏭️ Skipping weekend: ${date.toDateString()}`)
      continue
    }
    
    console.log(`\n📅 Processing date: ${date.toDateString()}`)
    console.log(`   Date details: ${date.toISOString()} (ISO), ${date.toString()} (toString)`)
    console.log(`   Day of week: ${date.getDay()} (0=Sunday, 6=Saturday)`)
    
    // 1. その日の全員のビジー時間を統合
    const dayBusyPeriods = []
    for (const { email, busy } of busyTimes) {
      for (const { start: busyStart, end: busyEnd } of busy) {
        const busyStartTime = new Date(busyStart)
        const busyEndTime = new Date(busyEnd)
        
        // 同じ日付のビジー時間のみ取得
        if (busyStartTime.toDateString() === date.toDateString() || 
            busyEndTime.toDateString() === date.toDateString() ||
            (busyStartTime <= date && busyEndTime >= date)) {
          dayBusyPeriods.push({
            start: busyStartTime,
            end: busyEndTime,
            email
          })
        }
      }
    }
    
    console.log(`   📋 Found ${dayBusyPeriods.length} busy periods for this date`)
    dayBusyPeriods.forEach(period => {
      console.log(`     • ${period.email}: ${period.start.toLocaleTimeString()} - ${period.end.toLocaleTimeString()}`)
    })
    
    // 2. ビジー時間をソートして統合
    const sortedBusyPeriods = dayBusyPeriods.sort((a, b) => a.start.getTime() - b.start.getTime())
    const mergedBusyPeriods = []
    
    for (const period of sortedBusyPeriods) {
      if (mergedBusyPeriods.length === 0) {
        mergedBusyPeriods.push(period)
      } else {
        const lastPeriod = mergedBusyPeriods[mergedBusyPeriods.length - 1]
        // 重複または隣接している場合は統合
        if (period.start <= lastPeriod.end) {
          lastPeriod.end = new Date(Math.max(lastPeriod.end.getTime(), period.end.getTime()))
        } else {
          mergedBusyPeriods.push(period)
        }
      }
    }
    
    console.log(`   🔄 Merged into ${mergedBusyPeriods.length} busy periods`)
    mergedBusyPeriods.forEach((period, index) => {
      console.log(`     ${index + 1}. ${period.start.toLocaleTimeString()} - ${period.end.toLocaleTimeString()}`)
    })
    
    // 3. 空き時間を計算
    const freeSlots = []
    
    // その日の開始時刻と終了時刻を設定
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(date)
    dayEnd.setHours(23, 59, 59, 999)
    
    // 作業時間の範囲を設定
    const workStart = new Date(date)
    workStart.setHours(workingHours.start, 0, 0, 0)
    const workEnd = new Date(date)
    workEnd.setHours(workingHours.end, 0, 0, 0)
    
    console.log(`   🕐 Work hours: ${workStart.toLocaleTimeString()} - ${workEnd.toLocaleTimeString()}`)
    
    // 空き時間の候補を生成
    let currentTime = new Date(Math.max(dayStart.getTime(), workStart.getTime()))
    
    for (const busyPeriod of mergedBusyPeriods) {
      // 現在時刻からビジー時間の開始まで空いている場合
      if (currentTime < busyPeriod.start) {
        const freeStart = new Date(currentTime)
        const freeEnd = new Date(busyPeriod.start)
        
        // 作業時間内の空き時間のみ
        const effectiveFreeStart = new Date(Math.max(freeStart.getTime(), workStart.getTime()))
        const effectiveFreeEnd = new Date(Math.min(freeEnd.getTime(), workEnd.getTime()))
        
        if (effectiveFreeStart < effectiveFreeEnd) {
          freeSlots.push({
            start: effectiveFreeStart,
            end: effectiveFreeEnd,
            durationMinutes: (effectiveFreeEnd.getTime() - effectiveFreeStart.getTime()) / 60000
          })
        }
      }
      
      // 次の開始時刻を更新
      currentTime = new Date(Math.max(currentTime.getTime(), busyPeriod.end.getTime()))
    }
    
    // 最後のビジー時間から作業終了時刻まで
    if (currentTime < workEnd) {
      const effectiveFreeStart = new Date(Math.max(currentTime.getTime(), workStart.getTime()))
      const effectiveFreeEnd = new Date(workEnd)
      
      if (effectiveFreeStart < effectiveFreeEnd) {
        freeSlots.push({
          start: effectiveFreeStart,
          end: effectiveFreeEnd,
          durationMinutes: (effectiveFreeEnd.getTime() - effectiveFreeStart.getTime()) / 60000
        })
      }
    }
    
    console.log(`   🎯 Found ${freeSlots.length} free time slots`)
    freeSlots.forEach((slot, index) => {
      console.log(`     ${index + 1}. ${slot.start.toLocaleTimeString()} - ${slot.end.toLocaleTimeString()} (${slot.durationMinutes}min)`)
    })
    
    // 4. 会議可能な時間帯を生成
    const daySlots = []
    
    for (const freeSlot of freeSlots) {
      // 必要な時間（会議時間 + 隙間時間）が確保できるかチェック
      if (freeSlot.durationMinutes >= totalSlotMinutes) {
        // 15分刻みで会議開始時刻の候補を生成
        const slotStartTime = freeSlot.start.getTime()
        const slotEndTime = freeSlot.end.getTime() - (totalSlotMinutes * 60 * 1000)
        
        for (let time = slotStartTime; time <= slotEndTime; time += 15 * 60 * 1000) {
          const meetingStart = new Date(time + bufferTimeBefore * 60 * 1000)
          const meetingEnd = new Date(meetingStart.getTime() + meetingDuration * 60 * 1000)
          
          daySlots.push({
            start: meetingStart.toISOString(),
            end: meetingEnd.toISOString(),
            time: `${meetingStart.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })} - ${meetingEnd.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}`,
            duration: meetingDuration,
            bufferBefore: bufferTimeBefore,
            bufferAfter: bufferTimeAfter,
            debug: {
              freeSlot: `${freeSlot.start.toLocaleTimeString()} - ${freeSlot.end.toLocaleTimeString()}`,
              freeSlotDuration: freeSlot.durationMinutes,
              totalDuration: totalSlotMinutes
            }
          })
        }
      }
    }
    
    if (daySlots.length > 0) {
      const dateStr = date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'numeric', 
        day: 'numeric',
        weekday: 'short',
      })
      
      console.log(`  📋 Adding ${daySlots.length} meeting slots for ${dateStr}`)
      
      slots.push({
        date: dateStr,
        times: daySlots.map(slot => slot.time),
        debug: {
          slotDetails: daySlots.map(slot => ({
            time: slot.time,
            duration: slot.duration,
            bufferBefore: slot.bufferBefore,
            bufferAfter: slot.bufferAfter,
            freeSlot: slot.debug.freeSlot,
            freeSlotDuration: slot.debug.freeSlotDuration,
            totalDuration: slot.debug.totalDuration
          }))
        }
      })
    } else {
      console.log(`  📋 No meeting slots found for this date`)
    }
  }
  
  console.log(`\n🎯 Final result: ${slots.length} days with free slots`)
  return slots
}