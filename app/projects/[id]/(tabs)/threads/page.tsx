export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ThreadsPage({ params }: Props) {
  await params

  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="text-muted-foreground text-sm">스레드 관리 기능을 준비 중입니다.</p>
    </div>
  )
}
