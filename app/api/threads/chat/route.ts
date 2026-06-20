import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createAdminClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { accountId, messages } = await req.json()
  const db = createAdminClient()

  const { data: posts } = await db
    .from('posts')
    .select('post_text, published_at, impressions, likes, comments, reposts, quotes, engagement_rate')
    .eq('account_id', accountId)
    .order('published_at', { ascending: false })
    .limit(30)

  const postsContext = (posts || [])
    .map(p => `[${p.published_at?.slice(0, 10)}] 조회수:${p.impressions} 좋아요:${p.likes} 참여율:${(p.engagement_rate * 100).toFixed(2)}%\n${p.post_text || '(미디어 게시물)'}`)
    .join('\n\n---\n\n')

  const systemPrompt = `당신은 Threads SNS 콘텐츠 전략 전문가입니다.
아래는 분석 대상 계정의 최근 30개 게시물 데이터입니다:

${postsContext}

이 데이터를 바탕으로 사용자의 질문에 답변해주세요. 구체적인 수치와 인사이트를 제공하세요.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages,
  })

  return NextResponse.json({ content: response.content[0].type === 'text' ? response.content[0].text : '' })
}
