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
  Languages,
  Clapperboard,
  ChevronLeft,
} from 'lucide-react'
import { useLang } from '@/lib/useLang'
import { APP_NAME, APP_VERSION } from '@/lib/appinfo'

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
  | 'secScenes'
  | 'secGraph'
  | 'secNotes'
  | 'secPlot'
  | 'secDict'

const BOOK_TABS: { tab: string; key: TabKey; icon: React.ComponentType<{ size?: number }> }[] = [
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

  const [collapsed, setCollapsed] = useState(false)
  useEffect(() => {
    let saved = '0'
    try {
      saved = localStorage.getItem('wv-sb') || '0'
    } catch {
      /* ignore */
    }
    const c = saved === '1'
    setCollapsed(c)
    document.documentElement.style.setProperty('--sbw', c ? '60px' : '256px')
    document.body.classList.toggle('sb-collapsed', c)
  }, [])
  const toggleCollapsed = () => {
    const next = !collapsed
    setCollapsed(next)
    try {
      localStorage.setItem('wv-sb', next ? '1' : '0')
    } catch {
      /* ignore */
    }
    document.documentElement.style.setProperty('--sbw', next ? '60px' : '256px')
    document.body.classList.toggle('sb-collapsed', next)
  }

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

  useEffect(() => {
    const onSet = (e: Event) => {
      const v = (e as CustomEvent).detail === '1'
      setCollapsed(v)
      document.documentElement.style.setProperty('--sbw', v ? '60px' : '256px')
      document.body.classList.toggle('sb-collapsed', v)
    }
    window.addEventListener('wv-sb-set', onSet)
    return () => window.removeEventListener('wv-sb-set', onSet)
  }, [])

  const grouped = useMemo(() => {
    const out: Record<'idea' | 'active' | 'archive', SidebarBook[]> = {
      idea: [],
      active: [],
      archive: [],
    }
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
      <div className="flex justify-end px-2 pt-2">
        <button
          type="button"
          className="mini-btn"
          title={collapsed ? t('sbExpand') : t('sbCollapse')}
          onClick={toggleCollapsed}
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      <div
        className={
          collapsed
            ? 'flex items-center justify-center pt-2 pb-3 border-b'
            : 'flex items-center gap-2.5 px-4 pt-2 pb-3 border-b'
        }
        style={{ borderColor: 'rgba(255,255,255,.08)' }}
      >
        <span
          style={{
            width: 38,
            height: 38,
            borderRadius: '50%',
            background: '#f5f0e8',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 1px 4px rgba(0,0,0,.35)',
          }}
        >
          <img src="/favicon.ico" alt="" width={24} height={24} />
        </span>
        <div className="min-w-0 sb-hide">
          <div className="text-sm font-bold truncate" style={{ color: '#f3ede4' }}>
            {APP_NAME}
          </div>
          <div className="text-[11px] truncate" style={{ color: 'rgba(243,237,228,.55)' }}>
            {t('tagline')}
          </div>
        </div>
      </div>

      {collapsed && (
        <div className="flex-1 overflow-y-auto flex flex-col items-center gap-2 py-3">
          <Link
            href="/"
            title={t('homeTitle')}
            className="sb-link"
            style={{ width: 40, justifyContent: 'center' }}
          >
            <Home size={16} />
          </Link>
          {books.map((b) => (
            <Link
              key={b.id}
              href={`/book/${b.id}`}
              title={b.title}
              className="avatar"
              style={{ width: 34, height: 34, fontSize: 13 }}
            >
              {b.title.charAt(0).toUpperCase()}
            </Link>
          ))}
        </div>
      )}

      <Link href="/" className={`sb-top ${collapsed ? 'sb-hide' : ''}`}>
        <Home size={16} />
        <span className="truncate">{t('homeTitle')}</span>
      </Link>

      <div className={`sb-section ${collapsed ? 'sb-hide' : ''}`}>
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
        <Link href="/settings" className={`sb-link ${collapsed ? 'justify-center' : ''}`}>
          <Settings size={14} /> <span className="sb-hide">{t('navSettings')}</span>
        </Link>
        <Link href="/help" className={`sb-link ${collapsed ? 'justify-center' : ''}`}>
          <HelpCircle size={14} /> <span className="sb-hide">{t('navHelp')}</span>
        </Link>
        <div className="px-4 pb-1 text-[10px] sb-hide" style={{ color: 'rgba(243,237,228,.35)' }}>
          {t('sbVersion', { v: APP_VERSION })}
        </div>
        <div className="px-4 pb-3 text-[10px] sb-hide" style={{ color: 'rgba(243,237,228,.4)' }}>
          {t('footer1')} {t('footer2')}
        </div>
      </div>
    </>
  )
}