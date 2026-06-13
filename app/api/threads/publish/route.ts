import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createThreadsDraft, publishThreadsDraft } from '@/lib/threads/api'

export async function POST(req: NextRequest) {
  const { accountId, content, mediaUrl } = await req.json()
  const db = createAdminClient()

  const { data: account, error } = await db
    .from('threads_accounts')
    .select('*')
    .eq('id', accountId)
    .single()

  if (error || !account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 })
  }

  const draft = await createThreadsDraft(account.access_token, account.threads_user_id, content, mediaUrl)
  if (!draft.id) {
    return NextResponse.json({ error: 'Failed to create draft', detail: draft }, { status: 500 })
  }

  const result = await publishThreadsDraft(account.access_token, account.threads_user_id, draft.id)
  return NextResponse.json({ ok: true, id: result.id })
}
