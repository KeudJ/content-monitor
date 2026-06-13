'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { Post } from '@/lib/types/threads'

interface Props {
  posts: Post[]
}

function fmt(n: number) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`
  return String(n)
}

export default function KpiCards({ posts }: Props) {
  const totalImpressions = posts.reduce((s, p) => s + p.impressions, 0)
  const avgEngagement = posts.length
    ? posts.reduce((s, p) => s + p.engagement_rate, 0) / posts.length
    : 0
  const totalProfileClicks = posts.reduce((s, p) => s + p.profile_clicks, 0)
  const latestFollowers = posts[0]?.followers_count ?? 0

  const cards = [
    { label: '총 조회수', value: fmt(totalImpressions) },
    { label: '팔로워 수', value: fmt(latestFollowers) },
    { label: '프로필 클릭수', value: fmt(totalProfileClicks) },
    { label: '평균 참여율', value: `${(avgEngagement * 100).toFixed(2)}%` },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map(c => (
        <Card key={c.label}>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">{c.label}</p>
            <p className="text-2xl font-semibold mt-1">{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
