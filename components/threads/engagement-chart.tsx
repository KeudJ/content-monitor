'use client'

import { useState, useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Button } from '@/components/ui/button'
import type { Post } from '@/lib/types/threads'

interface Props {
  posts: Post[]
}

const RANGES = [
  { label: '7일', days: 7 },
  { label: '30일', days: 30 },
  { label: '90일', days: 90 },
]

export default function EngagementChart({ posts }: Props) {
  const [days, setDays] = useState(30)

  const data = useMemo(() => {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const filtered = posts.filter(p => p.published_at && new Date(p.published_at) >= cutoff)

    const byDate: Record<string, { impressions: number; er: number; count: number }> = {}
    for (const p of filtered) {
      const date = p.published_at!.slice(0, 10)
      if (!byDate[date]) byDate[date] = { impressions: 0, er: 0, count: 0 }
      byDate[date].impressions += p.impressions
      byDate[date].er += p.engagement_rate
      byDate[date].count++
    }

    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        date,
        조회수: v.impressions,
        참여율: Number((v.er / v.count * 100).toFixed(2)),
      }))
  }, [posts, days])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium">시계열 성과</h2>
        <div className="flex gap-1">
          {RANGES.map(r => (
            <Button
              key={r.days}
              variant={days === r.days ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDays(r.days)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="left" tick={{ fontSize: 11 }} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} unit="%" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="조회수" stroke="hsl(221 83% 53%)" dot={false} />
          <Line yAxisId="right" type="monotone" dataKey="참여율" stroke="hsl(142 76% 36%)" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
