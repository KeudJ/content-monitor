'use client'

import { useState } from 'react'
import ContentTable from './content-table'
import ContentFilters from './content-filters'
import { Button } from '@/components/ui/button'
import { RefreshCw, Download, Trash2 } from 'lucide-react'
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
  const [deleting, setDeleting] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [search, setSearch] = useState('')
  const [dateRange, setDateRange] = useState<'all' | '7d' | '30d'>('all')
  const [showNewOnly, setShowNewOnly] = useState(false)

  function handleToggle(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleToggleAll(checked: boolean) {
    setSelectedIds(checked ? new Set(filteredItems.map(i => i.id)) : new Set())
  }

  async function handleDelete() {
    if (selectedIds.size === 0) return
    if (!confirm(`선택한 ${selectedIds.size}개 항목을 삭제할까요?`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/content`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      })
      if (!res.ok) throw new Error('삭제 실패')
      setItems(prev => prev.filter(i => !selectedIds.has(i.id)))
      setSelectedIds(new Set())
      toast(`${selectedIds.size}개 항목이 삭제되었습니다.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : '삭제 실패')
    } finally {
      setDeleting(false)
    }
  }

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/sync`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast(`Synced: ${data.added} new items added.`)
      const refreshRes = await fetch(`/api/projects/${projectId}/content`)
      if (refreshRes.ok) {
        const fresh = await refreshRes.json()
        setItems(fresh)
        setSelectedIds(new Set())
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
          {selectedIds.size > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
            >
              <Trash2 className="h-4 w-4 mr-1.5" />
              {deleting ? '삭제 중...' : `Delete (${selectedIds.size})`}
            </Button>
          )}
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
      <ContentTable
        items={filteredItems}
        selectedIds={selectedIds}
        onToggle={handleToggle}
        onToggleAll={handleToggleAll}
      />
      <p className="text-xs text-muted-foreground">
        {filteredItems.length} of {items.length} items
        {selectedIds.size > 0 && ` · ${selectedIds.size}개 선택됨`}
      </p>
    </div>
  )
}
