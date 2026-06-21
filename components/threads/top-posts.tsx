'use client'

import { useState, useEffect, useRef } from 'react'
import type { Post } from '@/lib/types/threads'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type SortKey = 'views' | 'engagement'
type SortDir = 'desc' | 'asc'

interface Props {
  posts: Post[]
}

export default function TopPosts({ posts }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('views')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [visible, setVisible] = useState(20)
  const sentinelRef = useRef<HTMLDivElement>(null)

  const sorted = [...posts].sort((a, b) => {
    const va = sortKey === 'views' ? a.impressions : (a.comments + a.reposts)
    const vb = sortKey === 'views' ? b.impressions : (b.comments + b.reposts)
    return sortDir === 'desc' ? vb - va : va - vb
  })

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setVisible(v => v + 20)
    }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  if (!posts.length) return <p className="text-sm text-muted-foreground">게시물 없음</p>

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Select value={sortKey} onValueChange={v => setSortKey(v as SortKey)}>
          <SelectTrigger className="w-36 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="views">조회수</SelectItem>
            <SelectItem value="engagement">인게이지먼트</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sortDir} onValueChange={v => setSortDir(v as SortDir)}>
          <SelectTrigger className="w-28 h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="desc">높은순</SelectItem>
            <SelectItem value="asc">낮은순</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sorted.slice(0, visible).map((p, i) => (
        <div key={p.id} className="flex gap-3 p-3 border rounded-lg">
          <span className="text-muted-foreground text-sm font-medium w-5 shrink-0">#{i + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm line-clamp-2">{p.post_text || '(미디어 게시물)'}</p>
            <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
              <span>조회수 {p.impressions.toLocaleString()}</span>
              <span>좋아요 {p.likes}</span>
              <span>댓글 {p.comments}</span>
              <span>공유 {p.reposts}</span>
              <span className="text-green-600 font-medium">참여율 {(p.engagement_rate * 100).toFixed(2)}%</span>
            </div>
          </div>
        </div>
      ))}
      <div ref={sentinelRef} className="h-1" />
    </div>
  )
}
