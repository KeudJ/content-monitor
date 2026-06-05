import Parser from 'rss-parser'
import type { RawContentItem } from '@/lib/types'

const parser = new Parser({
  timeout: 15000,
  headers: { 'User-Agent': 'ContentMonitor/1.0' },
})

export async function fetchRssFeed(feedUrl: string): Promise<RawContentItem[]> {
  const feed = await parser.parseURL(feedUrl)
  const domain = (() => {
    try { return new URL(feedUrl).hostname } catch { return feedUrl }
  })()

  return feed.items
    .filter(item => !!item.link)
    .map(item => ({
      title: item.title?.trim() || null,
      meta_description: (item.contentSnippet || item.summary || '').slice(0, 500).trim() || null,
      url: item.link!,
      domain,
      published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
    }))
}
