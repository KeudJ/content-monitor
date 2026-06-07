import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const maxDuration = 60

interface Params { params: Promise<{ id: string }> }

type TextRef = { itemId: string; field: 'title' | 'meta_description' }

export async function POST(req: Request, { params }: Params) {
  const { id } = await params
  const { ids } = await req.json()

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids array is required' }, { status: 400 })
  }

  const apiKey = process.env.DEEPL_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'DEEPL_API_KEY is not configured' }, { status: 500 })
  }

  const db = createAdminClient()

  const { data: items, error } = await db
    .from('content_items')
    .select('id, title, meta_description')
    .in('id', ids)
    .eq('project_id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!items || items.length === 0) return NextResponse.json({ translated: 0 })

  const texts: string[] = []
  const refs: TextRef[] = []

  for (const item of items) {
    if (item.title?.trim()) {
      texts.push(item.title)
      refs.push({ itemId: item.id, field: 'title' })
    }
    if (item.meta_description?.trim()) {
      texts.push(item.meta_description)
      refs.push({ itemId: item.id, field: 'meta_description' })
    }
  }

  if (texts.length === 0) return NextResponse.json({ translated: 0 })

  const deeplUrl = apiKey.endsWith(':fx')
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate'

  const deeplRes = await fetch(deeplUrl, {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text: texts, target_lang: 'KO' }),
  })

  if (!deeplRes.ok) {
    const msg = await deeplRes.text()
    return NextResponse.json({ error: `DeepL: ${msg}` }, { status: 500 })
  }

  const { translations } = await deeplRes.json()

  const updates: Record<string, { title?: string; meta_description?: string }> = {}
  refs.forEach((ref, i) => {
    if (!updates[ref.itemId]) updates[ref.itemId] = {}
    updates[ref.itemId][ref.field] = translations[i].text
  })

  await Promise.all(
    Object.entries(updates).map(([itemId, fields]) =>
      db.from('content_items').update(fields).eq('id', itemId).eq('project_id', id)
    )
  )

  return NextResponse.json({ translated: Object.keys(updates).length })
}
