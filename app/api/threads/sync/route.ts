import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getThreadsList, getPostInsights, getUserFollowersCount } from '@/lib/threads/api'

export async function POST(req: NextRequest) {
  const { accountId } = await req.json()
  const db = createAdminClient()

  const { data: account, error: accErr } = await db
    .from('threads_accounts')
    .select('*')
    .eq('id', accountId)
    .single()

  if (accErr || !account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  const threadsData = await getThreadsList(account.access_token, account.threads_user_id)
  const threadsList = threadsData.data || []

  const followersCount = await getUserFollowersCount(account.access_token, account.threads_user_id)

  let synced = 0
  let insightsError: unknown = null
  for (const post of threadsList) {
    const insights = await getPostInsights(account.access_token, post.id)
    if (!insights && !insightsError) insightsError = `insights null for post ${post.id}`
    const metrics: Record<string, number> = {}

    if (insights?.data) {
      for (const m of insights.data) {
        metrics[m.name] = m.values?.[0]?.value ?? m.total_value?.value ?? 0
      }
    } else if (insights?.error) {
      insightsError = insights.error
    }

    const likes = metrics['likes'] ?? 0
    const comments = metrics['replies'] ?? 0
    const reposts = metrics['reposts'] ?? 0
    const quotes = metrics['quotes'] ?? 0
    const impressions = metrics['views'] ?? 0
    const profileClicks = metrics['clicks'] ?? 0
    const engagementRate = impressions > 0
      ? (likes + comments + reposts + quotes) / impressions
      : 0

    await db.from('posts').upsert({
      account_id: accountId,
      threads_post_id: post.id,
      post_text: post.text || null,
      media_url: post.media_url || null,
      published_at: post.timestamp || null,
      impressions,
      likes,
      comments,
      reposts,
      quotes,
      profile_clicks: profileClicks,
      followers_count: followersCount,
      engagement_rate: engagementRate,
      synced_at: new Date().toISOString(),
    }, { onConflict: 'threads_post_id' })

    synced++
  }

  return NextResponse.json({ synced, insightsError })
}
