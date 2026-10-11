'use client'

import { BookOpen, BookOpenText, CalendarDays, Users, Hash } from 'lucide-react'
import type { TimelineRow } from '@/lib/actions'

export default function TimelineCard({
  row,
  dateLabel,
  icon,
}: {
  row: TimelineRow
  dateLabel: string
  icon: 'calendar' | 'book'
}) {
  const title = row.description || row.chapterTitle || '—'
  const extra = row.participants.length - 4
  return (
    <div className="tl-card">
      <div className="tl-card-date">
        {icon === 'calendar' ? <CalendarDays size={11} /> : <BookOpen size={11} />}
        {dateLabel}
      </div>
      <div className="tl-card-title">{title}</div>
      {row.tag && (
        <span className="chip tl-card-tag">
          <Hash size={10} /> {row.tag.replace(/^#/, '')}
        </span>
      )}
      {row.summary ? (
        <p className="tl-card-summary">{row.summary}</p>
      ) : row.chapterFirstSentence ? (
        <p className="tl-card-summary tl-card-fallback">{row.chapterFirstSentence}</p>
      ) : null}
      <div className="tl-card-meta">
        {row.chapterTitle && title !== row.chapterTitle && (
          <span className="tl-card-line">
            <BookOpenText size={12} /> {row.chapterTitle}
          </span>
        )}
        {row.participants.length > 0 && (
          <span className="tl-card-line">
            <Users size={12} />
            {row.participants.slice(0, 4).map((p) => (
              <span key={p.id} className="chip tl-chip">
                {p.name}
              </span>
            ))}
            {extra > 0 && <span className="chip tl-chip">+{extra}</span>}
          </span>
        )}
      </div>
    </div>
  )
}