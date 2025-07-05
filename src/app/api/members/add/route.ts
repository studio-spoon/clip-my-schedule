import { getServerSession } from "next-auth/next"
import { google } from "googleapis"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const { email } = await request.json()
    
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: "有効なメールアドレスが必要です" },
        { status: 400 }
      )
    }

    // 自分のドメインと同じかチェック
    const userDomain = session.user.email.split('@')[1]
    const memberDomain = email.split('@')[1]
    
    if (userDomain !== memberDomain) {
      return NextResponse.json(
        { error: "同じ組織のメンバーのみ追加できます" },
        { status: 400 }
      )
    }

    // Google APIs設定
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

    // メンバーのカレンダーアクセスを確認
    try {
      // フリービジー情報で存在確認（最小限のアクセス）
      const now = new Date()
      const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
      
      const freeBusyResponse = await calendar.freebusy.query({
        requestBody: {
          timeMin: now.toISOString(),
          timeMax: oneHourLater.toISOString(),
          items: [{ id: email }]
        }
      })

      if (freeBusyResponse.data.calendars?.[email]) {
        // メンバーが見つかった場合
        const member = {
          email: email,
          name: email.split('@')[0],
          displayName: `${email.split('@')[0]} (${email})`,
          calendarId: email,
          accessRole: 'organization',
          source: 'organization' as const
        }

        return NextResponse.json({
          success: true,
          data: { member }
        })
      } else {
        return NextResponse.json(
          { error: "指定されたメンバーのカレンダーにアクセスできません" },
          { status: 404 }
        )
      }
    } catch (error: any) {
      console.error('Calendar access check failed:', error)
      
      // エラーでも基本的なメンバー情報を返す（カレンダーアクセスは後で確認）
      const member = {
        email: email,
        name: email.split('@')[0],
        displayName: `${email.split('@')[0]} (${email})`,
        calendarId: email,
        accessRole: 'organization',
        source: 'organization' as const
      }

      return NextResponse.json({
        success: true,
        data: { member },
        warning: "カレンダーアクセスの確認ができませんでした。スケジュール検索時にエラーが発生する可能性があります。"
      })
    }

  } catch (error) {
    console.error('Add member API error:', error)
    return NextResponse.json(
      { 
        error: "メンバーの追加に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}