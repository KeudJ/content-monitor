export interface ThreadsAccount {
  id: string
  threads_user_id: string
  username: string
  access_token: string
  token_expires_at: string | null
  profile_picture_url: string | null
  created_at: string
}

export interface Post {
  id: string
  account_id: string
  threads_post_id: string
  post_text: string | null
  media_url: string | null
  published_at: string | null
  impressions: number
  likes: number
  comments: number
  reposts: number
  quotes: number
  followers_count: number
  profile_clicks: number
  engagement_rate: number
  synced_at: string
}

export interface ScheduledPost {
  id: string
  account_id: string
  post_text: string
  media_url: string | null
  scheduled_at: string
  status: 'pending' | 'published' | 'failed'
  created_at: string
}

export interface HashtagStat {
  id: string
  account_id: string
  hashtag: string
  avg_engagement_rate: number
  total_posts: number
  updated_at: string
}
