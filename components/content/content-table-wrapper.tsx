'use client'

import { useState } from 'react'
import ContentTable from './content-table'
import ContentFilters from './content-filters'
import { Button } from '@/components/ui/button'
import { RefreshCw, Download } from 'lucide-react'
import { toast } from 'sonner'
import type { ContentItem } from '@/lib/types'
import { format } from 'date-fns'

interface Props {
  projectId: string
  initialItems: ContentItem[]
}

export default function ContentTableWrapper({ projectId, initialItems }: Props) {
  const [items, setItems] = useState<ContentItem[]>(initialItems)
  const [syncing, setSyncing] = useState(false)
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d'>('all')
  const [showNewOnly, setShowNewOnly] = useState(false)

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/sync`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast(`Synced: ${data.added} new items added.`)
      // Refresh items
      const refreshRes = await fetch(`/api/projects/${projectId}/content`)
      if (refreshRes.ok) {
        const fresh = await refreshRes.json()
        setItems(fresh)
      } else {
        window.location.reload()
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Sync failed.')
    } finally {
      setSyncing(false)
    }
  }

  function exportCsv() {
    const filtered = getFilteredItems()
    const headers = ['Date', 'Source', 'Title', 'Meta Description', 'URL']
    const rows = filtered.map(item => [
      item.published_at ? format(new Date(item.published_at), 'yyyy-MM-dd') : '',
      item.domain || '',
      item.title || '',
      (item.meta_description || '').replace(/"/g, '""'),
      item.url,
    ])
    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `content-export-${format(new Date(), 'yyyy-MM-dd')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function getFilteredItems(): ContentItem[] {
    let result = items

    if (showNewOnly) result = result.filter(i => i.is_new)

    if (dateRange !== 'all') {
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() - (dateRange === '7d' ? 7 : 30))
      result = result.filter(i => {
        const date = i.published_at || i.created_at
        return date && new Date(date) >= cutoff
      })
    }

    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        i =>
          i.title?.toLowerCase().includes(q) ||
          i.meta_description?.toLowerCase().includes(q) ||
          i.url.toLowerCase().includes(q) ||
          i.domain?.toLowerCase().includes(q)
      )
    }

    return result
  }

  const filteredItems = getFilteredItems()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <ContentFilters
          search={search}
          onSearchChange={setSearch}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          showNewOnly={showNewOnly}
          onShowNewOnlyChange={setShowNewOnly}
        />
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCsv} disabled={filteredItems.length === 0}>
            <Download className="h-4 w-4 mr-1.5" />
            CSV
          </Button>
          <Button size="sm" onClick={handleSync} disabled={syncing}>
            <RefreshCw className={`h-4 w-4 mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? 'Syncing...' : 'Sync Now'}
          </Button>
        </div>
      </div>
      <ContentTable items={filteredItems} />
      <p className="text-xs text-muted-foreground">
        {filteredItems.length} of {items.length} items
      </p>
    </div>
  )
}
