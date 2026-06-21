'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { X, Columns2 } from 'lucide-react'

const NAV = [
  { label: '대시보드', href: '/threads/dashboard' },
  { label: '콘텐츠 생성', href: '/threads/create' },
]

export default function ThreadsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [splitOpen, setSplitOpen] = useState(false)

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-semibold">스레드 관리</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSplitOpen(o => !o)}
          >
            {splitOpen ? <X className="h-4 w-4 mr-1.5" /> : <Columns2 className="h-4 w-4 mr-1.5" />}
            {splitOpen ? '분할 뷰 닫기' : '스레드 열기'}
          </Button>
        </div>
        <div className="flex gap-1 border-b">
          {NAV.map(n => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
                pathname === n.href
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              {n.label}
            </Link>
          ))}
        </div>
      </div>

      <div className={cn('flex gap-4', splitOpen && 'items-start')}>
        <div className={cn('flex-1 min-w-0', splitOpen && 'overflow-auto')}>
          {children}
        </div>
        {splitOpen && (
          <div className="w-[420px] shrink-0 sticky top-4">
            <div className="border rounded-lg overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
              <div className="bg-muted/30 px-3 py-2 text-xs text-muted-foreground border-b">
                threads.net
              </div>
              <iframe
                src="https://www.threads.net"
                className="w-full h-full"
                title="Threads"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
