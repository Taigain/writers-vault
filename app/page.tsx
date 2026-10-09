import Link from 'next/link'
import type { ReactNode } from 'react'
import { BookOpenText, CalendarDays, Library, Lightbulb, PenLine, Archive, NotebookPen } from 'lucide-react'
import { getBooksWithSeries, createBook, importBookFromDocx, getBookVolumes, getSeriesList, getIdeaNotes } from '@/lib/actions'
import CollapsibleSection from '@/components/CollapsibleSection'
import HomeView, { type ShelfBook } from '@/components/HomeView'
import { getLang } from '@/lib/lang-server'
import { tr } from '@/lib/i18n'
import CoverOptimizer from '@/components/CoverOptimizer'
import IdeaBoard from '@/components/IdeaBoard'

type BookRow = Awaited<ReturnType<typeof getBooksWithSeries>>[number]
type Status = 'idea' | 'active' | 'archive'

function BookCard({ b, lang }: { b: BookRow; lang: 'ru' | 'en' }) {
  return (
    <Link href={`/book/${b.id}`} className="group anim-fade">
      <div className="card overflow-hidden transition-transform duration-200 group-hover:-translate-y-1">
        <CoverOptimizer />
        <div className="w-full overflow-hidden" style={{ aspectRatio: '3 / 4' }}>
          {b.coverBase64 ? (
            <img src={b.coverBase64} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="cover-ph w-full h-full text-5xl font-write">
              {b.title.charAt(0).toUpperCase()}
            </div>
          )}
          {b.genre ? (
            <div className="text-xs mt-0.5 truncate" style={{ color: 'var(--soft)' }}>
              {tr(lang, ('g_' + b.genre) as 'g_fantasy')}
            </div>
          ) : null}
        </div>
        <div className="p-3.5">
          <div className="font-semibold text-sm truncate">{b.title}</div>
          <div className="text-xs mt-1 flex items-center gap-1" style={{ color: 'var(--soft)' }}>
            <CalendarDays size={12} />
            {new Date(b.createdAt).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US')}
          </div>
        </div>
      </div>
    </Link>
  )
}

export default async function Home() {
  const books = await getBooksWithSeries()
  const allSeries = await getSeriesList()
  const lang = await getLang()
  const volumes = await getBookVolumes()
  const ideaNotes = await getIdeaNotes()
  const statusOrder: Record<string, number> = { active: 0, idea: 1, archive: 2 }
  const shelfBooks: ShelfBook[] = books
    .slice()
    .sort((a, b) => {
      const so = (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3)
      if (so !== 0) return so
      return a.createdAt.getTime() - b.createdAt.getTime()
    })
    .map((b) => {
      const v = volumes[b.id] ?? { chars: 0, words: 0 }
      return {
        id: b.id,
        title: b.title,
        status: b.status,
        series: b.series?.name ?? null,
        sheets: v.chars / 40000,
        words: v.words,
        genre: b.genre ?? '',
        spineColor: b.spineColor ?? '',
        spineStyle: b.spineStyle ?? 'tome',
        createdAt: b.createdAt.getTime(),
      }
    })

  const renderGroup = (
    status: Status,
    titleKey: 'homeGroupIdeas' | 'homeGroupActive' | 'homeGroupArchive',
    icon: ReactNode,
  ) => {
    const inStatus = books.filter((b) => b.status === status)
    if (inStatus.length === 0) return null
    const map = new Map<string, { id: string; name: string; createdAt: string; books: BookRow[] }>()
    const loose: BookRow[] = []
    for (const b of inStatus) {
      if (b.series) {
        let g = map.get(b.series.id)
        if (!g) {
          g = { id: b.series.id, name: b.series.name, createdAt: b.series.createdAt.toISOString(), books: [] }
          map.set(b.series.id, g)
        }
        g.books.push(b)
      } else {
        loose.push(b)
      }
    }
    const groups = [...map.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    return (
      <CollapsibleSection
        id={'grp-' + status}
        title={tr(lang, titleKey)}
        count={inStatus.length}
        icon={icon}
      >
        <div className="space-y-8">
          {groups.map((g) => (
            <div key={g.id}>
              <h3 className="flex items-center gap-2 text-base font-bold mb-3">
                <Library size={15} style={{ color: 'var(--gold)' }} />
                {g.name}
                <span className="chip">{tr(lang, 'homeSeriesCount', { n: g.books.length })}</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {g.books.map((b) => (
                  <BookCard key={b.id} b={b} lang={lang} />
                ))}
              </div>
            </div>
          ))}
          {loose.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {loose.map((b) => (
                <BookCard key={b.id} b={b} lang={lang} />
              ))}
            </div>
          )}
        </div>
      </CollapsibleSection>
    )
  }

  return (
    <div className="page-wrap mx-auto px-8 py-10 anim-fade">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{tr(lang, 'homeTitle')}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--soft)' }}>{tr(lang, 'homeSub')}</p>
      </header>
      <HomeView
        books={shelfBooks}
        createAction={createBook}
        onImport={importBookFromDocx}
        series={allSeries.map((s) => ({ id: s.id, name: s.name }))}
        tiles={
          books.length === 0 ? (
            <div className="card p-14 text-center">
              <BookOpenText size={40} className="mx-auto mb-4" style={{ color: 'var(--gold)' }} />
              <div className="font-semibold text-lg mb-1">{tr(lang, 'homeEmptyTitle')}</div>
              <p className="text-sm" style={{ color: 'var(--soft)' }}>{tr(lang, 'homeEmptySub')}</p>
            </div>
          ) : (
            <div className="space-y-10">
              {renderGroup('idea', 'homeGroupIdeas', <Lightbulb size={17} style={{ color: 'var(--gold)' }} />)}
              {renderGroup('active', 'homeGroupActive', <PenLine size={17} style={{ color: 'var(--gold)' }} />)}
              {renderGroup('archive', 'homeGroupArchive', <Archive size={17} style={{ color: 'var(--soft)' }} />)}
            </div>
          )
        }
      />
      <div className="mt-10">
        <CollapsibleSection
          id="idea-board"
          title={tr(lang, 'ibTitle')}
          count={ideaNotes.length}
          icon={<NotebookPen size={17} style={{ color: 'var(--gold)' }} />}
        >
          <IdeaBoard
            notes={ideaNotes.map((n) => ({ id: n.id, text: n.text, x: n.x, y: n.y, color: n.color }))}
          />
          <p className="text-xs mt-2" style={{ color: 'var(--soft)' }}>{tr(lang, 'ibHint')}</p>
        </CollapsibleSection>
      </div>
    </div>
  )
}