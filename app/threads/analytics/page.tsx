'use client'

import { useState } from 'react'
import AccountSelector from '@/components/threads/account-selector'
import HashtagTable from '@/components/threads/hashtag-table'
import KeywordClusters from '@/components/threads/keyword-clusters'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface AnalysisResult {
  hashtag_stats: { hashtag: string; total_posts: number; avg_engagement_rate: number }[]
  keyword_clusters: { topic: string; keywords: string[]; avg_engagement: number; post_count: number; insight: string }[]
  hashtag_analysis?: string
}

export default function AnalyticsPage() {
  const [accountId, setAccountId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)

  async function analyze() {
    if (!accountId) return
    setLoading(true)
    const res = await fetch('/api/threads/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId }),
    })
    const data = await res.json()
    setResult(data)
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <AccountSelector selectedId={accountId} onChange={setAccountId} />
        <Button size="sm" onClick={analyze} disabled={loading || !accountId}>
          {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
          {loading ? '분석 중...' : '분석 실행'}
        </Button>
      </div>

      {!accountId && (
        <div className="text-center py-20 text-muted-foreground text-sm">
          Threads 계정을 연동하고 선택해주세요.
        </div>
      )}

      {result && (
        <>
          <div className="border rounded-lg p-4">
            <h2 className="text-sm font-medium mb-4">해시태그 성과</h2>
            <HashtagTable data={result.hashtag_stats || []} />
          </div>

          <div className="border rounded-lg p-4">
            <h2 className="text-sm font-medium mb-4">키워드 클러스터 분석</h2>
            <KeywordClusters clusters={result.keyword_clusters || []} />
          </div>

          {result.hashtag_analysis && (
            <div className="border rounded-lg p-4">
              <h2 className="text-sm font-medium mb-2">AI 인사이트</h2>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{result.hashtag_analysis}</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
