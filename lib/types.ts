export interface Project {
  id: string
  name: string
  created_at: string
}

export interface Source {
  id: string
  project_id: string
  url: string
  type: 'rss' | 'blog'
  created_at: string
}

export interface ContentItem {
  id: string
  project_id: string
  source_id: string | null
  title: string | null
  meta_description: string | null
  url: string
  domain: string | null
  published_at: string | null
  is_new: boolean
  created_at: string
}

export interface RawContentItem {
  title: string | null
  meta_description: string | null
  url: string
  domain: string | null
  published_at: string | null
}
