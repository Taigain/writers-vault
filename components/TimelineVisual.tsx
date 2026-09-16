'use client'

import { CalendarDays, BookOpen, Feather } from 'lucide-react'
import type { TimelineRow } from '@/lib/actions'
import { useLang } from '@/lib/useLang'
import { fmtCalendarShort, fmtBookDate } from '@/lib/i18n'

type VisualProps = {
  events: TimelineRow[]
  type: 'calendar' | 'book'
}

function sortKey(e: TimelineRow): number {
  if (e.dateType === 'calendar') {
    const t = new Date(e.date || '1970-01-01').getTime()
    return Number.isFinite(t) ? t : 0
  }
  return (e.bookYear ?? 0) * 1_000_000 + (e.bookDay ?? 0)
}

function pinTitle(e: TimelineRow): string {
  if (e.chapterId && e.chapterTitle) return e.chapterTitle
  return e.description || '—'
}

function pinSummary(e: TimelineRow): string {
  if (e.chapterId && e.chapterFirstSentence) return e.chapterFirstSentence
  return e.summary || e.description || '—'
}

export default function TimelineVisual({ events, type }: VisualProps) {
  const { lang, t } = useLang()
  const sorted = [...events].sort((a, b) => sortKey(a) - sortKey(b))

  if (sorted.length === 0) return null

  const dateLabel = (e: TimelineRow): string => {
    if (type === 'calendar') {
      return e.date ? fmtCalendarShort(lang, e.date) : t('tvNoDate')
    }
    return fmtBookDate(lang, e.bookYear, e.bookDay ?? 0)
  }

  return (
    <div className="tv-wrap" data-type={type}>
      <div className="tv-line" />
      <div className="tv-pins">
        {sorted.map((e, i) => {
          const isChapter = Boolean(e.chapterId)
          const side = i % 2 === 0 ? 'top' : 'bottom'
          return (
            <div key={e.id} className={`tv-pin tv-pin-${side} ${isChapter ? 'tv-chapter' : 'tv-event'}`}>
              <div className="tv-tape" />
              <div className="tv-date">
                {type === 'calendar' ? <CalendarDays size={11} /> : <BookOpen size={11} />}
                {dateLabel(e)}
              </div>
              <div className="tv-title">
                {isChapter && <Feather size={13} />}
                {pinTitle(e)}
              </div>
              <p className="tv-summary">{pinSummary(e)}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}