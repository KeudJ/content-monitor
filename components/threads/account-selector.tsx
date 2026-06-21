'use client'

import { useEffect, useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { RefreshCw, PlusCircle, Trash2 } from 'lucide-react'
import type { ThreadsAccount } from '@/lib/types/threads'

interface Props {
  selectedId: string | null
  onChange: (id: string | null) => void
  onSync?: () => void
  syncing?: boolean
}

export default function AccountSelector({ selectedId, onChange, onSync, syncing }: Props) {
  const [accounts, setAccounts] = useState<ThreadsAccount[]>([])

  useEffect(() => {
    fetch('/api/threads/accounts')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setAccounts(data)
      })
  }, [])

  async function remove(id: string) {
    await fetch('/api/threads/accounts', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setAccounts(prev => prev.filter(a => a.id !== id))
    if (selectedId === id) onChange(null)
  }

  if (!accounts.length) {
    return (
      <a href="/api/threads/auth/connect">
        <Button variant="outline" size="sm">
          <PlusCircle className="h-4 w-4 mr-1.5" />
          Threads 계정 연동
        </Button>
      </a>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedId ?? ''} onValueChange={onChange}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="계정 선택" />
        </SelectTrigger>
        <SelectContent>
          {accounts.map(a => (
            <SelectItem key={a.id} value={a.id}>@{a.username}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {onSync && (
        <Button variant="outline" size="sm" onClick={onSync} disabled={syncing || !selectedId}>
          <RefreshCw className={`h-4 w-4 mr-1.5 ${syncing ? 'animate-spin' : ''}`} />
          동기화
        </Button>
      )}
      {selectedId && (
        <Button variant="ghost" size="sm" onClick={() => remove(selectedId)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      )}
      <a href="/api/threads/auth/connect">
        <Button variant="ghost" size="sm">
          <PlusCircle className="h-4 w-4" />
        </Button>
      </a>
    </div>
  )
}
