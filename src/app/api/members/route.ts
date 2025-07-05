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

    // Google APIs設定
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    })

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
    const admin = google.admin({ version: 'directory_v1', auth: oauth2Client })

    // メンバー情報を整理
    const members = []
    
    // 自分を最初に追加
    members.push({
      email: session.user.email,
      name: session.user.name || session.user.email.split('@')[0],
      displayName: `${session.user.name || session.user.email.split('@')[0]} (あなた)`,
      calendarId: session.user.email,
      accessRole: 'owner',
      source: 'self'
    })

    // 1. 共有カレンダーメンバーを取得
    try {
      const calendarListResponse = await calendar.calendarList.list()
      const calendars = calendarListResponse.data.items || []

      // 共有されているカレンダーを抽出
      const sharedCalendars = calendars.filter(cal => {
        return cal.id && cal.id !== session.user.email && cal.accessRole && cal.accessRole !== 'owner'
      })

      // 共有カレンダーのメンバーを追加
      for (const cal of sharedCalendars) {
        if (cal.id && cal.summary) {
          const email = cal.id
          const name = cal.summary || cal.summaryOverride || email.split('@')[0]
          
          members.push({
            email: email,
            name: name,
            displayName: `${name} (${email})`,
            calendarId: cal.id,
            accessRole: cal.accessRole || 'reader',
            source: 'shared'
          })
        }
      }
      
      console.log(`Found ${sharedCalendars.length} shared calendars`)
    } catch (error) {
      console.error('Error fetching shared calendars:', error)
    }

    // 2. 組織内メンバーを取得（同じドメインのユーザー）
    const userDomain = session.user.email.split('@')[1]
    if (userDomain) {
      try {
        // Google Workspace組織内のユーザーを取得
        const orgUsersResponse = await admin.users.list({
          domain: userDomain,
          maxResults: 100, // 最大100名まで取得
          projection: 'basic',
          query: 'isAdmin=false OR isAdmin=true' // 全ユーザーを取得
        })

        const orgUsers = orgUsersResponse.data.users || []
        
        console.log(`Found ${orgUsers.length} organization users for domain: ${userDomain}`)

        // 組織内メンバーを追加
        for (const user of orgUsers) {
          if (user.primaryEmail && user.primaryEmail !== session.user.email) {
            // 既に追加されているユーザーをスキップ
            const existingMember = members.find(m => m.email === user.primaryEmail)
            if (!existingMember) {
              const displayName = user.name?.fullName || user.primaryEmail.split('@')[0]
              
              members.push({
                email: user.primaryEmail,
                name: displayName,
                displayName: `${displayName} (${user.primaryEmail})`,
                calendarId: user.primaryEmail,
                accessRole: 'organization',
                source: 'organization'
              })
            }
          }
        }
      } catch (error: any) {
        console.error('Error fetching organization users:', {
          message: error.message,
          status: error.status,
          domain: userDomain
        })
        
        // Directory API のアクセス権限がない場合のログ
        if (error.status === 403) {
          console.log('Directory API access denied - user may not have admin permissions or domain may not be a Google Workspace domain')
        }
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
        totalMembers: uniqueMembers.length,
        organizationMembers: uniqueMembers.filter(m => m.source === 'organization').length,
        sharedMembers: uniqueMembers.filter(m => m.source === 'shared').length
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