create table if not exists projects (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  created_at timestamptz default now()
);

create table if not exists sources (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  url text not null,
  type text not null check (type in ('rss', 'blog')),
  created_at timestamptz default now(),
  unique(project_id, url)
);

create table if not exists content_items (
  id uuid default gen_random_uuid() primary key,
  project_id uuid references projects(id) on delete cascade not null,
  source_id uuid references sources(id) on delete set null,
  title text,
  meta_description text,
  url text not null,
  domain text,
  published_at timestamptz,
  is_new boolean default true,
  created_at timestamptz default now(),
  unique(url)
);

create index if not exists content_items_project_id_idx on content_items(project_id);
create index if not exists content_items_published_at_idx on content_items(published_at desc);
create index if not exists content_items_is_new_idx on content_items(is_new);
