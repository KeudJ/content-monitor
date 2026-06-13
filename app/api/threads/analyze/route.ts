import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { accountId } = await req.json()
  const db = createAdminClient()

  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  const { data: posts } = await db
    .from('posts')
    .select('content, engagement_rate, impressions, published_at')
    .eq('account_id', accountId)
    .gte('published_at', since)
    .not('content', 'is', null)

  const postsText = (posts || [])
    .map(p => `[참여율:${(p.engagement_rate * 100).toFixed(2)}%] ${p.content}`)
    .join('\n\n')

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `다음은 최근 90일간 Threads 게시물입니다:\n\n${postsText}\n\n아래 두 가지를 JSON으로 답변해주세요:
{
  "hashtag_analysis": "해시태그별 사용 빈도와 평균 참여율 설명",
  "keyword_clusters": [
    {"topic": "주제명", "keywords": ["키워드1", "키워드2"], "avg_engagement": 0.05, "post_count": 10, "insight": "인사이트"},
    ...
  ]
}`,
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '{}'
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

  // Also fetch hashtag stats from DB
  const { data: hashtagStats } = await db
    .from('hashtag_stats')
    .select('*')
    .eq('account_id', accountId)
    .order('avg_engagement_rate', { ascending: false })

  // Parse hashtags from posts if no stats
  if (!hashtagStats?.length && posts?.length) {
    const hashtagMap: Record<string, { total_er: number; count: number }> = {}
    for (const post of posts) {
      const tags = (post.content || '').match(/#[\w가-힣]+/g) || []
      for (const tag of tags) {
        if (!hashtagMap[tag]) hashtagMap[tag] = { total_er: 0, count: 0 }
        hashtagMap[tag].total_er += post.engagement_rate
        hashtagMap[tag].count++
      }
    }
    const computed = Object.entries(hashtagMap)
      .map(([hashtag, v]) => ({
        hashtag,
        total_posts: v.count,
        avg_engagement_rate: v.total_er / v.count,
      }))
      .sort((a, b) => b.avg_engagement_rate - a.avg_engagement_rate)

    return NextResponse.json({ ...result, hashtag_stats: computed })
  }

  return NextResponse.json({ ...result, hashtag_stats: hashtagStats || [] })
}
