import { supabase } from '@/lib/supabase/client'
import ProjectList from '@/components/projects/project-list'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const { data: projects } = await supabase
    .from('projects')
    .select(`
      *,
      sources(count),
      content_items(count)
    `)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">Projects</h1>
      </div>
      <ProjectList initialProjects={projects || []} />
    </div>
  )
}
