import { createAdminClient } from '@/lib/supabase/server'
import { fetchRssFeed } from './rss'
import { crawlBlog } from './crawler'
import type { RawContentItem, Source } from '@/lib/types'

export interface SyncResult {
  added: number
  skipped: number
  errors: string[]
}

export async function syncProject(projectId: string): Promise<SyncResult> {
  const db = createAdminClient()
  const { data: sources, error } = await db
    .from('sources')
    .select('*')
    .eq('project_id', projectId)

  if (error) throw new Error(error.message)
  if (!sources || sources.length === 0) return { added: 0, skipped: 0, errors: [] }

  const result: SyncResult = { added: 0, skipped: 0, errors: [] }

  for (const source of sources as Source[]) {
    let items: RawContentItem[] = []

    try {
      if (source.type === 'rss') {
        items = await fetchRssFeed(source.url)
      } else {
        items = await crawlBlog(source.url)
      }
    } catch (err) {
      result.errors.push(`${source.url}: ${err instanceof Error ? err.message : String(err)}`)
      continue
    }

    for (const item of items) {
      if (!item.url) continue

      const { error: upsertErr } = await db.from('content_items').upsert(
        {
          project_id: projectId,
          source_id: source.id,
          title: item.title,
          meta_description: item.meta_description,
          url: item.url,
          domain: item.domain,
          published_at: item.published_at,
          is_new: true,
        },
        { onConflict: 'url', ignoreDuplicates: true }
      )

      if (upsertErr) {
        result.skipped++
      } else {
        result.added++
      }
    }
  }

  return result
}

export async function syncAllProjects(): Promise<void> {
  const db = createAdminClient()
  const { data: projects } = await db.from('projects').select('id')
  if (!projects) return

  await Promise.allSettled(projects.map(p => syncProject(p.id)))
}
