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
    .select('*')
    .eq('account_id', accountId)
    .gte('published_at', since)
    .order('engagement_rate', { ascending: false })

  const postsContext = (posts || [])
    .map(p => `날짜:${p.published_at?.slice(0, 10)} 조회수:${p.impressions} 좋아요:${p.likes} 댓글:${p.comments} 리포스트:${p.reposts} 참여율:${(p.engagement_rate * 100).toFixed(2)}%\n${p.content || '(미디어)'}`)
    .join('\n\n---\n\n')

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `다음은 최근 90일간의 Threads 게시물 데이터입니다:\n\n${postsContext}\n\n이 데이터를 분석하여 아래 항목을 마크다운 형식으로 작성해주세요:

# Threads 성과 분석 리포트

## 1. 오디언스가 반응하는 콘텐츠 유형
## 2. 참여율 높은 게시물의 공통 패턴 (길이, 톤, 구조)
## 3. 개선 제안 3가지
## 4. 다음 2주 콘텐츠 방향 제안`,
    }],
  })

  const report = response.content[0].type === 'text' ? response.content[0].text : ''
  return NextResponse.json({ report })
}
