import { getServerSession } from "next-auth/next"
import { google } from "googleapis"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    // セッション確認
    const session = await getServerSession(authOptions) as any
    
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { 
          error: "認証が必要です",
          hasSession: !!session,
          hasAccessToken: !!session?.accessToken,
          sessionData: session ? {
            user: session.user,
            hasError: !!session.error
          } : null
        },
        { status: 401 }
      )
    }

    // Google Calendar API設定
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // 簡単なテスト呼び出し
    try {
      const testResponse = await calendar.calendarList.list({
        maxResults: 1
      })
      
      return NextResponse.json({
        success: true,
        message: "Google Calendar API access is working",
        tokenValid: true,
        user: session.user,
        testResult: {
          calendarsFound: testResponse.data.items?.length || 0,
          primaryCalendar: testResponse.data.items?.[0]?.id || 'None'
        }
      })
    } catch (apiError: any) {
      console.error('Google Calendar API test failed:', apiError)
      
      return NextResponse.json({
        success: false,
        message: "Google Calendar API access failed",
        tokenValid: false,
        user: session.user,
        error: {
          message: apiError.message,
          status: apiError.status,
          code: apiError.code
        }
      }, { status: 401 })
    }

  } catch (error) {
    console.error('Token test error:', error)
    return NextResponse.json(
      { 
        error: "トークンテストに失敗しました",
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}