'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  BookOpenText,
  Users,
  Globe2,
  MapPin,
  CalendarDays,
  Network,
  Settings,
  HelpCircle,
  ChevronRight,
  Lightbulb,
  PenLine,
  Archive,
  Library,
  NotebookPen,
  GitBranch,
  Home,
} from 'lucide-react'
import { useLang } from '@/lib/useLang'

export type SidebarBook = {
  id: string
  title: string
  status: string
  series: { id: string; name: string } | null
}

type TabKey =
  | 'secChapters'
  | 'secCharacters'
  | 'secWorld'
  | 'secLocations'
  | 'secTimeline'
  | 'secGraph'
  | 'secNotes'
  | 'secPlot'

const BOOK_TABS: { tab: string; key: TabKey; icon: React.ComponentType<{ size?: number }> }[] = [
  { tab: 'chapters', key: 'secChapters', icon: BookOpenText },
  { tab: 'characters', key: 'secCharacters', icon: Users },
  { tab: 'world', key: 'secWorld', icon: Globe2 },
  { tab: 'locations', key: 'secLocations', icon: MapPin },
  { tab: 'timeline', key: 'secTimeline', icon: CalendarDays },
  { tab: 'graph', key: 'secGraph', icon: Network },
  { tab: 'notes', key: 'secNotes', icon: NotebookPen },
  { tab: 'plot', key: 'secPlot', icon: GitBranch },
]

const GROUPS = [
  { status: 'idea', key: 'homeGroupIdeas', icon: Lightbulb, defaultOpen: true },
  { status: 'active', key: 'homeGroupActive', icon: PenLine, defaultOpen: true },
  { status: 'archive', key: 'homeGroupArchive', icon: Archive, defaultOpen: false },
] as const

type OpenMap = Record<string, boolean>

export default function SidebarNav({ books }: { books: SidebarBook[] }) {
  const { t } = useLang()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab')

  const activeBookId = useMemo(() => {
    const m = pathname.match(/^\/book\/([^/]+)/)
    return m ? m[1] : null
  }, [pathname])

  const [groupOpen, setGroupOpen] = useState<OpenMap>(() => {
    const init: OpenMap = {}
    for (const g of GROUPS) init[g.status] = g.defaultOpen
    return init
  })
  const [seriesOpen, setSeriesOpen] = useState<OpenMap>({})
  const [bookOpen, setBookOpen] = useState<OpenMap>({})

  useEffect(() => {
    try {
      const raw = localStorage.getItem('wv-sidebar-state')
      if (raw) {
        const p = JSON.parse(raw) as { group?: OpenMap; series?: OpenMap; book?: OpenMap }
        if (p.group) setGroupOpen((c) => ({ ...c, ...p.group }))
        if (p.series) setSeriesOpen((c) => ({ ...c, ...p.series }))
        if (p.book) setBookOpen((c) => ({ ...c, ...p.book }))
      }
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(
        'wv-sidebar-state',
        JSON.stringify({ group: groupOpen, series: seriesOpen, book: bookOpen }),
      )
    } catch {
      /* ignore */
    }
  }, [groupOpen, seriesOpen, bookOpen])

  useEffect(() => {
    if (!activeBookId) return
    const book = books.find((b) => b.id === activeBookId)
    if (!book) return
    const st = book.status === 'idea' || book.status === 'archive' ? book.status : 'active'
    setGroupOpen((c) => (c[st] ? c : { ...c, [st]: true }))
    if (book.series) {
      const sid = book.series.id
      setSeriesOpen((c) => (c[sid] ? c : { ...c, [sid]: true }))
    }
    setBookOpen((c) => (c[activeBookId] !== undefined ? c : { ...c, [activeBookId]: true }))
  }, [activeBookId, books])

  const grouped = useMemo(() => {
    const out: Record<'idea' | 'active' | 'archive', SidebarBook[]> = { idea: [], active: [], archive: [] }
    for (const b of books) {
      const st = b.status === 'idea' || b.status === 'archive' ? b.status : 'active'
      out[st].push(b)
    }
    return out
  }, [books])

  const renderBook = (b: SidebarBook) => {
    const active = b.id === activeBookId
    const open = bookOpen[b.id] === true
    return (
      <div key={b.id}>
        <div className={`sb-book-row ${active ? 'sb-book-active' : ''}`}>
          <button
            type="button"
            className="sb-book-chev"
            onClick={() => setBookOpen((c) => ({ ...c, [b.id]: !open }))}
          >
            <ChevronRight size={12} className={open ? 'sb-chev-open' : ''} />
          </button>
          <Link href={`/book/${b.id}`} className="sb-book">
            <BookOpenText size={13} />
            <span className="truncate flex-1">{b.title}</span>
          </Link>
        </div>
        {open && (
          <div className="sb-tabs">
            {BOOK_TABS.map((tb) => {
              const Icon = tb.icon
              const tabActive = active && currentTab === tb.tab
              return (
                <Link
                  key={tb.tab}
                  href={`/book/${b.id}?tab=${tb.tab}`}
                  className={`sb-tab ${tabActive ? 'sb-tab-active' : ''}`}
                >
                  <Icon size={13} />
                  <span className="truncate">{t(tb.key)}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <Link href="/" className="sb-top">
        <Home size={16} />
        <span className="truncate">{t('homeTitle')}</span>
      </Link>
      <div className="sb-section">
        {GROUPS.map((g) => {
          const list = grouped[g.status]
          if (list.length === 0) return null
          const Icon = g.icon
          const open = groupOpen[g.status] !== false
          const seriesMap = new Map<string, { id: string; name: string; books: SidebarBook[] }>()
          const loose: SidebarBook[] = []
          for (const b of list) {
            if (b.series) {
              let s = seriesMap.get(b.series.id)
              if (!s) {
                s = { id: b.series.id, name: b.series.name, books: [] }
                seriesMap.set(b.series.id, s)
              }
              s.books.push(b)
            } else {
              loose.push(b)
            }
          }
          const seriesList = [...seriesMap.values()].sort((a, b) => a.name.localeCompare(b.name))
          return (
            <div key={g.status} className="sb-group">
              <button
                type="button"
                className="sb-group-head"
                onClick={() => setGroupOpen((c) => ({ ...c, [g.status]: !open }))}
              >
                <ChevronRight size={13} className={open ? 'sb-chev-open' : ''} />
                <Icon size={14} />
                <span className="flex-1 text-left">{t(g.key)}</span>
                <span className="sb-count">{list.length}</span>
              </button>
              {open && (
                <div className="sb-group-body">
                  {seriesList.map((s) => {
                    const sOpen = seriesOpen[s.id] !== false
                    return (
                      <div key={s.id}>
                        <button
                          type="button"
                          className="sb-series-head"
                          onClick={() => setSeriesOpen((c) => ({ ...c, [s.id]: !sOpen }))}
                        >
                          <ChevronRight size={12} className={sOpen ? 'sb-chev-open' : ''} />
                          <Library size={13} />
                          <span className="flex-1 text-left truncate">{s.name}</span>
                          <span className="sb-count">{s.books.length}</span>
                        </button>
                        {sOpen && <div className="sb-series-body">{s.books.map(renderBook)}</div>}
                      </div>
                    )
                  })}
                  {loose.length > 0 && <div className="sb-loose">{loose.map(renderBook)}</div>}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="sb-bottom">
        <Link href="/settings" className="sb-link">
          <Settings size={14} /> {t('navSettings')}
        </Link>
        <Link href="/help" className="sb-link">
          <HelpCircle size={14} /> {t('navHelp')}
        </Link>
      </div>
    </>
  )
}