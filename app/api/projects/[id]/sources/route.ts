import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface Params { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: Params) {
  const { id } = await params
  const { url, type } = await req.json()
  if (!url?.trim() || !['rss', 'blog'].includes(type)) {
    return NextResponse.json({ error: 'url and type (rss|blog) are required' }, { status: 400 })
  }
  const db = createAdminClient()
  const { data, error } = await db
    .from('sources')
    .insert({ project_id: id, url: url.trim(), type })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}

export async function DELETE(req: Request, { params }: Params) {
  const { id } = await params
  const { sourceId } = await req.json()
  const db = createAdminClient()
  const { error } = await db
    .from('sources')
    .delete()
    .eq('id', sourceId)
    .eq('project_id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
