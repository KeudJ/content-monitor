import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

interface Params { params: Promise<{ id: string }> }

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params
  const { name } = await req.json()
  if (!name?.trim()) return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  const { data, error } = await supabaseAdmin
    .from('projects')
    .update({ name: name.trim() })
    .eq('id', id)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params
  const { error } = await supabaseAdmin.from('projects').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
