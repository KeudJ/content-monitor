import { NextRequest, NextResponse } from 'next/server'
import { qwenChat } from '@/lib/qwen'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { accountId } = await req.json()
  const db = createAdminClient()

  const { data: posts } = await db
    .from('posts')
    .select('post_text, engagement_rate, likes, impressions')
    .eq('account_id', accountId)
    .not('post_text', 'is', null)
    .order('engagement_rate', { ascending: false })
    .limit(10)

  const postsText = (posts || [])
    .map((p, i) => `[${i + 1}] 참여율 ${(p.engagement_rate * 100).toFixed(2)}%\n${p.post_text}`)
    .join('\n\n---\n\n')

  const text = await qwenChat([{
    role: 'user',
    content: `아래는 참여율 상위 10개 Threads 게시물입니다:\n\n${postsText}\n\n각 게시물을 다른 각도로 리라이팅해서 재발행할 수 있는 버전 3개씩 제안해주세요.
JSON 배열 형식으로 답변해주세요:
[{"original": "원본 내용", "suggestions": ["버전1", "버전2", "버전3"]}, ...]`,
  }], 2048)
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  const suggestions = jsonMatch ? JSON.parse(jsonMatch[0]) : []

  return NextResponse.json({ suggestions })
}
