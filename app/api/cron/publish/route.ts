import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createThreadsDraft, publishThreadsDraft } from '@/lib/threads/api'

export async function GET() {
  const db = createAdminClient()
  const now = new Date().toISOString()

  const { data: due } = await db
    .from('scheduled_posts')
    .select('*, threads_accounts(*)')
    .eq('status', 'pending')
    .lte('scheduled_at', now)

  if (!due?.length) return NextResponse.json({ published: 0 })

  let published = 0
  for (const post of due) {
    const account = post.threads_accounts as { access_token: string; threads_user_id: string }
    if (!account) continue

    try {
      const draft = await createThreadsDraft(account.access_token, account.threads_user_id, post.content, post.media_url ?? undefined)
      if (draft.id) {
        await publishThreadsDraft(account.access_token, account.threads_user_id, draft.id)
        await db.from('scheduled_posts').update({ status: 'published' }).eq('id', post.id)
        published++
      }
    } catch {
      await db.from('scheduled_posts').update({ status: 'failed' }).eq('id', post.id)
    }
  }

  return NextResponse.json({ published })
}
