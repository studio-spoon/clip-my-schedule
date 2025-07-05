import { NextResponse } from "next/server"

export async function GET() {
  const authFlowInfo = {
    timestamp: new Date().toISOString(),
    authFlow: {
      loginUrl: `/api/auth/signin/google`,
      callbackUrl: `/api/auth/callback/google`,
      sessionUrl: `/api/auth/session`,
      testTokenUrl: `/api/debug/oauth-test`
    },
    configuration: {
      nextAuthUrl: process.env.NEXTAUTH_URL || 'Not configured',
      hasGoogleClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
      googleClientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0
    },
    instructions: [
      {
        step: 1,
        action: "Visit login URL",
        url: "http://localhost:3000/api/auth/signin/google",
        description: "This will redirect you to Google OAuth consent screen"
      },
      {
        step: 2,
        action: "Complete Google OAuth",
        description: "Grant permissions for Calendar access"
      },
      {
        step: 3,
        action: "Check session",
        url: "http://localhost:3000/api/auth/session",
        description: "Verify that session contains access token"
      },
      {
        step: 4,
        action: "Test OAuth functionality",
        url: "http://localhost:3000/api/debug/oauth-test",
        description: "Run comprehensive OAuth tests"
      },
      {
        step: 5,
        action: "Test Calendar API",
        url: "http://localhost:3000/api/calendar",
        description: "Test actual calendar integration"
      }
    ],
    commonIssues: [
      {
        issue: "OAuth consent screen not configured",
        solution: "Check Google Cloud Console OAuth consent screen setup"
      },
      {
        issue: "Missing required scopes",
        solution: "Ensure calendar.readonly and calendar.freebusy scopes are granted"
      },
      {
        issue: "Invalid redirect URI",
        solution: "Check authorized redirect URIs in Google Cloud Console"
      },
      {
        issue: "Domain verification",
        solution: "For production, verify domain ownership in Google Search Console"
      }
    ],
    troubleshooting: {
      clearSession: "Visit http://localhost:3000/api/auth/signout to clear session",
      forceReauth: "Add ?prompt=consent to login URL to force re-authentication",
      checkLogs: "Monitor browser console and server logs during OAuth flow"
    }
  }

  return NextResponse.json(authFlowInfo)
}