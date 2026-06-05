'use client'

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

interface Props {
  search: string
  onSearchChange: (v: string) => void
  dateRange: 'all' | '7d' | '30d'
  onDateRangeChange: (v: 'all' | '7d' | '30d') => void
  showNewOnly: boolean
  onShowNewOnlyChange: (v: boolean) => void
}

export default function ContentFilters({
  search, onSearchChange,
  dateRange, onDateRangeChange,
  showNewOnly, onShowNewOnlyChange,
}: Props) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={e => onSearchChange(e.target.value)}
          placeholder="Search..."
          className="pl-8 w-52"
        />
      </div>

      <select
        value={dateRange}
        onChange={e => onDateRangeChange(e.target.value as 'all' | '7d' | '30d')}
        className="border rounded-md px-3 py-2 text-sm bg-background h-10"
      >
        <option value="all">All time</option>
        <option value="7d">Last 7 days</option>
        <option value="30d">Last 30 days</option>
      </select>

      <div className="flex items-center gap-2">
        <Switch id="new-only" checked={showNewOnly} onCheckedChange={onShowNewOnlyChange} />
        <Label htmlFor="new-only" className="text-sm cursor-pointer">New only</Label>
      </div>
    </div>
  )
}
