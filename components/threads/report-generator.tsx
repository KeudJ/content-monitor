'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import ReactMarkdown from 'react-markdown'
import { Download, Loader2 } from 'lucide-react'

interface Props {
  accountId: string
}

export default function ReportGenerator({ accountId }: Props) {
  const [report, setReport] = useState('')
  const [loading, setLoading] = useState(false)

  async function generate() {
    setLoading(true)
    const res = await fetch('/api/threads/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId }),
    })
    const { report } = await res.json()
    setReport(report || '')
    setLoading(false)
  }

  function download() {
    const blob = new Blob([report], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `threads-report-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">분석 리포트 생성</h2>
        <div className="flex gap-2">
          {report && (
            <Button variant="outline" size="sm" onClick={download}>
              <Download className="h-4 w-4 mr-1.5" />
              다운로드
            </Button>
          )}
          <Button size="sm" onClick={generate} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
            {loading ? '생성 중...' : '리포트 생성'}
          </Button>
        </div>
      </div>
      {report && (
        <div className="prose prose-sm max-w-none border rounded-lg p-4 bg-muted/10">
          <ReactMarkdown>{report}</ReactMarkdown>
        </div>
      )}
    </div>
  )
}
