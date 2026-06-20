'use client'

import { useEffect, useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns'
import { ko } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import type { ScheduledPost } from '@/lib/types/threads'

interface Props {
  accountId: string
}

export default function ContentCalendar({ accountId }: Props) {
  const [current, setCurrent] = useState(new Date())
  const [posts, setPosts] = useState<ScheduledPost[]>([])
  const [selected, setSelected] = useState<ScheduledPost | null>(null)

  async function load() {
    const res = await fetch(`/api/threads/schedule?accountId=${accountId}`)
    const data = await res.json()
    if (Array.isArray(data)) setPosts(data)
  }

  useEffect(() => { if (accountId) load() }, [accountId])

  async function remove(id: string) {
    await fetch('/api/threads/schedule', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    setPosts(p => p.filter(x => x.id !== id))
    setSelected(null)
  }

  const days = eachDayOfInterval({ start: startOfMonth(current), end: endOfMonth(current) })
  const startPad = getDay(startOfMonth(current))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">{format(current, 'yyyy년 M월', { locale: ko })}</h2>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() - 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() + 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs text-center text-muted-foreground">
        {['일','월','화','수','목','금','토'].map(d => <div key={d}>{d}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {Array(startPad).fill(null).map((_, i) => <div key={`pad-${i}`} />)}
        {days.map(day => {
          const dayPosts = posts.filter(p => isSameDay(new Date(p.scheduled_at), day))
          return (
            <div key={day.toISOString()} className="min-h-[60px] border rounded p-1">
              <p className="text-xs text-muted-foreground mb-1">{day.getDate()}</p>
              {dayPosts.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p)}
                  className={`w-full text-left text-xs rounded px-1 py-0.5 truncate mb-0.5 ${
                    p.status === 'published' ? 'bg-green-100 text-green-700'
                    : p.status === 'failed' ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {p.post_text.slice(0, 12)}...
                </button>
              ))}
            </div>
          )
        })}
      </div>

      {selected && (
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">{format(new Date(selected.scheduled_at), 'MM/dd HH:mm')}</p>
            <div className="flex gap-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                selected.status === 'published' ? 'bg-green-100 text-green-700'
                : selected.status === 'failed' ? 'bg-red-100 text-red-700'
                : 'bg-blue-100 text-blue-700'
              }`}>{selected.status}</span>
              <Button variant="ghost" size="sm" onClick={() => remove(selected.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
          <p className="text-sm whitespace-pre-wrap">{selected.post_text}</p>
        </div>
      )}
    </div>
  )
}
