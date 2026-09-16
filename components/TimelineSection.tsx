'use client'

import { useMemo, useState } from 'react'
import { CalendarDays, BookOpen, Plus, Save, Trash2, Feather, Users } from 'lucide-react'
import {
  createTimelineEvent,
  saveTimelineEvent,
  deleteTimelineEvent,
  addEventCharacter,
  removeEventCharacter,
} from '@/lib/actions'
import type { TimelineRow } from '@/lib/actions'
import TimelineVisual from './TimelineVisual'
import { useLang } from '@/lib/useLang'

type TypeKey = 'calendar' | 'book'

const bookKey = (e: TimelineRow) => (e.bookYear ?? 0) * 100000 + (e.bookDay ?? 0)

const toInt = (v: FormDataEntryValue | null): number | null => {
  if (!v) return null
  const n = parseInt(String(v), 10)
  return Number.isFinite(n) ? n : null
}

function TypeSwitch({ value, onChange }: { value: TypeKey; onChange: (v: TypeKey) => void }) {
  const { t } = useLang()
  return (
    <div className="tabs-bar" style={{ padding: '.25rem' }}>
      <button
        type="button"
        onClick={() => onChange('calendar')}
        className={`tab flex items-center gap-1.5 ${value === 'calendar' ? 'tab-active' : ''}`}
        style={{ padding: '.35rem .8rem', fontSize: '.8rem' }}
      >
        <CalendarDays size={13} /> {t('tlCalendar')}
      </button>
      <button
        type="button"
        onClick={() => onChange('book')}
        className={`tab flex items-center gap-1.5 ${value === 'book' ? 'tab-active' : ''}`}
        style={{ padding: '.35rem .8rem', fontSize: '.8rem' }}
      >
        <BookOpen size={13} /> {t('tlBook')}
      </button>
    </div>
  )
}

function DateFields({ type, date, bookYear, bookDay }: { type: TypeKey; date: string; bookYear: number | null; bookDay: number | null }) {
  const { t } = useLang()
  return (
    <>
      <div hidden={type !== 'calendar'} className="flex flex-wrap items-center gap-2">
        <span className="field-label" style={{ marginBottom: 0 }}>{t('tlDate')}</span>
        <input type="date" name="date" defaultValue={date} className="input w-auto" />
      </div>
      <div hidden={type !== 'book'} className="flex flex-wrap items-center gap-2">
        <span className="field-label" style={{ marginBottom: 0 }}>{t('tlYear')}</span>
        <input type="number" min={0} name="bookYear" defaultValue={bookYear ?? ''} className="input w-24" placeholder="—" />
        <span className="field-label" style={{ marginBottom: 0 }}>{t('tlDay')}</span>
        <input type="number" min={0} name="bookDay" defaultValue={bookDay ?? ''} className="input w-28" placeholder="0" />
      </div>
    </>
  )
}

function ParticipantChips({ eventId, participantIds, characters }: { eventId: string; participantIds: string[]; characters: { id: string; name: string }[] }) {
  const { t } = useLang()
  if (characters.length === 0) return null
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: 'var(--soft)' }}>
        <Users size={12} /> {t('tlParticipants')}
      </span>
      {characters.map((c) => {
        const linked = participantIds.includes(c.id)
        return (
          <button
            key={c.id}
            type="button"
            onClick={async () => {
              if (linked) await removeEventCharacter(eventId, c.id)
              else await addEventCharacter(eventId, c.id)
            }}
            className={`chip-btn ${linked ? 'chip-btn-active' : ''}`}
          >
            {c.name}
          </button>
        )
      })}
    </div>
  )
}

function CreateForm({ bookId, chapters }: { bookId: string; chapters: { id: string; title: string }[] }) {
  const { t } = useLang()
  const [type, setType] = useState<TypeKey>('calendar')
  const today = new Date().toISOString().split('T')[0]

  return (
    <form
      action={async (fd: FormData) => {
        await createTimelineEvent(bookId, {
          dateType: (fd.get('dateType') as string) === 'book' ? 'book' : 'calendar',
          date: (fd.get('date') as string) ?? '',
          bookYear: toInt(fd.get('bookYear')),
          bookDay: toInt(fd.get('bookDay')),
          description: (fd.get('description') as string) ?? '',
          summary: (fd.get('summary') as string) ?? '',
          chapterId: (fd.get('chapterId') as string) || null,
        })
      }}
      className="card p-4 space-y-3 mb-6"
    >
      <div className="field-label">{t('tlNew')}</div>
      <input type="hidden" name="dateType" value={type} />
      <div className="flex flex-wrap items-center gap-3">
        <TypeSwitch value={type} onChange={setType} />
      </div>
      <DateFields type={type} date={today} bookYear={null} bookDay={null} />
      <div className="grid md:grid-cols-2 gap-2">
        <input name="description" className="input" placeholder={t('tlNamePh')} />
        <select name="chapterId" className="input" defaultValue="">
          <option value="">{t('tlChapterNone')}</option>
          {chapters.map((c) => (
            <option key={c.id} value={c.id}>{c.title}</option>
          ))}
        </select>
      </div>
      <input name="summary" className="input" placeholder={t('tlSummaryPh')} />
      <div className="flex justify-end">
        <button className="btn btn-primary btn-sm">
          <Plus size={14} /> {t('tlAdd')}
        </button>
      </div>
    </form>
  )
}

function EventCard({ event, chapters, characters }: { event: TimelineRow; chapters: { id: string; title: string }[]; characters: { id: string; name: string }[] }) {
  const { t } = useLang()
  const [type, setType] = useState<TypeKey>(event.dateType)

  return (
    <div className="tl-item">
      <form
        action={async (fd: FormData) => {
          await saveTimelineEvent(event.id, {
            dateType: (fd.get('dateType') as string) === 'book' ? 'book' : 'calendar',
            date: (fd.get('date') as string) ?? '',
            bookYear: toInt(fd.get('bookYear')),
            bookDay: toInt(fd.get('bookDay')),
            description: (fd.get('description') as string) ?? '',
            summary: (fd.get('summary') as string) ?? '',
            chapterId: (fd.get('chapterId') as string) || null,
          })
        }}
        className="card p-4 space-y-3"
      >
        <input type="hidden" name="dateType" value={type} />
        <div className="flex flex-wrap items-center gap-3">
          <TypeSwitch value={type} onChange={setType} />
          <div className="flex-1" />
          <button
            type="button"
            title={t('tlDeleteConfirm')}
            onClick={async () => {
              if (window.confirm(t('tlDeleteConfirm'))) await deleteTimelineEvent(event.id)
            }}
            className="btn btn-ghost btn-sm"
          >
            <Trash2 size={13} />
          </button>
          <button type="submit" className="btn btn-ghost btn-sm">
            <Save size={13} /> {t('tlSave')}
          </button>
        </div>
        <DateFields type={type} date={event.date} bookYear={event.bookYear} bookDay={event.bookDay} />
        <div className="grid md:grid-cols-2 gap-2">
          <input name="description" defaultValue={event.description} className="input" placeholder={t('tlNamePh')} />
          <select name="chapterId" defaultValue={event.chapterId ?? ''} className="input">
            <option value="">{t('tlChapterNone')}</option>
            {chapters.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <input name="summary" defaultValue={event.summary} className="input" placeholder={t('tlSummaryPh')} />
      </form>
      <div className="mt-2 pl-2 space-y-2">
        <ParticipantChips eventId={event.id} participantIds={event.participantIds} characters={characters} />
        {event.mentionChapters.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-semibold" style={{ color: 'var(--soft)' }}>{t('tlInChapters')}</span>
            {event.mentionChapters.map((tl, i) => (
              <span key={i} className="chip chip-mention">{tl}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function TimelineSection({
  bookId,
  events,
  chapters,
  characters,
}: {
  bookId: string
  events: TimelineRow[]
  chapters: { id: string; title: string }[]
  characters: { id: string; name: string }[]
}) {
  const { t } = useLang()
  const [view, setView] = useState<'all' | 'calendar' | 'book'>('all')

  const cal = useMemo(
    () => events.filter((e) => e.dateType === 'calendar').sort((a, b) => a.date.localeCompare(b.date)),
    [events],
  )
  const book = useMemo(
    () => events.filter((e) => e.dateType === 'book').sort((a, b) => bookKey(a) - bookKey(b)),
    [events],
  )

  const showCal = view !== 'book'
  const showBook = view !== 'calendar'

  return (
    <div>
      <CreateForm bookId={bookId} chapters={chapters} />

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs font-semibold" style={{ color: 'var(--soft)' }}>{t('tlView')}</span>
        <button type="button" onClick={() => setView('all')} className={`chip-btn ${view === 'all' ? 'chip-btn-active' : ''}`}>
          {t('tlAll')} ({events.length})
        </button>
        <button type="button" onClick={() => setView('calendar')} className={`chip-btn flex items-center gap-1.5 ${view === 'calendar' ? 'chip-btn-active' : ''}`}>
          <CalendarDays size={11} /> {t('tlCalendar')} ({cal.length})
        </button>
        <button type="button" onClick={() => setView('book')} className={`chip-btn flex items-center gap-1.5 ${view === 'book' ? 'chip-btn-active' : ''}`}>
          <BookOpen size={11} /> {t('tlBook')} ({book.length})
        </button>
      </div>

      {events.length === 0 && (
        <div className="card p-10 text-center text-sm" style={{ color: 'var(--soft)' }}>
          {t('tlEmpty')}
        </div>
      )}

      {showCal && cal.length > 0 && (
        <section className="mb-10">
          {view === 'all' && book.length > 0 && (
            <h4 className="text-sm font-bold mb-3 flex items-center gap-1.5" style={{ color: 'var(--soft)' }}>
              <CalendarDays size={13} /> {t('tlCalSection')}
            </h4>
          )}
          <TimelineVisual events={cal} type="calendar" />
        </section>
      )}

      {showBook && book.length > 0 && (
        <section className="mb-10">
          {view === 'all' && cal.length > 0 && (
            <h4 className="text-sm font-bold mb-3 flex items-center gap-1.5" style={{ color: 'var(--soft)' }}>
              <BookOpen size={13} /> {t('tlBookSection')}
            </h4>
          )}
          <TimelineVisual events={book} type="book" />
        </section>
      )}

      <div className="mt-12">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Feather size={16} /> {t('tlEditHead')}
        </h3>
        <div className="tl">
          {events.map((e) => (
            <EventCard key={e.id} event={e} chapters={chapters} characters={characters} />
          ))}
        </div>
      </div>
    </div>
  )
}