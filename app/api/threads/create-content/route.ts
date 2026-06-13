import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import * as cheerio from 'cheerio'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const GUIDELINES = `Threads 게시물 가이드라인:
- 500자 이내
- 첫 문장이 강한 후킹으로 시작
- 단락 간 줄바꿈으로 가독성 확보
- 해시태그는 마지막에 최대 3개
- 질문 또는 CTA로 마무리`

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { mode, url, topic, tone, text } = body

  let sourceContent = ''

  if (mode === 'url' && url) {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const html = await res.text()
    const $ = cheerio.load(html)
    $('script, style, nav, header, footer, aside').remove()
    sourceContent = $('article, main, .content, body').first().text().replace(/\s+/g, ' ').trim().slice(0, 3000)
  } else if (mode === 'text' && text) {
    sourceContent = text.slice(0, 3000)
  }

  let prompt = ''
  if (mode === 'free') {
    const toneMap: Record<string, string> = {
      professional: '전문적이고 신뢰감 있는',
      friendly: '친근하고 대화하듯 편안한',
      provocative: '도발적이고 강렬한',
    }
    prompt = `주제: "${topic}"\n톤: ${toneMap[tone] || '자연스러운'}\n\n위 주제로 ${GUIDELINES}\n\n3가지 버전의 Threads 게시물을 작성해주세요. 각 버전을 "---"로 구분해주세요.`
  } else {
    prompt = `다음 자료를 바탕으로 Threads 게시물 3개 버전을 작성해주세요.\n\n자료:\n${sourceContent}\n\n${GUIDELINES}\n\n3가지 버전을 "---"로 구분해주세요.`
  }

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const full = response.content[0].type === 'text' ? response.content[0].text : ''
  const versions = full.split(/\n?---\n?/).map(v => v.trim()).filter(Boolean)

  return NextResponse.json({ versions })
}
