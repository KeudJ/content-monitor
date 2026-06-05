import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'
import SettingsForm from '@/components/projects/settings-form'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SettingsPage({ params }: Props) {
  const { id } = await params

  const [{ data: project }, { data: sources }] = await Promise.all([
    supabase.from('projects').select('*').eq('id', id).single(),
    supabase.from('sources').select('*').eq('project_id', id).order('created_at'),
  ])

  if (!project) notFound()

  return (
    <div>
      <div className="mb-6">
        <nav className="text-sm text-muted-foreground mb-1">
          <Link href="/" className="hover:text-foreground">Projects</Link>
          <span className="mx-1">/</span>
          <Link href={`/projects/${id}`} className="hover:text-foreground">{project.name}</Link>
          <span className="mx-1">/</span>
          <span>Settings</span>
        </nav>
        <h1 className="text-xl font-semibold">Settings</h1>
      </div>
      <SettingsForm project={project} sources={sources || []} />
    </div>
  )
}
