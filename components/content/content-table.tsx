'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
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
    <div className="border rounded-md divide-y overflow-hidden">
      {/* 전체 선택 헤더 */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-muted/40">
        <Checkbox
          checked={allChecked}
          ref={el => { if (el) (el as any).indeterminate = someChecked }}
          onCheckedChange={onToggleAll}
        />
        <span className="text-xs text-muted-foreground">전체 선택</span>
      </div>

      {/* 아이템 리스트 */}
      {items.map(item => (
        <div
          key={item.id}
          className={`flex gap-3 px-4 py-4 transition-colors ${
            selectedIds.has(item.id) ? 'bg-muted/30' : 'hover:bg-muted/10'
          }`}
        >
          <div className="pt-0.5 flex-shrink-0">
            <Checkbox
              checked={selectedIds.has(item.id)}
              onCheckedChange={() => onToggle(item.id)}
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            {/* 날짜 + 도메인 */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {item.published_at && (
                <span>{format(new Date(item.published_at), 'M월 d일', { locale: ko })}</span>
              )}
              {item.domain && (
                <>
                  {item.published_at && <span>·</span>}
                  <span>{item.domain}</span>
                </>
              )}
              {item.is_new && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-4">new</Badge>
              )}
            </div>

            {/* 타이틀 */}
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-1"
            >
              <span className="font-semibold text-base leading-snug group-hover:underline">
                {item.title || item.url}
              </span>
              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0 mt-1 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </a>

            {/* 메타 디스크립션 */}
            {item.meta_description && (
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                {item.meta_description}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
