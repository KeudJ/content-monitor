'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV = [
  { label: '콘텐츠 수집', href: '/' },
  { label: '스레드 관리', href: '/threads/dashboard' },
]

export default function MainNav() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1 ml-6">
      {NAV.map(n => {
        const isActive = n.href === '/'
          ? !pathname.startsWith('/threads')
          : pathname.startsWith('/threads')
        return (
          <Link
            key={n.href}
            href={n.href}
            className={cn(
              'px-3 py-1 text-sm rounded-md transition-colors',
              isActive
                ? 'bg-foreground text-background'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {n.label}
          </Link>
        )
      })}
    </nav>
  )
}
