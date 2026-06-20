-- Threads accounts
create table if not exists threads_accounts (
  id uuid primary key default gen_random_uuid(),
  threads_user_id text not null,
  username text not null,
  access_token text not null,
  token_expires_at timestamptz,
  profile_picture_url text,
  created_at timestamptz default now()
);

-- Posts synced from Threads API
create table if not exists posts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references threads_accounts(id) on delete cascade,
  threads_post_id text unique not null,
  post_text text,
  media_url text,
  published_at timestamptz,
  impressions int default 0,
  likes int default 0,
  comments int default 0,
  reposts int default 0,
  quotes int default 0,
  followers_count int default 0,
  profile_clicks int default 0,
  engagement_rate float default 0,
  synced_at timestamptz default now()
);

-- Scheduled posts
create table if not exists scheduled_posts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references threads_accounts(id) on delete cascade,
  post_text text not null,
  media_url text,
  scheduled_at timestamptz not null,
  status text default 'pending' check (status in ('pending', 'published', 'failed')),
  created_at timestamptz default now()
);

-- Hashtag stats (pre-aggregated)
create table if not exists hashtag_stats (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references threads_accounts(id) on delete cascade,
  hashtag text not null,
  avg_engagement_rate float default 0,
  total_posts int default 0,
  updated_at timestamptz default now(),
  unique(account_id, hashtag)
);

create index if not exists posts_account_id_idx on posts(account_id);
create index if not exists posts_published_at_idx on posts(published_at desc);
create index if not exists scheduled_posts_account_id_idx on scheduled_posts(account_id);
create index if not exists scheduled_posts_status_idx on scheduled_posts(status);
