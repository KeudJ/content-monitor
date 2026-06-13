'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV = [
  { label: '대시보드', href: '/threads/dashboard' },
  { label: '콘텐츠 생성', href: '/threads/create' },
  { label: '해시태그 분석', href: '/threads/analytics' },
]

export default function ThreadsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold mb-3">스레드 관리</h1>
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
      {children}
    </div>
  )
}
