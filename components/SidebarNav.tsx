'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ChevronRight, BookOpenText, Feather, Users, Globe2, MapPin, Clock, Share2, Settings, CircleHelp } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import type { StrKey } from '@/lib/i18n'

type BookItem = { id: string; title: string; chapters: { id: string; title: string }[] }

const SECTIONS: { tab: string; key: StrKey; icon: typeof Feather }[] = [
  { tab: 'chapters', key: 'secChapters', icon: Feather },
  { tab: 'characters', key: 'secCharacters', icon: Users },
  { tab: 'world', key: 'secWorld', icon: Globe2 },
  { tab: 'locations', key: 'secLocations', icon: MapPin },
  { tab: 'timeline', key: 'secTimeline', icon: Clock },
  { tab: 'graph', key: 'secGraph', icon: Share2 },
]

export default function SidebarNav({ books }: { books: BookItem[] }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get('tab')
  const currentBookId = pathname?.startsWith('/book/') ? pathname.split('/')[2] : null
  const [open, setOpen] = useState<string | null>(currentBookId)
  const [chOpen, setChOpen] = useState<string | null>(null)
  const { t } = useLang()

  return (
    <nav className="p-3 flex-1 overflow-y-auto flex flex-col gap-1">
      <Link href="/" className="px-2 py-4 flex items-center gap-3">
        <span className="w-9 h-9 rounded-xl overflow-hidden bg-[#8c3a2b] flex items-center justify-center text-white">
          <img src="/logo.png" alt="" className="w-full h-full object-cover" />
        </span>
        <span>
          <span className="block font-semibold tracking-wide text-[#f0e9dc]">Writer&apos;s Vault</span>
          <span className="block text-[11px] text-white/40">{t('tagline')}</span>
        </span>
      </Link>

      <div className="nav-head">{t('navBooks')}</div>

      {books.length === 0 && (
        <div className="text-xs px-2 py-1" style={{ color: 'rgba(255,255,255,.4)' }}>
          {t('navEmpty')}
        </div>
      )}

      {books.map((b) => {
        const isOpen = open === b.id
        const isActive = currentBookId === b.id
        const isPassport = isActive && !currentTab
        return (
          <div key={b.id}>
            <div className={`nav-row ${isActive ? 'nav-row-active' : ''}`}>
              <button
                type="button"
                className="nav-toggle"
                aria-expanded={isOpen}
                onClick={() => setOpen(isOpen ? null : b.id)}
              >
                <ChevronRight size={14} className={`nav-chev ${isOpen ? 'nav-chev-open' : ''}`} />
              </button>
              <Link
                href={`/book/${b.id}`}
                className={`nav-link flex-1 min-w-0 ${isPassport ? 'nav-link-active' : ''}`}
              >
                <BookOpenText size={15} className="shrink-0" />
                <span className="truncate">{b.title}</span>
              </Link>
            </div>

            {isOpen && (
              <div className="nav-sub">
                {SECTIONS.map((s) => {
                  const Icon = s.icon
                  const active = isActive && currentTab === s.tab
                  return (
                    <div key={s.tab}>
                      <div className="flex items-center">
                        <Link
                          href={`/book/${b.id}?tab=${s.tab}`}
                          className={`nav-sub-link flex-1 min-w-0 ${active ? 'nav-sub-active' : ''}`}
                        >
                          <Icon size={13} /> <span className="truncate">{t(s.key)}</span>
                        </Link>
                        {s.tab === 'chapters' && b.chapters.length > 0 && (
                          <button
                            type="button"
                            className="nav-ch-toggle"
                            title={t('navChaptersToggle')}
                            onClick={() => setChOpen(chOpen === b.id ? null : b.id)}
                          >
                            <ChevronRight size={12} className={`nav-chev ${chOpen === b.id ? 'nav-chev-open' : ''}`} />
                          </button>
                        )}
                      </div>
                      {s.tab === 'chapters' && chOpen === b.id && (
                        <div className="nav-chapters">
                          {b.chapters.map((ch, i) => (
                            <Link
                              key={ch.id}
                              href={`/book/${b.id}?tab=chapters&ch=${ch.id}`}
                              className="nav-chapter-link"
                            >
                              <span className="nav-ch-num">{i + 1}</span>
                              <span className="truncate">{ch.title || '—'}</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}

      <div className="mt-auto pt-3 border-t border-white/10 flex flex-col gap-2">
        <Link href="/help" className="nav-link">
          <CircleHelp size={15} /> {t('navHelp')}
        </Link>
        <Link href="/settings" className="nav-link">
          <Settings size={15} /> {t('navSettings')}
        </Link>
        <div className="px-2 pb-2 text-[11px] leading-relaxed text-white/30">
          {t('footer1')}
          <br />
          {t('footer2')}
        </div>
      </div>
    </nav>
  )
}