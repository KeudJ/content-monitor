import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params
  const { data, error } = await supabaseAdmin
    .from('content_items')
    .select('*')
    .eq('project_id', id)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
