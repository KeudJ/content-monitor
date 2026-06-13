import { NextResponse } from 'next/server'

export async function GET() {
  const appId = process.env.THREADS_APP_ID!
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!
  const redirectUri = `${appUrl}/api/threads/auth/callback`

  const scopes = [
    'threads_basic',
    'threads_content_publish',
    'threads_read_engagement',
    'threads_manage_insights',
    'threads_manage_replies',
  ].join(',')

  const url = new URL('https://threads.net/oauth/authorize')
  url.searchParams.set('client_id', appId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('scope', scopes)
  url.searchParams.set('response_type', 'code')

  return NextResponse.redirect(url.toString())
}
