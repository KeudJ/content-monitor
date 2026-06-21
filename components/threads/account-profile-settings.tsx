'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Settings, X, Loader2 } from 'lucide-react'
import type { ThreadsAccount } from '@/lib/types/threads'

interface Props {
  account: ThreadsAccount
  onUpdate: (updated: ThreadsAccount) => void
}

export default function AccountProfileSettings({ account, onUpdate }: Props) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [toneManner, setToneManner] = useState(account.tone_manner ?? '')
  const [concept, setConcept] = useState(account.concept ?? '')
  const [targetAudience, setTargetAudience] = useState(account.target_audience ?? '')

  async function save() {
    setSaving(true)
    await fetch('/api/threads/accounts', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: account.id,
        tone_manner: toneManner || null,
        concept: concept || null,
        target_audience: targetAudience || null,
      }),
    })
    onUpdate({ ...account, tone_manner: toneManner || null, concept: concept || null, target_audience: targetAudience || null })
    setSaving(false)
    setOpen(false)
  }

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)} title="계정 프로필 설정">
        <Settings className="h-4 w-4" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-background border rounded-xl shadow-xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">@{account.username} 프로필 설정</h2>
                <p className="text-xs text-muted-foreground mt-0.5">콘텐츠 생성 시 자동으로 반영됩니다</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-1">
              <Label className="text-sm">톤앤매너</Label>
              <Textarea
                value={toneManner}
                onChange={e => setToneManner(e.target.value)}
                placeholder="예: 전문적이고 간결한 / 친근하고 유머러스한 / 도발적이고 직설적인"
                className="h-20 text-sm resize-none"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-sm">컨셉</Label>
              <Textarea
                value={concept}
                onChange={e => setConcept(e.target.value)}
                placeholder="예: AI/기술 인사이트 공유 / 비즈니스 성장 노하우 / 일상 속 마케팅 인사이트"
                className="h-20 text-sm resize-none"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-sm">타겟 오디언스</Label>
              <Textarea
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
                placeholder="예: 20-30대 스타트업 창업자 / B2B 마케터 / 직장인 사이드 프로젝트 관심자"
                className="h-20 text-sm resize-none"
              />
            </div>

            <Button onClick={save} disabled={saving} className="w-full">
              {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
              저장
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
