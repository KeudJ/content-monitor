import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const db = createAdminClient()
  const { data, error } = await db
    .from('threads_accounts')
    .select('id, username, profile_picture_url, tone_manner, concept, target_audience, created_at')
    .order('created_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: Request) {
  const { id, tone_manner, concept, target_audience } = await req.json()
  const db = createAdminClient()
  const { error } = await db.from('threads_accounts')
    .update({ tone_manner, concept, target_audience })
    .eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const { id } = await req.json()
  const db = createAdminClient()
  const { error } = await db.from('threads_accounts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
