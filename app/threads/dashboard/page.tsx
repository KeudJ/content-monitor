'use client'

import { Suspense, useState, useEffect, useCallback } from 'react'
import AccountSelector from '@/components/threads/account-selector'
import KpiCards from '@/components/threads/kpi-cards'
import EngagementChart from '@/components/threads/engagement-chart'
import TopPosts from '@/components/threads/top-posts'
import Chatbot from '@/components/threads/chatbot'
import ReportGenerator from '@/components/threads/report-generator'
import RecycleSuggestions from '@/components/threads/recycle-suggestions'
import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import type { Post } from '@/lib/types/threads'

function OAuthNotice() {
  const params = useSearchParams()
  const router = useRouter()

  useEffect(() => {
    if (params.get('connected') === '1') {
      toast.success('Threads 계정이 연동되었습니다.')
      router.replace('/threads/dashboard')
    }
    if (params.get('error')) {
      toast.error('계정 연동에 실패했습니다.')
      router.replace('/threads/dashboard')
    }
  }, [params, router])

  return null
}

function Dashboard() {
  const [accountId, setAccountId] = useState<string | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [syncing, setSyncing] = useState(false)
  const router = useRouter()

  const loadPosts = useCallback(async (id: string) => {
    const res = await fetch(`/api/threads/posts?accountId=${id}&days=90`)
    const data = await res.json()
    if (Array.isArray(data)) setPosts(data)
  }, [])

  useEffect(() => {
    if (accountId) loadPosts(accountId)
  }, [accountId, loadPosts])

  async function sync() {
    if (!accountId) return
    setSyncing(true)
    await fetch('/api/threads/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId }),
    })
    await loadPosts(accountId)
    setSyncing(false)
    toast.success('동기화 완료')
  }

  return (
    <div className="space-y-8">
      <AccountSelector
        selectedId={accountId}
        onChange={setAccountId}
        onSync={sync}
        syncing={syncing}
      />

      {!accountId ? (
        <div className="text-center py-20 text-muted-foreground text-sm">
          Threads 계정을 연동하고 선택해주세요.
        </div>
      ) : (
        <>
          <KpiCards posts={posts} />

          <div className="border rounded-lg p-4">
            <EngagementChart posts={posts} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-4">
              <h2 className="text-sm font-medium mb-3">최고 성과 게시물</h2>
              <TopPosts posts={posts} />
            </div>
            <div className="border rounded-lg p-4">
              <h2 className="text-sm font-medium mb-3">AI 어시스턴트</h2>
              <Chatbot accountId={accountId} />
            </div>
          </div>

          <div className="border rounded-lg p-4">
            <ReportGenerator accountId={accountId} />
          </div>

          <div className="border rounded-lg p-4">
            <RecycleSuggestions
              accountId={accountId}
              onSendToCreate={content => {
                sessionStorage.setItem('threads_draft', content)
                router.push('/threads/create')
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}

export default function DashboardPage() {
  return (
    <>
      <Suspense fallback={null}>
        <OAuthNotice />
      </Suspense>
      <Dashboard />
    </>
  )
}
