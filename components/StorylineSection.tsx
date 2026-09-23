'use client'

import { ChevronRight, Plus, Save, Trash2, ArrowUp, ArrowDown, GitBranch } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import {
  createStoryline,
  saveStoryline,
  deleteStoryline,
  moveStoryline,
  createBeat,
  saveBeat,
  deleteBeat,
  moveBeat,
} from '@/lib/actions'
import type { StorylineRow } from '@/lib/actions'

export type ChapterOpt = { id: string; title: string; order: number }
export type EventOpt = { id: string; label: string; bookYear: number | null; bookDay: number | null }

export default function StorylineSection({
  bookId,
  lines,
  chapters,
  events,
}: {
  bookId: string
  lines: StorylineRow[]
  chapters: ChapterOpt[]
  events: EventOpt[]
}) {
  const { t } = useLang()
  return (
    <div>
      <form className="flex flex-wrap gap-2 mb-4" action={async (fd) => { await createStoryline(bookId, fd) }}>
        <input name="name" required className="input" style={{ width: '16rem' }} placeholder={t('slNamePh')} />
        <button className="btn btn-primary btn-sm">
          <Plus size={14} /> {t('slAdd')}
        </button>
      </form>
      {lines.length === 0 && (
        <div className="card p-10 text-center text-sm" style={{ color: 'var(--soft)' }}>
          {t('slEmpty')}
        </div>
      )}
      <div className="space-y-4">
        {lines.map((ln, li) => (
          <details key={ln.id} className="acc">
            <summary className="acc-head">
              <ChevronRight size={18} className="acc-chev" />
              <span className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="mini-btn"
                  disabled={li <= 0}
                  onClick={async () => { await moveStoryline(ln.id, -1) }}
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  className="mini-btn"
                  disabled={li >= lines.length - 1}
                  onClick={async () => { await moveStoryline(ln.id, 1) }}
                >
                  <ArrowDown size={14} />
                </button>
              </span>
              <GitBranch size={15} style={{ color: 'var(--gold)' }} />
              <span className="acc-title">{ln.name}</span>
              <span className="chip">{ln.beats.length} {t('slBeats')}</span>
            </summary>
            <div className="acc-body">
              <div className="space-y-3 pt-4">
                <form className="flex flex-wrap gap-2" action={async (fd) => { await saveStoryline(ln.id, fd) }}>
                  <input name="name" defaultValue={ln.name} className="input font-semibold flex-1 min-w-[200px]" />
                  <button type="submit" className="btn btn-primary btn-sm">
                    <Save size={13} /> {t('slSave')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    onClick={async () => {
                      if (window.confirm(t('slDeleteConfirm', { name: ln.name }))) await deleteStoryline(ln.id)
                    }}
                  >
                    <Trash2 size={13} /> {t('slDelete')}
                  </button>
                </form>
                {ln.beats.map((b, bi) => {
                  const ev = events.find((e) => e.id === b.eventId) ?? null
                  return (
                    <details key={b.id} className="acc">
                      <summary className="acc-head">
                        <ChevronRight size={16} className="acc-chev" />
                        <span className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            className="mini-btn"
                            disabled={bi <= 0}
                            onClick={async () => { await moveBeat(ln.id, b.id, -1) }}
                          >
                            <ArrowUp size={13} />
                          </button>
                          <button
                            type="button"
                            className="mini-btn"
                            disabled={bi >= ln.beats.length - 1}
                            onClick={async () => { await moveBeat(ln.id, b.id, 1) }}
                          >
                            <ArrowDown size={13} />
                          </button>
                        </span>
                        <span className="acc-title">{b.title || t('slUntitledBeat')}</span>
                        {b.chapterOrder != null && <span className="chip">{t('slChipCh', { n: b.chapterOrder })}</span>}
                        {ev && (
                          <span className="chip">
                            {ev.bookYear != null
                              ? t('slChipBookTime', { y: String(ev.bookYear), d: String(ev.bookDay ?? '—') })
                              : t('slChipEvent', { label: ev.label })}
                          </span>
                        )}
                      </summary>
                      <div className="acc-body">
                        <form className="space-y-3 pt-3" action={async (fd) => { await saveBeat(b.id, fd) }}>
                          <input name="title" defaultValue={b.title} className="input font-semibold" placeholder={t('slBeatTitlePh')} />
                          <textarea
                            name="summary"
                            defaultValue={b.summary}
                            rows={3}
                            className="textarea text-sm"
                            placeholder={t('slBeatSummaryPh')}
                          />
                          <div className="flex flex-wrap gap-2">
                            <select name="chapterId" defaultValue={b.chapterId ?? ''} className="input" style={{ width: 'auto' }}>
                              <option value="">{t('slNoChapter')}</option>
                              {chapters.map((c) => (
                                <option key={c.id} value={c.id}>
                                  {c.order}. {c.title}
                                </option>
                              ))}
                            </select>
                            <select name="eventId" defaultValue={b.eventId ?? ''} className="input" style={{ width: 'auto' }}>
                              <option value="">{t('slNoEvent')}</option>
                              {events.map((e) => (
                                <option key={e.id} value={e.id}>
                                  {e.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={async () => {
                                if (window.confirm(t('slDeleteBeatConfirm'))) await deleteBeat(b.id)
                              }}
                            >
                              <Trash2 size={13} /> {t('slDeleteBeat')}
                            </button>
                            <button type="submit" className="btn btn-primary btn-sm">
                              <Save size={13} /> {t('slSave')}
                            </button>
                          </div>
                        </form>
                      </div>
                    </details>
                  )
                })}
                <form className="flex flex-wrap gap-2" action={async (fd) => { await createBeat(ln.id, fd) }}>
                  <input name="title" className="input flex-1 min-w-[200px]" placeholder={t('slBeatTitlePh')} />
                  <button className="btn btn-ghost btn-sm">
                    <Plus size={13} /> {t('slAddBeat')}
                  </button>
                </form>
              </div>
            </div>
          </details>
        ))}
      </div>
    </div>
  )
}