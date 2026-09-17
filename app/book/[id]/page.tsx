import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Save, Plus, MapPin, Globe2, Image as ImageIcon, BookOpen, Feather, Users, Type, ChevronRight } from 'lucide-react'
import CharacterCard from '@/components/CharacterCard'
import LoreSection from '@/components/LoreSection'
import TimelineSection from '@/components/TimelineSection'
import GraphCloud from '@/components/GraphCloud'
import BookPassport from '@/components/BookPassport'
import ChapterEditor from '@/components/ChapterEditor'
import DeleteButton from '@/components/DeleteButton'
import ExportButton from '@/components/ExportButton'
import ChapterSearch from '@/components/ChapterSearch'
import { ROLES } from '@/lib/roles'
import { getLang } from '@/lib/lang-server'
import { tr } from '@/lib/i18n'
import {
  getBook,
  getSeriesList,
  getChapters,
  createChapter,
  getCharacters,
  createCharacter,
  getLocations,
  saveLocation,
  createLocation,
  removeLocationImage,
  deleteLocation,
  deleteBook,
  getTimeline,
  getLoreEntries,
  getGraphData,
} from '@/lib/actions'

const words = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0)

const VIEWS = ['chapters', 'characters', 'world', 'locations', 'timeline', 'graph']

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string; ch?: string }>
}) {
  const { id } = await params
  const { tab, ch: chParam } = await searchParams
  const view = tab && VIEWS.includes(tab) ? tab : 'passport'
  const lang = await getLang()

  const book = await getBook(id)
  if (!book) notFound()
  const seriesList = await getSeriesList()

  const [chapters, characters, locations, timeline, lore, graph] = await Promise.all([
    getChapters(id),
    getCharacters(id),
    getLocations(id),
    getTimeline(id),
    getLoreEntries(id),
    getGraphData(id),
  ])

  const chapterOptions = chapters.map((c) => ({ id: c.id, title: c.title }))
  const characterOptions = characters.map((c) => ({ id: c.id, name: c.name }))
  const totalWords = chapters.reduce((s, c) => s + words(c.content), 0)
  const totalChars = chapters.reduce((s, c) => s + c.content.length, 0)

  /* ---------- ГЛАВЫ ---------- */
  const chaptersSection = (
    <div className="space-y-6">
      <ChapterSearch
        bookId={id}
        chapters={chapters.map((c, i) => ({ id: c.id, title: c.title, content: c.content, index: i }))}
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <span className="chip">
            <Feather size={12} /> {tr(lang, 'pgTotalsWords')}: {totalWords.toLocaleString('ru-RU')}
          </span>
          <span className="chip">
            <Type size={12} /> {tr(lang, 'pgTotalsChars')}: {totalChars.toLocaleString('ru-RU')}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <ExportButton bookId={id} baseName={book.title} />
          <form
            action={async () => {
              'use server'
              await createChapter(id, chapters.length + 1)
            }}
          >
            <button className="btn btn-primary btn-sm">
              <Plus size={14} /> {tr(lang, 'pgAddChapter')}
            </button>
          </form>
        </div>
      </div>

      {chapters.length === 0 && (
        <div className="card p-10 text-center text-sm" style={{ color: 'var(--soft)' }}>
          {tr(lang, 'pgChaptersEmpty')}
        </div>
      )}

      <div className="space-y-4">
        {chapters.map((ch, i) => (
          <ChapterEditor
            key={ch.id}
            id={ch.id}
            index={i}
            total={chapters.length}
            title={ch.title}
            content={ch.content}
            autoOpen={chParam === ch.id}
          />
        ))}
      </div>

      <form
        action={async () => {
          'use server'
          await createChapter(id, chapters.length + 1)
        }}
        className="flex justify-center pt-2"
      >
        <button className="btn btn-ghost btn-sm">
          <Plus size={14} /> {tr(lang, 'pgAddChapter')}
        </button>
      </form>
    </div>
  )

  /* ---------- ПЕРСОНАЖИ ---------- */
  const charactersSection = (
    <div>
      <form
        action={async (fd: FormData) => {
          'use server'
          await createCharacter(id, fd.get('name') as string, (fd.get('role') as string) || 'secondary')
        }}
        className="card p-4 mb-5 create-row"
      >
        <input name="name" required placeholder={tr(lang, 'pgCharNamePh')} className="input" />
        <select name="role" required defaultValue="" className="input">
          <option value="" disabled>{tr(lang, 'pgRolePh')}</option>
          {ROLES.map((r) => (
            <option key={r.key} value={r.key}>{lang === 'ru' ? r.ru : r.en}</option>
          ))}
        </select>
        <button className="btn btn-primary btn-sm">
          <Plus size={14} /> {tr(lang, 'pgAdd')}
        </button>
      </form>

      {characters.length === 0 && (
        <div className="card p-10 text-center text-sm" style={{ color: 'var(--soft)' }}>
          {tr(lang, 'pgCharsEmpty')}
        </div>
      )}

      <div className="space-y-6">
        {characters.map((c) => (
          <CharacterCard key={c.id} character={c} allCharacters={characters} />
        ))}
      </div>
    </div>
  )

  /* ---------- МИР ---------- */
  const worldSection = (
    <section>
      <LoreSection bookId={id} entries={lore} />
    </section>
  )

  /* ---------- ЛОКАЦИИ ---------- */
  const locationsSection = (
    <div>
      <form
        action={async (fd: FormData) => {
          'use server'
          await createLocation(id, fd.get('name') as string)
        }}
        className="card p-4 mb-5 create-row-2"
      >
        <input name="name" required placeholder={tr(lang, 'pgLocNamePh')} className="input" />
        <button className="btn btn-primary btn-sm">
          <Plus size={14} /> {tr(lang, 'pgAdd')}
        </button>
      </form>

      {locations.length === 0 && (
        <div className="card p-10 text-center text-sm" style={{ color: 'var(--soft)' }}>
          {tr(lang, 'pgLocsEmpty')}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        {locations.map((loc) => (
          <details key={loc.id} className="acc">
            <summary className="acc-head">
              <ChevronRight size={18} className="acc-chev" />
              <span className="w-8 h-8 rounded-lg bg-[#f1e9db] text-[#7a5c22] flex items-center justify-center shrink-0">
                <MapPin size={16} />
              </span>
              <span className="acc-title">{loc.name}</span>
            </summary>
            <div className="acc-body">
              {loc.imageBase64 && (
                <div className="loc-img mt-4 mb-3">
                  <img src={loc.imageBase64} alt="" className="w-full h-full object-cover" />
                </div>
              )}

              <form
                action={async (fd: FormData) => {
                  'use server'
                  await saveLocation(loc.id, fd)
                }}
                className="space-y-3 pt-2"
              >
                <input name="name" defaultValue={loc.name} className="input font-semibold" />
                <textarea
                  name="desc"
                  defaultValue={loc.desc}
                  rows={3}
                  className="textarea text-sm"
                  placeholder={tr(lang, 'pgLocDescPh')}
                />
                {loc.mentions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {loc.mentions.map((m) => (
                      <span key={m.id} className="chip chip-mention">{m.chapter.title}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between gap-2">
                  <label className="btn btn-ghost btn-sm cursor-pointer">
                    <ImageIcon size={13} /> {loc.imageBase64 ? tr(lang, 'pgLocImgReplace') : tr(lang, 'pgLocImgAttach')}
                    <input type="file" name="image" accept="image/*" className="hidden" />
                  </label>
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Save size={13} /> {tr(lang, 'pgLocSave')}
                  </button>
                </div>
              </form>

              <div className="flex flex-wrap justify-between gap-2 mt-2">
                {loc.imageBase64 ? (
                  <form
                    action={async () => {
                      'use server'
                      await removeLocationImage(loc.id)
                    }}
                  >
                    <button type="submit" className="btn btn-ghost btn-sm">{tr(lang, 'pgLocImgRemove')}</button>
                  </form>
                ) : (
                  <span />
                )}
                <DeleteButton
                  onConfirm={async () => {
                    'use server'
                    await deleteLocation(loc.id)
                  }}
                  label={tr(lang, 'pgLocDelete')}
                  confirmText={tr(lang, 'pgLocDeleteConfirm', { name: loc.name })}
                />
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  )

  /* ---------- ТАЙМЛАЙН ---------- */
  const timelineSection = (
    <TimelineSection bookId={id} events={timeline} chapters={chapterOptions} characters={characterOptions} />
  )

  /* ---------- СВЯЗИ ---------- */
  const graphSection = <GraphCloud data={graph} />

  /* ---------- СБОРКА ---------- */
  return (
    <div className="max-w-6xl mx-auto px-8 py-8 anim-fade">
      {view === 'passport' ? (
        <>
          <Link
            href="/"
            className="text-xs hover:underline inline-block mb-3"
            style={{ color: 'var(--soft)' }}
          >
            {tr(lang, 'pgBack')}
          </Link>
          <BookPassport
            id={book.id}
            title={book.title}
            coverBase64={book.coverBase64}
            annotation={book.annotation}
            synopsis={book.synopsis}
            series={seriesList}
            seriesId={book.seriesId}
          />

          <div className="flex flex-wrap gap-2 mt-4">
            <span className="chip"><BookOpen size={12} /> {tr(lang, 'pgChapters')}: {chapters.length}</span>
            <span className="chip"><Feather size={12} /> {tr(lang, 'pgWords')}: {totalWords.toLocaleString('ru-RU')}</span>
            <span className="chip"><Type size={12} /> {tr(lang, 'pgChars')}: {totalChars.toLocaleString('ru-RU')}</span>
            <span className="chip"><Users size={12} /> {tr(lang, 'pgCharacters')}: {characters.length}</span>
            <span className="chip"><Globe2 size={12} /> {tr(lang, 'pgLore')}: {lore.length}</span>
            <span className="chip"><MapPin size={12} /> {tr(lang, 'pgLocations')}: {locations.length}</span>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <DeleteButton
              onConfirm={async () => {
                'use server'
                await deleteBook(book.id)
              }}
              label={tr(lang, 'pgDeleteBook')}
              confirmText={tr(lang, 'pgDeleteBookConfirm')}
              thenGo="/"
            />
            <ExportButton bookId={id} baseName={book.title} primary />
          </div>
        </>
      ) : (
        <>
          {view === 'chapters' && chaptersSection}
          {view === 'characters' && charactersSection}
          {view === 'world' && worldSection}
          {view === 'locations' && locationsSection}
          {view === 'timeline' && timelineSection}
          {view === 'graph' && graphSection}
        </>
      )}
    </div>
  )
}