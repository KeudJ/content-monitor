'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface ProjectTabsProps {
  projectId: string
}

const tabs = [
  { label: '콘텐츠 수집', href: (id: string) => `/projects/${id}` },
  { label: '스레드 관리', href: (id: string) => `/projects/${id}/threads` },
]

export default function ProjectTabs({ projectId }: ProjectTabsProps) {
  const pathname = usePathname()

  return (
    <div className="flex gap-1 border-b mb-6">
      {tabs.map((tab) => {
        const href = tab.href(projectId)
        const isActive = tab.label === '스레드 관리'
          ? pathname.endsWith('/threads')
          : !pathname.endsWith('/threads') && !pathname.endsWith('/settings')
        return (
          <Link
            key={tab.label}
            href={href}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              isActive
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </Link>
        )
      })}
    </div>
  )
}
