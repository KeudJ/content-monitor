import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { accountId } = await req.json()
  const db = createAdminClient()

  const { data: posts } = await db
    .from('posts')
    .select('content, engagement_rate, likes, impressions')
    .eq('account_id', accountId)
    .not('content', 'is', null)
    .order('engagement_rate', { ascending: false })
    .limit(10)

  const postsText = (posts || [])
    .map((p, i) => `[${i + 1}] 참여율 ${(p.engagement_rate * 100).toFixed(2)}%\n${p.content}`)
    .join('\n\n---\n\n')

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `아래는 참여율 상위 10개 Threads 게시물입니다:\n\n${postsText}\n\n각 게시물을 다른 각도로 리라이팅해서 재발행할 수 있는 버전 3개씩 제안해주세요.
JSON 배열 형식으로 답변해주세요:
[{"original": "원본 내용", "suggestions": ["버전1", "버전2", "버전3"]}, ...]`,
    }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : '[]'
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : []

  return NextResponse.json({ suggestions })
}
