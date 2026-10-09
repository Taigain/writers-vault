'use client'

import { Suspense, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  BookOpenText,
  Users,
  Globe2,
  MapPin,
  CalendarDays,
  Clapperboard,
  Network,
  NotebookPen,
  GitBranch,
  Languages,
  Home,
} from 'lucide-react'
import { useLang } from '@/lib/useLang'
import type { StrKey } from '@/lib/i18n'

const ITEMS: { tab: string; key: StrKey; icon: React.ComponentType<{ size?: number }> }[] = [
  { tab: '', key: 'bbPassport', icon: Home },
  { tab: 'chapters', key: 'secChapters', icon: BookOpenText },
  { tab: 'characters', key: 'secCharacters', icon: Users },
  { tab: 'world', key: 'secWorld', icon: Globe2 },
  { tab: 'locations', key: 'secLocations', icon: MapPin },
  { tab: 'timeline', key: 'secTimeline', icon: CalendarDays },
  { tab: 'scenes', key: 'secScenes', icon: Clapperboard },
  { tab: 'graph', key: 'secGraph', icon: Network },
  { tab: 'notes', key: 'secNotes', icon: NotebookPen },
  { tab: 'plot', key: 'secPlot', icon: GitBranch },
  { tab: 'dict', key: 'secDict', icon: Languages },
]

function BookBarInner() {
  const { t } = useLang()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const m = pathname.match(/^\/book\/([^/]+)/)
  const bookId = m ? m[1] : null
  const tab = searchParams.get('tab') ?? ''
  const current = ITEMS.some((i) => i.tab === tab) ? tab : ''
  const prevRef = useRef<string | null>(null)

  useEffect(() => {
    const prev = prevRef.current
    prevRef.current = current
    if (prev === '' && current !== '' && bookId) {
      let auto = '1'
      try {
        auto = localStorage.getItem('wv-sb-auto') ?? '1'
      } catch {
        /* ignore */
      }
      if (auto === '1') {
        try {
          localStorage.setItem('wv-sb', '1')
        } catch {
          /* ignore */
        }
        window.dispatchEvent(new CustomEvent('wv-sb-set', { detail: '1' }))
      }
    }
  }, [current, bookId])

  useEffect(() => {
    document.body.classList.toggle('has-book-bar', Boolean(bookId))
    return () => document.body.classList.remove('has-book-bar')
  }, [bookId])

  if (!bookId) return null

  return (
    <nav className="book-bar">
      {ITEMS.map((it) => {
        const active = it.tab === current
        const href = it.tab ? `/book/${bookId}?tab=${it.tab}` : `/book/${bookId}`
        const Icon = it.icon
        return active ? (
          <span key={it.tab || 'passport'} className="book-bar-item book-bar-active">
            <Icon size={15} />
            <span className="book-bar-label">{t(it.key)}</span>
          </span>
        ) : (
          <Link key={it.tab || 'passport'} href={href} className="book-bar-item" title={t(it.key)}>
            <Icon size={16} />
          </Link>
        )
      })}
    </nav>
  )
}

export default function BookBar() {
  return (
    <Suspense fallback={null}>
      <BookBarInner />
    </Suspense>
  )
}