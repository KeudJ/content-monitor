import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import ContentTableWrapper from '@/components/content/content-table-wrapper'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params

  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) notFound()

  const { data: items } = await supabase
    .from('content_items')
    .select('*')
    .eq('project_id', id)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

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
      <ContentTableWrapper projectId={id} initialItems={items || []} />
    </div>
  )
}
