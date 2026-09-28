'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BookOpen, ChevronLeft, ChevronRight, X, List } from 'lucide-react'
import RichPreview from './RichPreview'
import { useLang } from '@/lib/useLang'
import { getBookReadData } from '@/lib/actions'
import { applyDict, type DictMap } from '@/lib/dict'

export type ReadChapter = { id: string; title: string; content: string; act: string | null }

export default function ReadMode({
  bookId,
  bookTitle,
  chapters: chaptersProp,
  dict,
}: {
  bookId?: string
  bookTitle: string
  chapters?: ReadChapter[] | null
  dict?: DictMap
}) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState<ReadChapter[] | null>(null)
  const [idx, setIdx] = useState(0)
  const [listOpen, setListOpen] = useState(false)
  const boxRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  const chapters = chaptersProp ?? loaded

  const openReader = async () => {
    setOpen(true)
    if (!chapters && bookId) setLoaded(await getBookReadData(bookId))
  }

  const closeReader = async () => {
    setOpen(false)
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen()
      } catch {
        /* уже в оконном режиме */
      }
    }
  }

  useEffect(() => {
    if (!open) return
    boxRef.current?.requestFullscreen?.().catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    const onFs = () => {
      if (!document.fullscreenElement) setOpen(false)
    }
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIdx((i) => Math.min(i + 1, (chapters?.length ?? 1) - 1))
      if (e.key === 'ArrowLeft') setIdx((i) => Math.max(i - 1, 0))
      if (e.key === 'Escape' && !document.fullscreenElement) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, chapters])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [idx])

  const cur = chapters?.[idx] ?? null

  return (
    <>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => void openReader()}>
        <BookOpen size={14} /> {t('rdOpen')}
      </button>
      {open &&
        createPortal(
          <div
            ref={boxRef}
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 140,
              background: 'var(--bg, #f5f0e8)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2 border-b"
              style={{ borderColor: 'var(--line)', background: 'var(--card)' }}
            >
              <button type="button" className="mini-btn" title={t('rdClose')} onClick={() => void closeReader()}>
                <X size={15} />
              </button>
              <button type="button" className="mini-btn" title={t('rdList')} onClick={() => setListOpen(!listOpen)}>
                <List size={15} />
              </button>
              <span className="font-bold truncate flex-1 text-center">{bookTitle}</span>
              <span className="text-xs" style={{ color: 'var(--soft)' }}>
                {chapters ? `${idx + 1} / ${chapters.length}` : '…'}
              </span>
            </div>
            <div ref={scrollRef} style={{ flex: '1 1 auto', overflowY: 'auto' }}>
              <div className="max-w-3xl mx-auto px-6 py-6">
                {listOpen && chapters && (
                  <div className="card p-3 mb-5 space-y-1">
                    {chapters.map((ch, i) => (
                      <button
                        key={ch.id}
                        type="button"
                        className="btn btn-ghost btn-sm w-full justify-start"
                        style={i === idx ? { background: 'var(--soft-bg)', fontWeight: 700 } : undefined}
                        onClick={() => {
                          setIdx(i)
                          setListOpen(false)
                        }}
                      >
                        {ch.act ? `${ch.act} · ` : ''}
                        {ch.title}
                      </button>
                    ))}
                  </div>
                )}
                {!chapters && (
                  <div className="card p-10 text-center text-sm" style={{ color: 'var(--soft)' }}>
                    …
                  </div>
                )}
                {cur && (
                  <>
                    {cur.act && (
                      <div
                        className="text-xs font-bold uppercase tracking-wider mb-2"
                        style={{ color: 'var(--gold)' }}
                      >
                        {cur.act}
                      </div>
                    )}
                    <h2 className="text-xl font-bold mb-4">{cur.title}</h2>
                    <RichPreview text={applyDict(cur.content, dict ?? {})} />
                  </>
                )}
                <div className="flex items-center justify-between gap-2 mt-8 pb-8">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={idx <= 0}
                    onClick={() => setIdx((i) => Math.max(i - 1, 0))}
                  >
                    <ChevronLeft size={14} /> {t('rdPrev')}
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm"
                    disabled={!chapters || idx >= chapters.length - 1}
                    onClick={() => setIdx((i) => Math.min(i + 1, (chapters?.length ?? 1) - 1))}
                  >
                    {t('rdNext')} <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}