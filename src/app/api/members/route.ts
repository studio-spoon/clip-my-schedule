import { getServerSession } from "next-auth/next"
import { google } from "googleapis"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // セッション確認
    const session = await getServerSession(authOptions) as any
    
    console.log('Session check:', {
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken,
      userEmail: session?.user?.email
    })
    
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

    // カレンダーリストを取得
    const calendarListResponse = await calendar.calendarList.list()
    const calendars = calendarListResponse.data.items || []

    // 共有されているカレンダーを抽出
    const sharedCalendars = calendars.filter(cal => {
      // 自分以外のカレンダー（共有を受けているもの）
      return cal.id && cal.id !== session.user.email && cal.accessRole && cal.accessRole !== 'owner'
    })

    // メンバー情報を整理
    const members = []
    
    // 自分を最初に追加
    members.push({
      email: session.user.email,
      name: session.user.name || session.user.email.split('@')[0],
      displayName: `${session.user.name || session.user.email.split('@')[0]} (あなた)`,
      calendarId: session.user.email,
      accessRole: 'owner'
    })

    // 共有カレンダーのメンバーを追加
    for (const cal of sharedCalendars) {
      if (cal.id && cal.summary) {
        // カレンダーIDからメール部分を抽出（通常はメールアドレス）
        const email = cal.id
        const name = cal.summary || cal.summaryOverride || email.split('@')[0]
        
        members.push({
          email: email,
          name: name,
          displayName: `${name} (${email})`,
          calendarId: cal.id,
          accessRole: cal.accessRole || 'reader'
        })
      }
    }

    // 重複を除去（メールアドレスベース）
    const uniqueMembers = members.filter((member, index, self) => 
      index === self.findIndex(m => m.email === member.email)
    )

    return NextResponse.json({
      success: true,
      data: {
        members: uniqueMembers,
        totalCalendars: calendars.length,
        sharedCalendars: sharedCalendars.length
      },
    })

  } catch (error) {
    console.error('Members API error:', error)
    
    // Google API エラーの詳細ログ
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack
      })
    }

    return NextResponse.json(
      { 
        error: "メンバー情報の取得に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}