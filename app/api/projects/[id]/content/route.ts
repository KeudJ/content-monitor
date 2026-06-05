import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const db = createAdminClient()
  const { data, error } = await db
    .from('content_items')
    .select('*')
    .eq('project_id', id)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: Request, { params }: Params) {
  const { id } = await params
  const { ids } = await req.json()
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids array is required' }, { status: 400 })
  }
  const db = createAdminClient()
  const { error } = await db
    .from('content_items')
    .delete()
    .in('id', ids)
    .eq('project_id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
