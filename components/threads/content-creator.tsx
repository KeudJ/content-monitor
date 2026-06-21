'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Upload } from 'lucide-react'
import type { ThreadsAccount } from '@/lib/types/threads'

interface Props {
  initialContent?: string
  accountProfile?: Pick<ThreadsAccount, 'tone_manner' | 'concept' | 'target_audience'> | null
}

const TABS = ['자료 업로드', 'URL 기반', 'AI 자유 생성'] as const
type Tab = typeof TABS[number]

export default function ContentCreator({ initialContent = '', accountProfile }: Props) {
  const [tab, setTab] = useState<Tab>('AI 자유 생성')
  const [generating, setGenerating] = useState(false)
  const [versions, setVersions] = useState<string[]>([])
  const [selected, setSelected] = useState(initialContent)
  const [instructions, setInstructions] = useState('')

  // Tab states
  const [fileText, setFileText] = useState('')
  const [url, setUrl] = useState('')
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('professional')
  const fileRef = useRef<HTMLInputElement>(null)

  async function readFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const text = await file.text()
    setFileText(text.slice(0, 3000))
  }

  async function generate() {
    setGenerating(true)
    const base = { instructions: instructions || undefined, accountProfile: accountProfile || undefined }
    const body =
      tab === '자료 업로드' ? { mode: 'text', text: fileText, ...base }
      : tab === 'URL 기반' ? { mode: 'url', url, ...base }
      : { mode: 'free', topic, tone, ...base }

    const res = await fetch('/api/threads/create-content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const { versions: v } = await res.json()
    setVersions(v || [])
    if (v?.[0]) setSelected(v[0])
    setGenerating(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-1 border-b">
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3 py-2 text-sm border-b-2 -mb-px transition-colors ${
              tab === t ? 'border-foreground font-medium' : 'border-transparent text-muted-foreground'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === '자료 업로드' && (
        <div className="space-y-3">
          <input ref={fileRef} type="file" accept=".txt,.md,.pdf" className="hidden" onChange={readFile} />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4 mr-1.5" />
            파일 선택
          </Button>
          {fileText && (
            <Textarea value={fileText} onChange={e => setFileText(e.target.value)}
              className="h-40 text-sm resize-none" placeholder="파일 내용" />
          )}
        </div>
      )}

      {tab === 'URL 기반' && (
        <div className="space-y-2">
          <Label className="text-sm">URL</Label>
          <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
        </div>
      )}

      {tab === 'AI 자유 생성' && (
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-sm">주제 / 키워드</Label>
            <Input value={topic} onChange={e => setTopic(e.target.value)} placeholder="예: AI 생산성 도구" />
          </div>
          <div className="space-y-1">
            <Label className="text-sm">톤</Label>
            <Select value={tone} onValueChange={v => { if (v) setTone(v) }}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">전문적</SelectItem>
                <SelectItem value="friendly">친근한</SelectItem>
                <SelectItem value="provocative">도발적</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      <div className="space-y-1">
        <Label className="text-sm">생성 방향 지시 <span className="text-muted-foreground font-normal">(선택)</span></Label>
        <Textarea
          value={instructions}
          onChange={e => setInstructions(e.target.value)}
          placeholder="예: 질문형 문장으로 시작해줘 / 숫자 리스트 형태로 / 최신 AI 트렌드를 언급해줘"
          className="h-20 text-sm resize-none"
        />
      </div>

      <Button onClick={generate} disabled={generating} className="w-full">
        {generating ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
        {generating ? '생성 중...' : '게시물 생성'}
      </Button>

      {versions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">버전 선택</p>
          {versions.map((v, i) => (
            <button
              key={i}
              onClick={() => setSelected(v)}
              className={`w-full text-left text-sm p-3 border rounded-lg transition-colors ${
                selected === v ? 'border-foreground bg-muted/30' : 'hover:bg-muted/10'
              }`}
            >
              <span className="font-medium text-xs text-muted-foreground">버전 {i + 1}</span>
              <p className="mt-1 line-clamp-3">{v}</p>
            </button>
          ))}
        </div>
      )}

      <div className="space-y-1">
        <Label className="text-sm">편집</Label>
        <Textarea
          value={selected}
          onChange={e => setSelected(e.target.value)}
          placeholder="생성된 게시물이 여기에 표시됩니다..."
          className="h-48 text-sm resize-none"
        />
        <p className="text-xs text-right text-muted-foreground">{selected.length}/500</p>
      </div>
    </div>
  )
}
