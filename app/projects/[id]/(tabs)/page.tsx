import { createAdminClient } from '@/lib/supabase/server'
import ContentTableWrapper from '@/components/content/content-table-wrapper'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params
  const db = createAdminClient()

  const { data: items } = await db
    .from('content_items')
    .select('*')
    .eq('project_id', id)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })

  return <ContentTableWrapper projectId={id} initialItems={items || []} />
}
