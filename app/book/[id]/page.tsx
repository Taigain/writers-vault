import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Save, Plus, MapPin, Globe2, BookOpen, Feather, Users, Type, ChevronRight, Upload } from 'lucide-react'
import CharacterCard from '@/components/CharacterCard'
import LoreSection from '@/components/LoreSection'
import TimelineSection from '@/components/TimelineSection'
import GraphCloud from '@/components/GraphCloud'
import BookPassport from '@/components/BookPassport'
import ChapterEditor from '@/components/ChapterEditor'
import DeleteButton from '@/components/DeleteButton'
import ExportButton from '@/components/ExportButton'
import ChapterSearch from '@/components/ChapterSearch'
import ActBar from '@/components/ActBar'
import ReadMode, { type ReadChapter } from '@/components/ReadMode'
import ZoomImage from '@/components/ZoomImage'
import ImageAttach from '@/components/ImageAttach'
import NotesSection from '@/components/NotesSection'
import StorylineSection from '@/components/StorylineSection'
import { readImageField } from '@/lib/actions'
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
  getBookBlocks,
  getNotes,
  getStorylines,
  importChaptersFromDocx,
} from '@/lib/actions'
import ImportDocxButton from '@/components/ImportDocxButton'

const words = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0)
const VIEWS = ['chapters', 'characters', 'world', 'locations', 'timeline', 'graph', 'notes', 'plot']

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string; ch?: string; q?: string; pos?: string }>
}) {
  const { id } = await params
  const { tab, ch: chParam, q, pos } = await searchParams
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
  const notes = await getNotes(id)
  const lines = await getStorylines(id)
  const chapterOptions = chapters.map((c) => ({ id: c.id, title: c.title }))
  const characterOptions = characters.map((c) => ({ id: c.id, name: c.name }))
  const totalWords = chapters.reduce((s, c) => s + words(c.title) + words(c.content), 0)
  const totalChars = chapters.reduce((s, c) => s + c.title.length + c.content.length, 0)
  const actNames: string[] = []
  for (const c of chapters) {
    if (c.actName && !actNames.includes(c.actName)) actNames.push(c.actName)
  }
  const blocks = await getBookBlocks(id)
  const readChapters: ReadChapter[] = []
  for (const b of blocks) {
    if (b.kind === 'act') {
      for (const ch of b.chs) {
        readChapters.push({ id: ch.id, title: ch.title, content: ch.content, act: b.name })
      }
    } else {
      readChapters.push({ id: b.ch.id, title: b.ch.title, content: b.ch.content, act: null })
    }
  }

  /* ---------- ГЛАВЫ ---------- */
  const importChaptersAction = async (fd: FormData) => {
    'use server'
    return importChaptersFromDocx(id, fd)
  } 
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
          <ImportDocxButton label={tr(lang, 'chImportDocx')} onFile={importChaptersAction} />
          <ReadMode bookTitle={book.title} chapters={readChapters} />
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
      <div className="space-y-6">
        {blocks.map((b, bi) =>
          b.kind === 'chapter' ? (
            <div key={'c' + b.ch.id}>
              <ChapterEditor
                id={b.ch.id}
                title={b.ch.title}
                content={b.ch.content}
                autoOpen={chParam === b.ch.id}
                highlight={chParam === b.ch.id ? q : undefined}
                focusPos={chParam === b.ch.id && pos !== undefined ? Number(pos) : undefined}
                actNames={actNames}
                actName={b.ch.actName}
                bookId={id}
                blockIndex={bi}
                blockTotal={blocks.length}
              />
            </div>
          ) : (
            <section key={'a' + b.name}>
              <ActBar bookId={id} name={b.name} blockIndex={bi} blockTotal={blocks.length} />
              <div className="space-y-4 mt-3">
                {b.chs.map((ch, ci) => (
                  <ChapterEditor
                    key={ch.id}
                    id={ch.id}
                    title={ch.title}
                    content={ch.content}
                    autoOpen={chParam === ch.id}
                    highlight={chParam === ch.id ? q : undefined}
                    focusPos={chParam === ch.id && pos !== undefined ? Number(pos) : undefined}
                    actNames={actNames}
                    actName={ch.actName}
                    bookId={id}
                    actIndex={ci}
                    actTotal={b.chs.length}
                  />
                ))}
              </div>
            </section>
          ),
        )}
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
                  <ZoomImage src={loc.imageBase64} />
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
                <ImageAttach
                  name="image"
                  value={loc.imageBase64}
                  maxDim={1400}
                  labelAttach={tr(lang, 'pgLocImgAttach')}
                  labelReplace={tr(lang, 'pgLocImgReplace')}
                  labelRemove={tr(lang, 'pgLocImgRemove')}
                />
                <div className="flex justify-end">
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Save size={13} /> {tr(lang, 'pgLocSave')}
                  </button>
                </div>
              </form>
              <div className="flex flex-wrap justify-between gap-2 mt-2">
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

  /* ---------- ЗАМЕТКИ ---------- */
  const notesSection = <NotesSection bookId={id} notes={notes} />

  /* ---------- СЮЖЕТ ---------- */
  const plotSection = (
    <StorylineSection
      bookId={id}
      lines={lines}
      chapters={chapters.map((c) => ({ id: c.id, title: c.title, order: c.order }))}
      events={timeline.map((ev) => ({
        id: ev.id,
        label: ev.description,
        bookYear: ev.bookYear,
        bookDay: ev.bookDay,
      }))}
    />
  )

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
            status={book.status}
            exportMeta={book.exportMeta}
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
          {view === 'notes' && notesSection}
          {view === 'plot' && plotSection}
        </>
      )}
    </div>
  )
}