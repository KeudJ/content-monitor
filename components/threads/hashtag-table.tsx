'use client'

import { useState } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface HashtagRow {
  hashtag: string
  total_posts: number
  avg_engagement_rate: number
}

interface Props {
  data: HashtagRow[]
}

type SortKey = keyof HashtagRow
type Dir = 'asc' | 'desc'

export default function HashtagTable({ data }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('avg_engagement_rate')
  const [dir, setDir] = useState<Dir>('desc')

  function toggleSort(key: SortKey) {
    if (sortKey === key) setDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setDir('desc') }
  }

  const sorted = [...data].sort((a, b) => {
    const va = a[sortKey]
    const vb = b[sortKey]
    return dir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1)
  })

  const arrow = (key: SortKey) => sortKey === key ? (dir === 'asc' ? ' ↑' : ' ↓') : ''

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="cursor-pointer" onClick={() => toggleSort('hashtag')}>해시태그{arrow('hashtag')}</TableHead>
          <TableHead className="cursor-pointer text-right" onClick={() => toggleSort('total_posts')}>사용 횟수{arrow('total_posts')}</TableHead>
          <TableHead className="cursor-pointer text-right" onClick={() => toggleSort('avg_engagement_rate')}>평균 참여율{arrow('avg_engagement_rate')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map(row => (
          <TableRow key={row.hashtag}>
            <TableCell className="font-medium">{row.hashtag}</TableCell>
            <TableCell className="text-right">{row.total_posts}</TableCell>
            <TableCell className="text-right">{(row.avg_engagement_rate * 100).toFixed(2)}%</TableCell>
          </TableRow>
        ))}
        {!sorted.length && (
          <TableRow>
            <TableCell colSpan={3} className="text-center text-muted-foreground text-sm">데이터 없음</TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
