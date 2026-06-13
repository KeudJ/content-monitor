'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2, Send } from 'lucide-react'

interface Suggestion {
  original: string
  suggestions: string[]
}

interface Props {
  accountId: string
  onSendToCreate?: (content: string) => void
}

export default function RecycleSuggestions({ accountId, onSendToCreate }: Props) {
  const [items, setItems] = useState<Suggestion[]>([])
  const [loading, setLoading] = useState(false)

  async function load() {
    setLoading(true)
    const res = await fetch('/api/threads/recycle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId }),
    })
    const { suggestions } = await res.json()
    setItems(suggestions || [])
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">콘텐츠 재활용 제안</h2>
        <Button size="sm" onClick={load} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
          {loading ? '분석 중...' : '제안 받기'}
        </Button>
      </div>
      {items.map((item, i) => (
        <div key={i} className="border rounded-lg p-4 space-y-3">
          <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2 line-clamp-2">
            원본: {item.original}
          </div>
          <div className="grid gap-2">
            {item.suggestions.map((s, j) => (
              <Card key={j} className="bg-muted/10">
                <CardContent className="pt-3 pb-3">
                  <p className="text-sm whitespace-pre-wrap">{s}</p>
                  {onSendToCreate && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 text-xs"
                      onClick={() => onSendToCreate(s)}
                    >
                      <Send className="h-3 w-3 mr-1" />
                      콘텐츠 생성 페이지로 보내기
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
