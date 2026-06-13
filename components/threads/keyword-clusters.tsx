'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface Cluster {
  topic: string
  keywords: string[]
  avg_engagement: number
  post_count: number
  insight: string
}

interface Props {
  clusters: Cluster[]
}

export default function KeywordClusters({ clusters }: Props) {
  if (!clusters.length) return <p className="text-sm text-muted-foreground">분석 데이터 없음</p>

  const chartData = clusters.map(c => ({
    topic: c.topic,
    참여율: Number((c.avg_engagement * 100).toFixed(2)),
    게시물수: c.post_count,
  }))

  return (
    <div className="space-y-6">
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis type="number" unit="%" tick={{ fontSize: 11 }} />
          <YAxis type="category" dataKey="topic" tick={{ fontSize: 11 }} width={80} />
          <Tooltip formatter={(v) => `${v}%`} />
          <Bar dataKey="참여율" fill="hsl(221 83% 53%)" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>

      <div className="grid gap-3">
        {clusters.map(c => (
          <div key={c.topic} className="border rounded-lg p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">{c.topic}</h3>
              <span className="text-xs text-green-600 font-medium">{(c.avg_engagement * 100).toFixed(2)}%</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {c.keywords.map(k => (
                <span key={k} className="text-xs bg-muted px-2 py-0.5 rounded-full">#{k}</span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{c.insight}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
