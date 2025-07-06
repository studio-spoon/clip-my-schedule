import { getServerSession } from "next-auth/next"
import { Session } from "next-auth"
import { google } from "googleapis"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // セッション確認
    const session: Session | null = await getServerSession(authOptions)
    
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
    console.log(`Attempting to fetch organization users for domain: ${userDomain}`)
    
    if (userDomain) {
      try {
        // まず、現在のユーザーの権限を確認
        console.log('Testing Admin SDK access...')
        
        // Google Workspace組織内のユーザーを取得
        const orgUsersResponse = await admin.users.list({
          domain: userDomain,
          maxResults: 10, // まずは10名で試す
          projection: 'basic'
        })

        const orgUsers = orgUsersResponse.data.users || []
        
        console.log(`✅ Successfully found ${orgUsers.length} organization users for domain: ${userDomain}`)
        console.log('Organization users sample:', orgUsers.slice(0, 3).map(u => ({
          email: u.primaryEmail,
          name: u.name?.fullName,
          suspended: u.suspended
        })))

        // 組織内メンバーを追加
        for (const user of orgUsers) {
          if (user.primaryEmail && user.primaryEmail !== session.user.email && !user.suspended) {
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
              
              console.log(`Added organization member: ${displayName} (${user.primaryEmail})`)
            }
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('❌ Error fetching organization users:', {
          message: error.message,
          status: error.status,
          code: error.code,
          domain: userDomain,
          details: error.details || error.response?.data
        })
        
        // Directory API のアクセス権限がない場合の詳細ログ
        if (error.status === 403 || error.code === 403) {
          console.log('🔒 Directory API access denied. Possible reasons:')
          console.log('1. User does not have admin permissions')
          console.log('2. Domain is not a Google Workspace domain')
          console.log('3. Admin SDK API is not enabled for this project')
          console.log('4. OAuth consent screen needs Admin Directory API scope approval')
        }
        
        if (error.status === 400 || error.code === 400) {
          console.log('❌ Bad request - Domain may not exist or invalid format')
        }
      }
    }

    // 3. 代替方法：Google People API (Contacts) から組織メンバーを取得
    if (userDomain && members.filter(m => m.source === 'organization').length === 0) {
      try {
        console.log('🔄 Trying alternative approach with People API...')
        
        const people = google.people({ version: 'v1', auth: oauth2Client })
        
        // コンタクトから同じドメインのユーザーを取得
        const connections = await people.people.connections.list({
          resourceName: 'people/me',
          pageSize: 100,
          personFields: 'names,emailAddresses,organizations'
        })

        const contacts = connections.data.connections || []
        console.log(`Found ${contacts.length} contacts via People API`)

        // 同じドメインのコンタクトを抽出
        for (const contact of contacts) {
          if (contact.emailAddresses) {
            for (const emailAddr of contact.emailAddresses) {
              const email = emailAddr.value
              if (email && email.includes(`@${userDomain}`) && email !== session.user.email) {
                // 既に追加されているユーザーをスキップ
                const existingMember = members.find(m => m.email === email)
                if (!existingMember) {
                  const name = contact.names?.[0]?.displayName || email.split('@')[0]
                  
                  members.push({
                    email: email,
                    name: name,
                    displayName: `${name} (${email})`,
                    calendarId: email,
                    accessRole: 'organization',
                    source: 'organization'
                  })
                  
                  console.log(`Added organization contact: ${name} (${email})`)
                }
              }
            }
          }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error('People API error:', error)
        console.log('People API access may not be granted or contacts are empty')
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