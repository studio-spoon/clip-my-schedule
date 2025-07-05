import { getServerSession } from "next-auth/next"
import { google } from "googleapis"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
    summary: {
      passed: 0,
      failed: 0,
      status: 'unknown'
    }
  }

  const addTest = (name: string, passed: boolean, details: any) => {
    diagnostics.tests.push({
      name,
      passed,
      details,
      timestamp: new Date().toISOString()
    })
    if (passed) {
      diagnostics.summary.passed++
    } else {
      diagnostics.summary.failed++
    }
  }

  try {
    // Test 1: Environment Variables
    console.log('🧪 Test 1: Environment Variables')
    const hasClientId = !!process.env.GOOGLE_CLIENT_ID
    const hasClientSecret = !!process.env.GOOGLE_CLIENT_SECRET
    const hasNextAuthSecret = !!process.env.NEXTAUTH_SECRET
    const hasNextAuthUrl = !!process.env.NEXTAUTH_URL

    addTest('Environment Variables', hasClientId && hasClientSecret && hasNextAuthSecret, {
      hasClientId,
      hasClientSecret,
      hasNextAuthSecret,
      hasNextAuthUrl,
      clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0
    })

    // Test 2: Session Status
    console.log('🧪 Test 2: Session Status')
    const session = await getServerSession(authOptions) as any
    const hasSession = !!session
    const hasAccessToken = !!session?.accessToken
    const hasRefreshToken = !!session?.refreshToken
    const hasError = !!session?.error

    addTest('Session Status', hasSession && hasAccessToken, {
      hasSession,
      hasAccessToken,
      hasRefreshToken,
      hasError,
      error: session?.error,
      userEmail: session?.user?.email,
      accessTokenLength: session?.accessToken?.length || 0
    })

    if (!hasSession || !hasAccessToken) {
      diagnostics.summary.status = 'not_authenticated'
      return NextResponse.json(diagnostics)
    }

    // Test 3: Token Validation
    console.log('🧪 Test 3: Token Validation')
    try {
      const oauth2Client = new google.auth.OAuth2()
      oauth2Client.setCredentials({
        access_token: session.accessToken,
      })

      // Test with a simple API call
      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
      const tokenInfo = await oauth2.tokeninfo()
      
      addTest('Token Validation', true, {
        tokenValid: true,
        scope: tokenInfo.data.scope,
        expiresIn: tokenInfo.data.expires_in,
        audience: tokenInfo.data.audience
      })
    } catch (tokenError: any) {
      addTest('Token Validation', false, {
        tokenValid: false,
        error: tokenError.message,
        status: tokenError.status,
        code: tokenError.code
      })
    }

    // Test 4: Calendar API Access
    console.log('🧪 Test 4: Calendar API Access')
    try {
      const oauth2Client = new google.auth.OAuth2()
      oauth2Client.setCredentials({
        access_token: session.accessToken,
      })

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
      const calendarListResponse = await calendar.calendarList.list({ maxResults: 1 })
      
      addTest('Calendar API Access', true, {
        calendarsFound: calendarListResponse.data.items?.length || 0,
        primaryCalendar: calendarListResponse.data.items?.[0]?.id,
        accessRole: calendarListResponse.data.items?.[0]?.accessRole
      })
    } catch (calendarError: any) {
      addTest('Calendar API Access', false, {
        error: calendarError.message,
        status: calendarError.status,
        code: calendarError.code,
        details: calendarError.errors || []
      })
    }

    // Test 5: FreeBusy API Access
    console.log('🧪 Test 5: FreeBusy API Access')
    try {
      const oauth2Client = new google.auth.OAuth2()
      oauth2Client.setCredentials({
        access_token: session.accessToken,
      })

      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
      const timeMin = new Date().toISOString()
      const timeMax = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      
      const freeBusyResponse = await calendar.freebusy.query({
        requestBody: {
          timeMin,
          timeMax,
          items: [{ id: session.user.email }],
        },
      })
      
      const busyPeriods = freeBusyResponse.data.calendars?.[session.user.email]?.busy || []
      const errors = freeBusyResponse.data.calendars?.[session.user.email]?.errors || []
      
      addTest('FreeBusy API Access', true, {
        busyPeriodsFound: busyPeriods.length,
        errors: errors,
        timeRange: { timeMin, timeMax },
        calendarAccessed: session.user.email
      })
    } catch (freeBusyError: any) {
      addTest('FreeBusy API Access', false, {
        error: freeBusyError.message,
        status: freeBusyError.status,
        code: freeBusyError.code,
        details: freeBusyError.errors || []
      })
    }

    // Test 6: Scope Verification
    console.log('🧪 Test 6: Scope Verification')
    try {
      const oauth2Client = new google.auth.OAuth2()
      oauth2Client.setCredentials({
        access_token: session.accessToken,
      })

      const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
      const tokenInfo = await oauth2.tokeninfo()
      const scopes = tokenInfo.data.scope?.split(' ') || []
      
      const requiredScopes = [
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.freebusy'
      ]
      
      const hasRequiredScopes = requiredScopes.every(scope => scopes.includes(scope))
      
      addTest('Scope Verification', hasRequiredScopes, {
        grantedScopes: scopes,
        requiredScopes,
        hasRequiredScopes,
        missingScopes: requiredScopes.filter(scope => !scopes.includes(scope))
      })
    } catch (scopeError: any) {
      addTest('Scope Verification', false, {
        error: scopeError.message,
        status: scopeError.status
      })
    }

  } catch (error: any) {
    addTest('Overall Test', false, {
      error: error.message,
      stack: error.stack
    })
  }

  // Determine overall status
  if (diagnostics.summary.failed === 0) {
    diagnostics.summary.status = 'all_passed'
  } else if (diagnostics.summary.passed === 0) {
    diagnostics.summary.status = 'all_failed'
  } else {
    diagnostics.summary.status = 'partial_failure'
  }

  // Generate recommendations
  const recommendations = []
  
  if (!diagnostics.tests.find(t => t.name === 'Environment Variables')?.passed) {
    recommendations.push('Check .env.local file for missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, NEXTAUTH_SECRET')
  }
  
  if (!diagnostics.tests.find(t => t.name === 'Session Status')?.passed) {
    recommendations.push('User needs to log out and log back in to get fresh tokens')
  }
  
  if (!diagnostics.tests.find(t => t.name === 'Token Validation')?.passed) {
    recommendations.push('Access token is invalid or expired - requires re-authentication')
  }
  
  if (!diagnostics.tests.find(t => t.name === 'Scope Verification')?.passed) {
    recommendations.push('Missing required OAuth scopes - check authOptions configuration')
  }
  
  if (!diagnostics.tests.find(t => t.name === 'Calendar API Access')?.passed) {
    recommendations.push('Calendar API access denied - check Google Cloud Console API enablement')
  }

  diagnostics.summary.recommendations = recommendations

  console.log('🎯 OAuth Diagnostics Summary:')
  console.log(`   Passed: ${diagnostics.summary.passed}`)
  console.log(`   Failed: ${diagnostics.summary.failed}`)
  console.log(`   Status: ${diagnostics.summary.status}`)
  console.log(`   Recommendations: ${recommendations.length}`)

  return NextResponse.json(diagnostics)
}