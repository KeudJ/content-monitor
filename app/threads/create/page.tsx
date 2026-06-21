'use client'

import { useEffect, useState } from 'react'
import ContentCreator from '@/components/threads/content-creator'
import ContentCalendar from '@/components/threads/content-calendar'
import AccountSelector from '@/components/threads/account-selector'

export default function CreatePage() {
  const [accountId, setAccountId] = useState<string | null>(null)
  const [initialContent, setInitialContent] = useState('')

  useEffect(() => {
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

      <div className="border rounded-lg p-6">
        <ContentCreator initialContent={initialContent} />
      </div>

      {accountId && (
        <div className="border rounded-lg p-6">
          <h2 className="text-sm font-medium mb-4">콘텐츠 캘린더</h2>
          <ContentCalendar accountId={accountId} />
        </div>
      )}
    </div>
  )
}
