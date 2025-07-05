import { getServerSession } from "next-auth/next"
import { google } from "googleapis"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions) as any
    
    if (!session || !session.accessToken) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      )
    }

    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: session.accessToken,
    })

    const userDomain = session.user.email.split('@')[1]
    const diagnostics = {
      userEmail: session.user.email,
      userDomain: userDomain,
      hasAccessToken: !!session.accessToken,
      tests: {} as any
    }

    // Test 1: Admin SDK access
    try {
      const admin = google.admin({ version: 'directory_v1', auth: oauth2Client })
      await admin.users.list({
        domain: userDomain,
        maxResults: 1
      })
      diagnostics.tests.adminSDK = { success: true, message: 'Admin SDK access granted' }
    } catch (error: any) {
      diagnostics.tests.adminSDK = { 
        success: false, 
        error: error.message,
        status: error.status || error.code,
        details: error.details
      }
    }

    // Test 2: Calendar API access
    try {
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
      const calendarList = await calendar.calendarList.list({ maxResults: 1 })
      diagnostics.tests.calendarAPI = { 
        success: true, 
        message: 'Calendar API access granted',
        calendarsFound: calendarList.data.items?.length || 0
      }
    } catch (error: any) {
      diagnostics.tests.calendarAPI = { 
        success: false, 
        error: error.message,
        status: error.status || error.code
      }
    }

    // Test 3: People API access (alternative for contacts)
    try {
      const people = google.people({ version: 'v1', auth: oauth2Client })
      const connections = await people.people.connections.list({
        resourceName: 'people/me',
        pageSize: 1
      })
      diagnostics.tests.peopleAPI = { 
        success: true, 
        message: 'People API access granted',
        connectionsFound: connections.data.connections?.length || 0
      }
    } catch (error: any) {
      diagnostics.tests.peopleAPI = { 
        success: false, 
        error: error.message,
        status: error.status || error.code
      }
    }

    // Test 4: Check domain type
    const isDomainWorkspace = await checkIfWorkspaceDomain(userDomain)
    diagnostics.tests.domainCheck = {
      domain: userDomain,
      isWorkspace: isDomainWorkspace,
      message: isDomainWorkspace ? 'Google Workspace domain detected' : 'Consumer Gmail domain detected'
    }

    return NextResponse.json({
      success: true,
      data: diagnostics
    })

  } catch (error) {
    console.error('Diagnostics error:', error)
    return NextResponse.json(
      { 
        error: "診断の実行に失敗しました",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

async function checkIfWorkspaceDomain(domain: string): Promise<boolean> {
  // 一般的なGmail/consumer domains
  const consumerDomains = ['gmail.com', 'googlemail.com']
  return !consumerDomains.includes(domain.toLowerCase())
}