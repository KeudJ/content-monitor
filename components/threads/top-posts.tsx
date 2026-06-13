'use client'

import type { Post } from '@/lib/types/threads'

interface Props {
  posts: Post[]
}

export default function TopPosts({ posts }: Props) {
  const top = [...posts]
    .sort((a, b) => b.engagement_rate - a.engagement_rate)
    .slice(0, 5)

  if (!top.length) return <p className="text-sm text-muted-foreground">게시물 없음</p>

  return (
    <div className="space-y-3">
      {top.map((p, i) => (
        <div key={p.id} className="flex gap-3 p-3 border rounded-lg">
          <span className="text-muted-foreground text-sm font-medium w-5 shrink-0">#{i + 1}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm line-clamp-2">{p.content || '(미디어 게시물)'}</p>
            <div className="flex gap-3 mt-1.5 text-xs text-muted-foreground">
              <span>조회수 {p.impressions.toLocaleString()}</span>
              <span>좋아요 {p.likes}</span>
              <span>댓글 {p.comments}</span>
              <span className="text-green-600 font-medium">참여율 {(p.engagement_rate * 100).toFixed(2)}%</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
