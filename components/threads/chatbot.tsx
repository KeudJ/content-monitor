'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Send } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface Props {
  accountId: string
}

export default function Chatbot({ accountId }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send() {
    const text = input.trim()
    if (!text || loading) return
    const next: Message[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)

    const res = await fetch('/api/threads/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, messages: next }),
    })
    const { content } = await res.json()
    setMessages(m => [...m, { role: 'assistant', content }])
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-80 border rounded-lg overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-muted/20">
        {messages.length === 0 && (
          <p className="text-xs text-muted-foreground text-center mt-8">
            데이터 분석, 콘텐츠 전략 등 무엇이든 물어보세요.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] text-sm rounded-lg px-3 py-2 whitespace-pre-wrap ${
              m.role === 'user'
                ? 'bg-foreground text-background'
                : 'bg-background border'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-background border text-sm rounded-lg px-3 py-2 text-muted-foreground">입력 중...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="border-t p-2 flex gap-2">
        <Textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="질문을 입력하세요..."
          className="resize-none min-h-0 h-9 py-1.5 text-sm"
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
        />
        <Button size="sm" onClick={send} disabled={loading || !input.trim()}>
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
