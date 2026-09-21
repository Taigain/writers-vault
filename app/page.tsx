import Link from 'next/link'
import { Plus, BookOpenText, CalendarDays, Image as ImageIcon, Library } from 'lucide-react'
import { getBooksWithSeries, createBook, createSeries, deleteSeries, getSeriesList } from '@/lib/actions'
import DeleteButton from '@/components/DeleteButton'
import { getLang } from '@/lib/lang-server'
import { tr } from '@/lib/i18n'
import CollapsibleSection from '@/components/CollapsibleSection'

type BookRow = Awaited<ReturnType<typeof getBooksWithSeries>>[number]

function BookCard({ b, lang }: { b: BookRow; lang: 'ru' | 'en' }) {
  return (
    <Link href={`/book/${b.id}`} className="group anim-fade">
      <div className="card overflow-hidden transition-transform duration-200 group-hover:-translate-y-1">
        <div className="w-full overflow-hidden" style={{ aspectRatio: '3 / 4' }}>
          {b.coverBase64 ? (
            <img src={b.coverBase64} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="cover-ph w-full h-full text-5xl font-write">
              {b.title.charAt(0).toUpperCase()}
            </div>
          )}
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

  const seriesMap = new Map<string, { id: string; name: string; createdAt: string; books: BookRow[] }>()
  const loose: BookRow[] = []
  for (const b of books) {
    if (b.series) {
      let g = seriesMap.get(b.series.id)
      if (!g) {
        g = { id: b.series.id, name: b.series.name, createdAt: b.series.createdAt.toISOString(), books: [] }
        seriesMap.set(b.series.id, g)
      }
      g.books.push(b)
    } else {
      loose.push(b)
    }
  }
  const groups = [...seriesMap.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  return (
    <div className="max-w-5xl mx-auto px-8 py-10 anim-fade">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{tr(lang, 'homeTitle')}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--soft)' }}>{tr(lang, 'homeSub')}</p>
      </header>

      <form action={createBook} className="card p-4 mb-8 flex flex-wrap items-center gap-3">
        <input name="title" required placeholder={tr(lang, 'homePh')} className="input flex-1 min-w-[220px]" />
        <label className="btn btn-ghost cursor-pointer">
          <ImageIcon size={16} /> {tr(lang, 'homeCover')}
          <input type="file" name="cover" accept="image/*" className="hidden" />
        </label>
        <button type="submit" className="btn btn-primary">
          <Plus size={16} /> {tr(lang, 'homeCreate')}
        </button>
      </form>

      <section className="card p-4 mb-8">
        <div className="field-label">{tr(lang, 'homeSeriesManage')}</div>
        <form
          action={async (fd: FormData) => {
            'use server'
            await createSeries(fd)
          }}
          className="flex flex-wrap gap-2"
        >
          <input name="name" required placeholder={tr(lang, 'homeSeriesPh')} className="input flex-1 min-w-[220px]" />
          <button className="btn btn-primary btn-sm">
            <Plus size={14} /> {tr(lang, 'homeSeriesAdd')}
          </button>
        </form>
        {allSeries.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {allSeries.map((s) => (
              <span key={s.id} className="chip flex items-center">
                <Library size={11} /> {s.name}
                <DeleteButton
                  onConfirm={async () => {
                    'use server'
                    await deleteSeries(s.id)
                  }}
                  label=""
                  confirmText={tr(lang, 'homeSeriesDeleteConfirm', { name: s.name })}
                  className="btn btn-ghost btn-sm"
                />
              </span>
            ))}
          </div>
        )}
      </section>

      {books.length === 0 ? (
        <div className="card p-14 text-center">
          <BookOpenText size={40} className="mx-auto mb-4" style={{ color: 'var(--gold)' }} />
          <div className="font-semibold text-lg mb-1">{tr(lang, 'homeEmptyTitle')}</div>
          <p className="text-sm" style={{ color: 'var(--soft)' }}>{tr(lang, 'homeEmptySub')}</p>
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map((g) => (
            <CollapsibleSection
              key={g.id}
              id={'s-' + g.id}
              title={g.name}
              count={tr(lang, 'homeSeriesCount', { n: g.books.length })}
              icon={<Library size={17} style={{ color: 'var(--gold)' }} />}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {g.books.map((b) => (
                  <BookCard key={b.id} b={b} lang={lang} />
                ))}
              </div>
            </CollapsibleSection>
          ))}

          {loose.length > 0 && (
            <CollapsibleSection
              id="standalone"
              title={tr(lang, 'homeSeriesless')}
              icon={<BookOpenText size={17} style={{ color: 'var(--soft)' }} />}
            >
              <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
                {loose.map((b) => (
                  <BookCard key={b.id} b={b} lang={lang} />
                ))}
              </div>
            </CollapsibleSection>
          )}
        </div>
      )}
    </div>
  )
}