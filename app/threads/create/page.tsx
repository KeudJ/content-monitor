'use client'

import { useEffect, useState } from 'react'
import ContentCreator from '@/components/threads/content-creator'
import ContentCalendar from '@/components/threads/content-calendar'
import AccountSelector from '@/components/threads/account-selector'
import { toast } from 'sonner'
import type { ThreadsAccount } from '@/lib/types/threads'

export default function CreatePage() {
  const [accounts, setAccounts] = useState<ThreadsAccount[]>([])
  const [accountId, setAccountId] = useState<string | null>(null)
  const [initialContent, setInitialContent] = useState('')

  useEffect(() => {
    fetch('/api/threads/accounts')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAccounts(data)
          if (data[0]) setAccountId(data[0].id)
        }
      })

    const draft = sessionStorage.getItem('threads_draft')
    if (draft) {
      setInitialContent(draft)
      sessionStorage.removeItem('threads_draft')
    }
  }, [])

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <AccountSelector selectedId={accountId} onChange={setAccountId} />
      </div>

      {accountId ? (
        <>
          <div className="border rounded-lg p-6">
            <ContentCreator
              accounts={accounts}
              initialContent={initialContent}
              onPublished={() => toast.success('게시물이 발행되었습니다.')}
            />
          </div>

          <div className="border rounded-lg p-6">
            <h2 className="text-sm font-medium mb-4">콘텐츠 캘린더</h2>
            <ContentCalendar accountId={accountId} />
          </div>
        </>
      ) : (
        <div className="text-center py-20 text-muted-foreground text-sm">
          Threads 계정을 연동하고 선택해주세요.
        </div>
      )}
    </div>
  )
}
