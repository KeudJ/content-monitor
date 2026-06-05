import { createAdminClient } from '@/lib/supabase/server'
import { fetchRssFeed } from './rss'
import { crawlBlog } from './crawler'
import type { RawContentItem, Source } from '@/lib/types'

export interface SyncResult {
  added: number
  skipped: number
  errors: string[]
}

async function syncSource(
  source: Source,
  projectId: string
): Promise<{ added: number; skipped: number; error?: string }> {
  let items: RawContentItem[] = []

  try {
    items = source.type === 'rss'
      ? await fetchRssFeed(source.url)
      : await crawlBlog(source.url)
  } catch (err) {
    return {
      added: 0,
      skipped: 0,
      error: `${source.url}: ${err instanceof Error ? err.message : String(err)}`,
    }
  }

  const db = createAdminClient()
  let added = 0
  let skipped = 0

  for (const item of items) {
    if (!item.url) continue
    const { error } = await db.from('content_items').upsert(
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
    error ? skipped++ : added++
  }

  return { added, skipped }
}

export async function syncProject(projectId: string): Promise<SyncResult> {
  const db = createAdminClient()
  const { data: sources, error } = await db
    .from('sources')
    .select('*')
    .eq('project_id', projectId)

  if (error) throw new Error(error.message)
  if (!sources || sources.length === 0) return { added: 0, skipped: 0, errors: [] }

  const results = await Promise.allSettled(
    (sources as Source[]).map(source => syncSource(source, projectId))
  )

  return results.reduce<SyncResult>(
    (acc, r) => {
      if (r.status === 'fulfilled') {
        acc.added += r.value.added
        acc.skipped += r.value.skipped
        if (r.value.error) acc.errors.push(r.value.error)
      } else {
        acc.errors.push(String(r.reason))
      }
      return acc
    },
    { added: 0, skipped: 0, errors: [] }
  )
}

export async function syncAllProjects(): Promise<void> {
  const db = createAdminClient()
  const { data: projects } = await db.from('projects').select('id')
  if (!projects) return
  await Promise.allSettled(projects.map(p => syncProject(p.id)))
}
