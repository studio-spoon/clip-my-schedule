import { getServerSession } from "next-auth/next"
import { google } from "googleapis"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

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
    const timeMin = searchParams.get('timeMin') || new Date().toISOString()
    const timeMax = searchParams.get('timeMax') || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
    const emails = searchParams.get('emails')?.split(',') || [session.user.email]

    // 複数のカレンダーから空き時間を取得
    const busyTimesPromises = emails.map(async (email) => {
      try {
        console.log(`Fetching calendar data for ${email}...`)
        console.log(`Time range: ${timeMin} to ${timeMax}`)
        
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
          console.warn(`Calendar errors for ${email}:`, calendarErrors)
        }
        
        console.log(`Raw busy periods for ${email}:`, JSON.stringify(busyPeriods, null, 2))
        
        const processedBusy = busyPeriods.map((period: any) => ({
          start: period.start || '',
          end: period.end || ''
        })).filter((period: any) => period.start && period.end)
        
        console.log(`Processed busy periods for ${email}:`, JSON.stringify(processedBusy, null, 2))
        
        return {
          email,
          busy: processedBusy,
          errors: calendarErrors,
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

    // 空き時間の計算
    const freeSlots = calculateFreeSlots(busyTimes, timeMin, timeMax)
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
  timeMin: string,
  timeMax: string
) {
  const slots = []
  const start = new Date(timeMin)
  const end = new Date(timeMax)
  
  // 営業時間設定 (10:00-17:00) - 日本時間基準
  const workingHours = { start: 10, end: 17 }
  
  console.log(`Calculating free slots from ${start.toISOString()} to ${end.toISOString()}`)
  
  for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
    // 土日をスキップ
    if (date.getDay() === 0 || date.getDay() === 6) {
      console.log(`Skipping weekend: ${date.toDateString()}`)
      continue
    }
    
    console.log(`\nProcessing date: ${date.toDateString()}`)
    const daySlots = []
    
    // 1時間ごとのスロットをチェック
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      // 日本時間でスロット時間を設定 (UTC+9を考慮)
      const slotStart = new Date(date)
      slotStart.setUTCHours(hour - 9, 0, 0, 0) // 日本時間をUTCに変換
      
      const slotEnd = new Date(date)
      slotEnd.setUTCHours(hour - 9 + 1, 0, 0, 0)
      
      console.log(`  Checking slot ${hour}:00-${hour+1}:00 JST (${slotStart.toISOString()} - ${slotEnd.toISOString()} UTC)`)
      
      // 全員が空いているかチェック
      let isSlotFree = true
      let conflictDetails = []
      
      for (const { email, busy } of busyTimes) {
        for (const { start: busyStart, end: busyEnd } of busy) {
          const busyStartTime = new Date(busyStart)
          const busyEndTime = new Date(busyEnd)
          
          // より厳密な重複チェック
          const hasConflict = (
            // ケース1: スロットが忙しい時間内で開始
            (slotStart >= busyStartTime && slotStart < busyEndTime) ||
            // ケース2: スロットが忙しい時間内で終了
            (slotEnd > busyStartTime && slotEnd <= busyEndTime) ||
            // ケース3: スロットが忙しい時間を完全に包含
            (slotStart < busyStartTime && slotEnd > busyEndTime) ||
            // ケース4: 忙しい時間がスロットを完全に包含
            (busyStartTime <= slotStart && busyEndTime >= slotEnd)
          )
          
          if (hasConflict) {
            isSlotFree = false
            conflictDetails.push({
              email,
              busyPeriod: `${busyStartTime.toISOString()} - ${busyEndTime.toISOString()}`,
              reason: 'Time conflict detected'
            })
            console.log(`    ❌ CONFLICT with ${email}: ${busyStart} - ${busyEnd}`)
          }
        }
      }
      
      if (isSlotFree) {
        console.log(`    ✅ FREE slot`)
        daySlots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          time: `${hour.toString().padStart(2, '0')}:00-${(hour + 1).toString().padStart(2, '0')}:00`,
        })
      } else {
        console.log(`    ❌ BUSY slot - conflicts:`, conflictDetails)
      }
    }
    
    if (daySlots.length > 0) {
      const dateStr = date.toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'numeric', 
        day: 'numeric',
        weekday: 'short',
      })
      
      console.log(`  📅 Adding ${daySlots.length} free slots for ${dateStr}`)
      
      slots.push({
        date: dateStr,
        times: daySlots.map(slot => slot.time),
      })
    } else {
      console.log(`  📅 No free slots found for this date`)
    }
  }
  
  console.log(`\nFinal result: ${slots.length} days with free slots`)
  return slots
}