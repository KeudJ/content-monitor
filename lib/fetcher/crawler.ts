import * as cheerio from 'cheerio'
import type { RawContentItem } from '@/lib/types'

async function fetchWithTimeout(url: string, ms = 15000): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), ms)
  try {
    return await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'ContentMonitor/1.0' },
    })
  } finally {
    clearTimeout(id)
  }
}

async function getMetaDescription(url: string): Promise<string | null> {
  try {
    const res = await fetchWithTimeout(url, 8000)
    if (!res.ok) return null
    const html = await res.text()
    const $ = cheerio.load(html)
    return (
      $('meta[name="description"]').attr('content') ||
      $('meta[property="og:description"]').attr('content') ||
      null
    )
  } catch {
    return null
  }
}

export async function crawlBlog(blogUrl: string): Promise<RawContentItem[]> {
  let domain: string
  try {
    domain = new URL(blogUrl).hostname
  } catch {
    domain = blogUrl
  }

  const res = await fetchWithTimeout(blogUrl)
  if (!res.ok) throw new Error(`Failed to fetch ${blogUrl}: ${res.status}`)
  const html = await res.text()
  const $ = cheerio.load(html)

  // Try to find inline RSS/Atom feed link
  const feedLink =
    $('link[type="application/rss+xml"]').attr('href') ||
    $('link[type="application/atom+xml"]').attr('href')

  if (feedLink) {
    const absoluteFeedUrl = new URL(feedLink, blogUrl).href
    const { fetchRssFeed } = await import('./rss')
    try {
      return await fetchRssFeed(absoluteFeedUrl)
    } catch {
      // fall through to HTML scraping
    }
  }

  // Collect article links from common blog patterns
  const seen = new Set<string>()
  const items: { url: string; title: string }[] = []

  const selectors = [
    'article a[href]',
    '.post-title a[href]',
    '.entry-title a[href]',
    'h2 a[href]',
    'h3 a[href]',
    '[class*="post"] h2 a[href]',
    '[class*="post"] h3 a[href]',
    '[class*="article"] h2 a[href]',
    '[class*="blog"] h2 a[href]',
    '[class*="blog"] h3 a[href]',
  ]

  for (const sel of selectors) {
    $(sel).each((_, el) => {
      const href = $(el).attr('href')
      const title = $(el).text().trim()
      if (!href || !title || title.length < 3) return
      try {
        const absolute = new URL(href, blogUrl).href
        if (!absolute.startsWith('http')) return
        if (new URL(absolute).hostname !== domain) return
        if (seen.has(absolute)) return
        seen.add(absolute)
        items.push({ url: absolute, title })
      } catch {
        // ignore bad URLs
      }
    })
    if (items.length >= 30) break
  }

  // Fetch meta descriptions in parallel (max 10 concurrent)
  const results: RawContentItem[] = []
  const chunk = 10

  for (let i = 0; i < Math.min(items.length, 50); i += chunk) {
    const batch = items.slice(i, i + chunk)
    const metas = await Promise.all(batch.map(item => getMetaDescription(item.url)))
    batch.forEach((item, idx) => {
      results.push({
        title: item.title,
        meta_description: metas[idx],
        url: item.url,
        domain,
        published_at: null,
      })
    })
  }

  return results
}
