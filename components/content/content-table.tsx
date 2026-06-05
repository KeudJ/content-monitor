'use client'

import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import type { ContentItem } from '@/lib/types'

interface Props {
  items: ContentItem[]
  selectedIds: Set<string>
  onToggle: (id: string) => void
  onToggleAll: (checked: boolean) => void
}

export default function ContentTable({ items, selectedIds, onToggle, onToggleAll }: Props) {
  if (items.length === 0) {
    return (
      <div className="border rounded-md p-12 text-center text-sm text-muted-foreground">
        No content found. Add sources and click &quot;Sync Now&quot; to get started.
      </div>
    )
  }

  const allChecked = items.length > 0 && items.every(i => selectedIds.has(i.id))
  const someChecked = items.some(i => selectedIds.has(i.id)) && !allChecked

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allChecked}
                ref={el => { if (el) (el as any).indeterminate = someChecked }}
                onCheckedChange={onToggleAll}
              />
            </TableHead>
            <TableHead className="w-28">Date</TableHead>
            <TableHead className="w-36">Source</TableHead>
            <TableHead>Title</TableHead>
            <TableHead className="hidden lg:table-cell">Meta Description</TableHead>
            <TableHead className="w-40">URL</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map(item => (
            <TableRow
              key={item.id}
              data-state={selectedIds.has(item.id) ? 'selected' : undefined}
            >
              <TableCell>
                <Checkbox
                  checked={selectedIds.has(item.id)}
                  onCheckedChange={() => onToggle(item.id)}
                />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                {item.published_at
                  ? format(new Date(item.published_at), 'MMM d, yyyy')
                  : <span className="text-xs">—</span>}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {item.is_new && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0">new</Badge>
                  )}
                  <span className="text-sm truncate max-w-[120px]" title={item.domain || ''}>
                    {item.domain || '—'}
                  </span>
                </div>
              </TableCell>
              <TableCell className="max-w-xs">
                <span className="text-sm line-clamp-2">{item.title || '—'}</span>
              </TableCell>
              <TableCell className="hidden lg:table-cell max-w-sm">
                <span className="text-sm text-muted-foreground line-clamp-2">
                  {item.meta_description || '—'}
                </span>
              </TableCell>
              <TableCell>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 hover:underline"
                  title={item.url}
                >
                  <span className="truncate max-w-[120px]">
                    {item.url.replace(/^https?:\/\//, '').slice(0, 40)}
                  </span>
                  <ExternalLink className="h-3 w-3 flex-shrink-0" />
                </a>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
