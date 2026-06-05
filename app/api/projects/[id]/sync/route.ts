import { NextResponse } from 'next/server'
import { syncProject } from '@/lib/fetcher/sync'

export const maxDuration = 60

interface Params { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: Params) {
  const { id } = await params
  try {
    const result = await syncProject(id)
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    )
  }
}
