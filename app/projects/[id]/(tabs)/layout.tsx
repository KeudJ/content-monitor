import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import ProjectTabs from '@/components/projects/project-tabs'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
  children: React.ReactNode
}

export default async function ProjectLayout({ params, children }: Props) {
  const { id } = await params
  const db = createAdminClient()

  const { data: project } = await db
    .from('projects')
    .select('id, name')
    .eq('id', id)
    .single()

  if (!project) notFound()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <nav className="text-sm text-muted-foreground mb-1">
            <Link href="/" className="hover:text-foreground">Projects</Link>
            <span className="mx-1">/</span>
            <span>{project.name}</span>
          </nav>
          <h1 className="text-xl font-semibold">{project.name}</h1>
        </div>
        <Link
          href={`/projects/${id}/settings`}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
        >
          <Settings className="h-4 w-4 mr-1.5" />
          Settings
        </Link>
      </div>
      <ProjectTabs projectId={id} />
      {children}
    </div>
  )
}
