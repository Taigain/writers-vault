import Link from 'next/link'
import { Plus, BookOpenText, CalendarDays, Image as ImageIcon } from 'lucide-react'
import { getBooks, createBook } from '@/lib/actions'
import { getLang } from '@/lib/lang-server'
import { tr } from '@/lib/i18n'

export default async function Home() {
  const books = await getBooks()
  const lang = await getLang()

  return (
    <div className="max-w-5xl mx-auto px-8 py-10 anim-fade">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">{tr(lang, 'homeTitle')}</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--soft)' }}>
          {tr(lang, 'homeSub')}
        </p>
      </header>

      <form action={createBook} className="card p-4 mb-8 flex flex-wrap items-center gap-3">
        <input
          name="title"
          required
          placeholder={tr(lang, 'homePh')}
          className="input flex-1 min-w-[220px]"
        />
        <label className="btn btn-ghost cursor-pointer">
          <ImageIcon size={16} /> {tr(lang, 'homeCover')}
          <input type="file" name="cover" accept="image/*" className="hidden" />
        </label>
        <button type="submit" className="btn btn-primary">
          <Plus size={16} /> {tr(lang, 'homeCreate')}
        </button>
      </form>

      {books.length === 0 ? (
        <div className="card p-14 text-center">
          <BookOpenText size={40} className="mx-auto mb-4" style={{ color: 'var(--gold)' }} />
          <div className="font-semibold text-lg mb-1">{tr(lang, 'homeEmptyTitle')}</div>
          <p className="text-sm" style={{ color: 'var(--soft)' }}>{tr(lang, 'homeEmptySub')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {books.map((b) => (
            <Link key={b.id} href={`/book/${b.id}`} className="group anim-fade">
              <div className="card overflow-hidden transition-transform duration-200 group-hover:-translate-y-1">
                <div className="h-44">
                  {b.coverBase64 ? (
                    <img src={b.coverBase64} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="cover-ph w-full h-full text-4xl font-write">
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
          ))}
        </div>
      )}
    </div>
  )
}