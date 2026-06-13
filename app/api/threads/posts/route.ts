import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const accountId = req.nextUrl.searchParams.get('accountId')
  const days = Number(req.nextUrl.searchParams.get('days') || '30')
  const limit = Number(req.nextUrl.searchParams.get('limit') || '100')

  if (!accountId) return NextResponse.json({ error: 'accountId required' }, { status: 400 })

  const db = createAdminClient()
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data, error } = await db
    .from('posts')
    .select('*')
    .eq('account_id', accountId)
    .gte('published_at', since)
    .order('published_at', { ascending: false })
    .limit(limit)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
