import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const accountId = req.nextUrl.searchParams.get('accountId')
  if (!accountId) return NextResponse.json({ error: 'accountId required' }, { status: 400 })

  const db = createAdminClient()
  const { data, error } = await db
    .from('scheduled_posts')
    .select('*')
    .eq('account_id', accountId)
    .order('scheduled_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { accountId, content, mediaUrl, scheduledAt } = await req.json()
  const db = createAdminClient()

  const { data, error } = await db.from('scheduled_posts').insert({
    account_id: accountId,
    post_text: content,
    media_url: mediaUrl || null,
    scheduled_at: scheduledAt,
    status: 'pending',
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json()
  const db = createAdminClient()
  const { error } = await db.from('scheduled_posts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
