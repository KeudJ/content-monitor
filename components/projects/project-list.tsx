'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, FolderOpen, Trash2 } from 'lucide-react'
import CreateProjectDialog from './create-project-dialog'
import { toast } from 'sonner'

interface ProjectWithCounts {
  id: string
  name: string
  created_at: string
  sources: [{ count: number }] | []
  content_items: [{ count: number }] | []
}

export default function ProjectList({ initialProjects }: { initialProjects: ProjectWithCounts[] }) {
  const [projects, setProjects] = useState(initialProjects)
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete project "${name}"? This will remove all its content.`)) return
    const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setProjects(p => p.filter(x => x.id !== id))
      toast('Project deleted.')
    } else {
      toast.error('Failed to delete project.')
    }
  }

  function handleCreated(project: ProjectWithCounts) {
    setProjects(p => [{ ...project, sources: [], content_items: [] }, ...p])
    router.push(`/projects/${project.id}/settings`)
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          className="border-dashed cursor-pointer hover:border-foreground/40 transition-colors"
          onClick={() => setDialogOpen(true)}
        >
          <CardContent className="flex flex-col items-center justify-center h-32 gap-2 text-muted-foreground">
            <Plus className="h-6 w-6" />
            <span className="text-sm">New Project</span>
          </CardContent>
        </Card>

        {projects.map(project => (
          <Card key={project.id} className="group relative">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                {project.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {(project.sources as any)?.[0]?.count ?? 0} source(s) &middot;{' '}
                {(project.content_items as any)?.[0]?.count ?? 0} items
              </p>
              <div className="flex gap-2 mt-4">
                <Button
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push(`/projects/${project.id}`)}
                >
                  Open
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(project.id, project.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateProjectDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={handleCreated}
      />
    </>
  )
}
