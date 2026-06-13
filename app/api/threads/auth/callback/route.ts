import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/threads/api'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  if (!code) {
    return NextResponse.redirect(`${appUrl}/threads/dashboard?error=no_code`)
  }

  // Exchange code for long-lived token
  const tokenRes = await fetch('https://graph.threads.net/oauth/access_token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: process.env.THREADS_APP_ID!,
      client_secret: process.env.THREADS_APP_SECRET!,
      grant_type: 'authorization_code',
      redirect_uri: `${appUrl}/api/threads/auth/callback`,
      code,
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(`${appUrl}/threads/dashboard?error=token_exchange`)
  }

  const { access_token, user_id } = await tokenRes.json()

  // Exchange for long-lived token (60 days)
  const longLivedRes = await fetch(
    `https://graph.threads.net/access_token?grant_type=th_exchange_token&client_secret=${process.env.THREADS_APP_SECRET}&access_token=${access_token}`
  )
  const longLived = longLivedRes.ok ? await longLivedRes.json() : { access_token, expires_in: 3600 }
  const finalToken = longLived.access_token || access_token
  const expiresAt = new Date(Date.now() + (longLived.expires_in || 3600) * 1000).toISOString()

  const profile = await getProfile(finalToken)
  const db = createAdminClient()

  await db.from('threads_accounts').upsert({
    threads_user_id: String(user_id || profile.id),
    username: profile.username,
    access_token: finalToken,
    token_expires_at: expiresAt,
    profile_picture_url: profile.threads_profile_picture_url || null,
  }, { onConflict: 'threads_user_id' })

  return NextResponse.redirect(`${appUrl}/threads/dashboard?connected=1`)
}
