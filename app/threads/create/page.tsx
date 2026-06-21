'use client'

import { useEffect, useState } from 'react'
import ContentCreator from '@/components/threads/content-creator'
import ContentCalendar from '@/components/threads/content-calendar'
import AccountSelector from '@/components/threads/account-selector'
import AccountProfileSettings from '@/components/threads/account-profile-settings'
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

  const selectedAccount = accounts.find(a => a.id === accountId) ?? null

  function handleAccountUpdate(updated: ThreadsAccount) {
    setAccounts(prev => prev.map(a => a.id === updated.id ? updated : a))
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-2">
        <AccountSelector selectedId={accountId} onChange={setAccountId} />
        {selectedAccount && (
          <AccountProfileSettings account={selectedAccount} onUpdate={handleAccountUpdate} />
        )}
      </div>

      {selectedAccount?.tone_manner || selectedAccount?.concept || selectedAccount?.target_audience ? (
        <div className="bg-muted/30 rounded-lg px-4 py-3 text-xs text-muted-foreground space-y-0.5">
          {selectedAccount.tone_manner && <p><span className="font-medium text-foreground">톤앤매너</span> {selectedAccount.tone_manner}</p>}
          {selectedAccount.concept && <p><span className="font-medium text-foreground">컨셉</span> {selectedAccount.concept}</p>}
          {selectedAccount.target_audience && <p><span className="font-medium text-foreground">타겟</span> {selectedAccount.target_audience}</p>}
        </div>
      ) : null}

      <div className="border rounded-lg p-6">
        <ContentCreator
          initialContent={initialContent}
          accountProfile={selectedAccount}
        />
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
