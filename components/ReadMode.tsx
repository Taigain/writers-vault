'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BookOpen, ChevronLeft, ChevronRight, X } from 'lucide-react'
import RichPreview from './RichPreview'
import { useLang } from '@/lib/useLang'

export type ReadChapter = { id: string; title: string; content: string; act: string | null }

export default function ReadMode({ bookTitle, chapters }: { bookTitle: string; chapters: ReadChapter[] }) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const [idx, setIdx] = useState(0)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
      if (e.key === 'ArrowRight') setIdx((i) => Math.min(chapters.length - 1, i + 1))
      if (e.key === 'ArrowLeft') setIdx((i) => Math.max(0, i - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, chapters.length])

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
  }, [idx, open])

  if (chapters.length === 0) return null
  const cur = chapters[Math.min(idx, chapters.length - 1)]
  const prev = () => setIdx((i) => Math.max(0, i - 1))
  const next = () => setIdx((i) => Math.min(chapters.length - 1, i + 1))

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-sm"
        onClick={() => {
          setIdx(0)
          setOpen(true)
        }}
      >
        <BookOpen size={14} /> {t('rdOpen')}
      </button>
      {open &&
        createPortal(
          <div
            ref={scrollRef}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 140,
              background: '#ffffff',
              color: '#201c17',
              overflowY: 'auto',
            }}
          >
            <div style={{ width: '80%', maxWidth: '46rem', margin: '0 auto', padding: '1.5rem 0 35vh' }}>
              <div
                className="flex flex-wrap items-center gap-2"
                style={{
                  position: 'sticky',
                  top: 0,
                  background: '#ffffff',
                  padding: '.75rem 0',
                  zIndex: 2,
                  marginBottom: '1.5rem',
                }}
              >
                <button type="button" className="mini-btn" title={t('rdClose')} onClick={() => setOpen(false)}>
                  <X size={16} />
                </button>
                <span className="text-sm font-bold flex-1 truncate">{bookTitle}</span>
                <button type="button" className="mini-btn" title={t('rdPrev')} disabled={idx <= 0} onClick={prev}>
                  <ChevronLeft size={16} />
                </button>
                <select
                  className="act-select"
                  value={Math.min(idx, chapters.length - 1)}
                  onChange={(e) => setIdx(Number(e.target.value))}
                >
                  {chapters.map((c, i) => (
                    <option key={c.id} value={i}>
                      {c.act ? c.act + ' · ' : ''}
                      {c.title}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="mini-btn"
                  title={t('rdNext')}
                  disabled={idx >= chapters.length - 1}
                  onClick={next}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
              {cur.act && (
                <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#8a7a5a' }}>
                  {cur.act}
                </div>
              )}
              <h2 className="text-2xl font-bold mb-6">{cur.title}</h2>
              <div className="font-write text-lg leading-8">
                <RichPreview text={cur.content} />
              </div>
              <div className="flex justify-between mt-10">
                <button type="button" className="btn btn-ghost btn-sm" disabled={idx <= 0} onClick={prev}>
                  <ChevronLeft size={14} /> {t('rdPrev')}
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={idx >= chapters.length - 1}
                  onClick={next}
                >
                  {t('rdNext')} <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}