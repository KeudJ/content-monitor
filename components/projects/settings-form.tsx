'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { X, Plus } from 'lucide-react'
import { toast } from 'sonner'
import type { Project, Source } from '@/lib/types'

interface Props {
  project: Project
  sources: Source[]
}

export default function SettingsForm({ project, sources: initialSources }: Props) {
  const [name, setName] = useState(project.name)
  const [sources, setSources] = useState(initialSources)
  const [newUrl, setNewUrl] = useState('')
  const [newType, setNewType] = useState<'rss' | 'blog'>('rss')
  const [saving, setSaving] = useState(false)
  const [adding, setAdding] = useState(false)
  const router = useRouter()

  async function saveName() {
    setSaving(true)
    const res = await fetch(`/api/projects/${project.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    setSaving(false)
    if (res.ok) {
      toast('Project name updated.')
      router.refresh()
    } else {
      toast.error('Failed to update name.')
    }
  }

  async function addSource() {
    if (!newUrl.trim()) return
    setAdding(true)
    const res = await fetch(`/api/projects/${project.id}/sources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: newUrl.trim(), type: newType }),
    })
    setAdding(false)
    if (res.ok) {
      const source = await res.json()
      setSources(s => [...s, source])
      setNewUrl('')
      toast('Source added.')
    } else {
      const { error } = await res.json()
      toast.error(error || 'Failed to add source.')
    }
  }

  async function removeSource(sourceId: string) {
    const res = await fetch(`/api/projects/${project.id}/sources`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId }),
    })
    if (res.ok) {
      setSources(s => s.filter(x => x.id !== sourceId))
      toast('Source removed.')
    } else {
      toast.error('Failed to remove source.')
    }
  }

  const rssSources = sources.filter(s => s.type === 'rss')
  const blogSources = sources.filter(s => s.type === 'blog')

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Project Name</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input value={name} onChange={e => setName(e.target.value)} className="flex-1" />
            <Button onClick={saveName} disabled={saving || name === project.name}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Sources</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <select
              value={newType}
              onChange={e => setNewType(e.target.value as 'rss' | 'blog')}
              className="border rounded-md px-3 py-2 text-sm bg-background"
            >
              <option value="rss">RSS</option>
              <option value="blog">Blog</option>
            </select>
            <Input
              value={newUrl}
              onChange={e => setNewUrl(e.target.value)}
              placeholder="https://example.com/feed.xml"
              className="flex-1"
              onKeyDown={e => e.key === 'Enter' && addSource()}
            />
            <Button onClick={addSource} disabled={adding || !newUrl.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {sources.length > 0 && <Separator />}

          {rssSources.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">RSS Feeds</p>
              <ul className="space-y-2">
                {rssSources.map(s => (
                  <li key={s.id} className="flex items-center gap-2">
                    <span className="flex-1 text-sm font-mono truncate">{s.url}</span>
                    <Button size="sm" variant="ghost" onClick={() => removeSource(s.id)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {blogSources.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Blog URLs</p>
              <ul className="space-y-2">
                {blogSources.map(s => (
                  <li key={s.id} className="flex items-center gap-2">
                    <span className="flex-1 text-sm font-mono truncate">{s.url}</span>
                    <Button size="sm" variant="ghost" onClick={() => removeSource(s.id)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {sources.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">No sources added yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
