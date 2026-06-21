const BASE = 'https://graph.threads.net/v1.0'

export async function getProfile(token: string) {
  const r = await fetch(`${BASE}/me?fields=id,username,threads_profile_picture_url&access_token=${token}`)
  if (!r.ok) throw new Error(`Threads profile fetch failed: ${r.status}`)
  return r.json()
}

export async function getThreadsList(token: string, userId: string) {
  const fields = 'id,text,media_url,timestamp,media_type'
  const r = await fetch(`${BASE}/${userId}/threads?fields=${fields}&limit=100&access_token=${token}`)
  if (!r.ok) throw new Error(`Threads list fetch failed: ${r.status}`)
  return r.json()
}

export async function getPostInsights(token: string, postId: string) {
  const metrics = 'views,likes,replies,reposts,quotes,shares,clicks'
  const r = await fetch(`${BASE}/${postId}/insights?metric=${metrics}&access_token=${token}`)
  return r.json()
}

export async function createThreadsDraft(token: string, userId: string, text: string, mediaUrl?: string) {
  const body = new URLSearchParams({ access_token: token, text })
  if (mediaUrl) {
    body.set('media_type', 'IMAGE')
    body.set('image_url', mediaUrl)
  } else {
    body.set('media_type', 'TEXT')
  }
  const r = await fetch(`${BASE}/${userId}/threads`, { method: 'POST', body })
  if (!r.ok) throw new Error(`Threads draft create failed: ${r.status}`)
  return r.json()
}

export async function publishThreadsDraft(token: string, userId: string, creationId: string) {
  const body = new URLSearchParams({ access_token: token, creation_id: creationId })
  const r = await fetch(`${BASE}/${userId}/threads_publish`, { method: 'POST', body })
  if (!r.ok) throw new Error(`Threads publish failed: ${r.status}`)
  return r.json()
}
