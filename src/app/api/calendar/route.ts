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
        const response = await calendar.freebusy.query({
          requestBody: {
            timeMin,
            timeMax,
            items: [{ id: email }],
          },
        })
        
        const busyPeriods = response.data.calendars?.[email]?.busy || []
        return {
          email,
          busy: busyPeriods.map((period: any) => ({
            start: period.start || '',
            end: period.end || ''
          })).filter((period: any) => period.start && period.end),
        }
      } catch (error) {
        console.error(`Error fetching calendar for ${email}:`, error)
        return {
          email,
          busy: [],
          error: 'カレンダーアクセスエラー',
        }
      }
    })

    const busyTimes = await Promise.all(busyTimesPromises)

    // 空き時間の計算
    const freeSlots = calculateFreeSlots(busyTimes, timeMin, timeMax)

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
  
  // 営業時間設定 (10:00-17:00)
  const workingHours = { start: 10, end: 17 }
  
  for (let date = new Date(start); date < end; date.setDate(date.getDate() + 1)) {
    // 土日をスキップ
    if (date.getDay() === 0 || date.getDay() === 6) continue
    
    const daySlots = []
    
    // 1時間ごとのスロットをチェック
    for (let hour = workingHours.start; hour < workingHours.end; hour++) {
      const slotStart = new Date(date)
      slotStart.setHours(hour, 0, 0, 0)
      
      const slotEnd = new Date(date)
      slotEnd.setHours(hour + 1, 0, 0, 0)
      
      // 全員が空いているかチェック
      const isSlotFree = busyTimes.every(({ busy }) => {
        return !busy.some(({ start: busyStart, end: busyEnd }) => {
          const busyStartTime = new Date(busyStart)
          const busyEndTime = new Date(busyEnd)
          
          return (
            (slotStart >= busyStartTime && slotStart < busyEndTime) ||
            (slotEnd > busyStartTime && slotEnd <= busyEndTime) ||
            (slotStart <= busyStartTime && slotEnd >= busyEndTime)
          )
        })
      })
      
      if (isSlotFree) {
        daySlots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString(),
          time: `${hour.toString().padStart(2, '0')}:00-${(hour + 1).toString().padStart(2, '0')}:00`,
        })
      }
    }
    
    if (daySlots.length > 0) {
      slots.push({
        date: date.toLocaleDateString('ja-JP', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          weekday: 'short',
        }),
        slots: daySlots,
      })
    }
  }
  
  return slots
}