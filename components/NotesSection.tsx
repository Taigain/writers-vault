'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Plus, Save, Trash2, X, List, LayoutGrid, ChevronRight, Image as ImageIcon } from 'lucide-react'
import ImageAttach from './ImageAttach'
import { useLang } from '@/lib/useLang'
import { createNote, saveNote, deleteNote, moveNote, toggleNoteDone } from '@/lib/actions'
import type { NoteRow } from '@/lib/actions'

const KINDS = ['char', 'loc', 'event', 'plot', 'other'] as const
type Kind = (typeof KINDS)[number]

const KIND_COLOR: Record<Kind, string> = {
  char: '#8c3a2b',
  loc: '#a9812f',
  event: '#4c3d8f',
  plot: '#2f6d4f',
  other: '#6f665c',
}

const KIND_KEY: Record<Kind, 'ntKindChar' | 'ntKindLoc' | 'ntKindEvent' | 'ntKindPlot' | 'ntKindOther'> = {
  char: 'ntKindChar',
  loc: 'ntKindLoc',
  event: 'ntKindEvent',
  plot: 'ntKindPlot',
  other: 'ntKindOther',
}

const kindOf = (n: NoteRow): Kind => (KINDS as readonly string[]).includes(n.kind) ? (n.kind as Kind) : 'other'
const sig = (n: NoteRow) => `${n.title}|${n.text}|${n.kind}|${n.done}|${n.imageBase64 ? 1 : 0}`
const fallbackPos = (i: number) => ({ x: 24 + (i % 4) * 230, y: 24 + Math.floor(i / 4) * 170 })

function NoteEditor({ note }: { note: NoteRow }) {
  const { t } = useLang()
  const kind = kindOf(note)
  return (
    <form
      className="space-y-3"
      action={async (fd) => {
        await saveNote(note.id, fd)
      }}
    >
      <input name="title" defaultValue={note.title} className="input font-semibold" placeholder={t('ntTitlePh')} />
      <div className="flex flex-wrap items-center gap-3">
        <select name="kind" defaultValue={kind} className="input" style={{ width: 'auto' }}>
          {KINDS.map((k) => (
            <option key={k} value={k}>{t(KIND_KEY[k])}</option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-xs cursor-pointer select-none" style={{ color: 'var(--soft)' }}>
          <input type="checkbox" name="done" defaultChecked={note.done} value="1" />
          {t('ntDone')}
        </label>
      </div>
      <textarea name="text" defaultValue={note.text} rows={5} className="textarea text-sm" placeholder={t('ntTextPh')} />
      <ImageAttach
        name="image"
        value={note.imageBase64}
        maxDim={1200}
        labelAttach={t('ntImgAttach')}
        labelReplace={t('ntImgReplace')}
        labelRemove={t('ntImgRemove')}
      />
      <div className="flex justify-end">
        <button type="submit" className="btn btn-primary btn-sm">
          <Save size={13} /> {t('ntSave')}
        </button>
      </div>
    </form>
  )
}

export default function NotesSection({ bookId, notes }: { bookId: string; notes: NoteRow[] }) {
  const { t } = useLang()
  const [view, setView] = useState<'list' | 'board'>('list')
  const [modalId, setModalId] = useState<string | null>(null)
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>({})
  const posRef = useRef(pos)
  const boardRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{ id: string; dx: number; dy: number; startX: number; startY: number; moved: boolean } | null>(null)

  useEffect(() => {
    const v = localStorage.getItem('wv-notes-view-' + bookId)
    if (v === 'board' || v === 'list') setView(v)
  }, [bookId])

  useEffect(() => {
    posRef.current = pos
  }, [pos])

  useEffect(() => {
    setPos((prev) => {
      const next = { ...prev }
      notes.forEach((n, i) => {
        if (!next[n.id]) {
          next[n.id] = n.posX != null && n.posY != null ? { x: n.posX, y: n.posY } : fallbackPos(i)
        }
      })
      return next
    })
  }, [notes])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current
      const board = boardRef.current
      if (!d || !board) return
      const rect = board.getBoundingClientRect()
      if (Math.abs(e.clientX - d.startX) + Math.abs(e.clientY - d.startY) > 4) d.moved = true
      const x = Math.min(rect.width - 220, Math.max(0, Math.round(e.clientX - rect.left - d.dx)))
      const y = Math.min(rect.height - 110, Math.max(0, Math.round(e.clientY - rect.top - d.dy)))
      setPos((p) => ({ ...p, [d.id]: { x, y } }))
    }
    const onUp = () => {
      const d = dragRef.current
      if (!d) return
      dragRef.current = null
      if (d.moved) {
        const p = posRef.current[d.id]
        if (p) void moveNote(d.id, p.x, p.y)
      } else {
        setModalId(d.id)
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const startDrag = (e: React.MouseEvent, id: string) => {
    if (e.button !== 0) return
    const board = boardRef.current
    if (!board) return
    e.preventDefault()
    const rect = board.getBoundingClientRect()
    const p = pos[id] ?? { x: 0, y: 0 }
    dragRef.current = {
      id,
      dx: e.clientX - rect.left - p.x,
      dy: e.clientY - rect.top - p.y,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    }
  }

  const switchView = (v: 'list' | 'board') => {
    setView(v)
    localStorage.setItem('wv-notes-view-' + bookId, v)
  }

  const modalNote = modalId ? notes.find((n) => n.id === modalId) ?? null : null

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button
          type="button"
          className={`chip-btn ${view === 'list' ? 'chip-btn-active' : ''}`}
          onClick={() => switchView('list')}
        >
          <List size={13} /> {t('ntViewList')}
        </button>
        <button
          type="button"
          className={`chip-btn ${view === 'board' ? 'chip-btn-active' : ''}`}
          onClick={() => switchView('board')}
        >
          <LayoutGrid size={13} /> {t('ntViewBoard')}
        </button>
        <span className="flex-1" />
        <form className="flex flex-wrap gap-2" action={async (fd) => { await createNote(bookId, fd) }}>
          <input name="title" className="input" style={{ width: '14rem' }} placeholder={t('ntTitlePh')} />
          <button className="btn btn-primary btn-sm">
            <Plus size={14} /> {t('ntAdd')}
          </button>
        </form>
      </div>

      {notes.length === 0 && (
        <div className="card p-10 text-center text-sm" style={{ color: 'var(--soft)' }}>
          {t('ntEmpty')}
        </div>
      )}

      {view === 'list' && notes.length > 0 && (
        <div className="space-y-4">
          {notes.map((n) => {
            const kind = kindOf(n)
            return (
              <details key={n.id} className="acc">
                <summary className="acc-head">
                  <ChevronRight size={18} className="acc-chev" />
                  <button
                    type="button"
                    className="mini-btn"
                    title={t('ntDone')}
                    onClick={async (e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      await toggleNoteDone(n.id)
                    }}
                  >
                    <Check16 done={n.done} />
                  </button>
                  <i className="graph-dot" style={{ background: KIND_COLOR[kind] }} />
                  <span className={`acc-title ${n.done ? 'line-through opacity-60' : ''}`}>
                    {n.title || t('ntUntitled')}
                  </span>
                  <span className="chip">{t(KIND_KEY[kind])}</span>
                  {n.imageBase64 && <ImageIcon size={13} style={{ color: 'var(--soft)' }} />}
                </summary>
                <div className="acc-body">
                  <div className="pt-4">
                    {n.imageBase64 && (
                      <img src={n.imageBase64} alt="" className="rounded-lg mb-3 w-full max-h-56 object-cover" />
                    )}
                    <NoteEditor key={sig(n)} note={n} />
                    <div className="flex justify-end mt-2">
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={async () => {
                          if (window.confirm(t('ntDeleteConfirm', { title: n.title || t('ntUntitled') }))) {
                            await deleteNote(n.id)
                          }
                        }}
                      >
                        <Trash2 size={13} /> {t('ntDelete')}
                      </button>
                    </div>
                  </div>
                </div>
              </details>
            )
          })}
        </div>
      )}

      {view === 'board' && notes.length > 0 && (
        <div ref={boardRef} className="note-board">
          {notes.map((n, i) => {
            const kind = kindOf(n)
            const p = pos[n.id] ?? fallbackPos(i)
            return (
              <div
                key={n.id}
                className="note-card"
                style={{ left: p.x, top: p.y, width: 210 }}
                onMouseDown={(e) => startDrag(e, n.id)}
              >
                <div className="flex items-center gap-1.5">
                  <i className="graph-dot" style={{ background: KIND_COLOR[kind] }} />
                  <span className={`text-xs font-semibold flex-1 truncate ${n.done ? 'line-through opacity-60' : ''}`}>
                    {n.title || t('ntUntitled')}
                  </span>
                  {n.imageBase64 && <ImageIcon size={12} style={{ color: 'var(--soft)' }} />}
                </div>
                {n.text && (
                  <div className="note-clamp text-[11px] mt-1" style={{ color: 'var(--soft)' }}>
                    {n.text}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {modalNote &&
        createPortal(
          <div
            className="fixed inset-0 flex items-center justify-center p-4"
            style={{ zIndex: 150, background: 'rgba(20,16,12,.55)' }}
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setModalId(null)
            }}
          >
            <div className="card p-5 w-full max-w-lg overflow-auto" style={{ maxHeight: '85vh' }}>
              <div className="flex items-center gap-2 mb-3">
                <i className="graph-dot" style={{ background: KIND_COLOR[kindOf(modalNote)] }} />
                <span className="text-sm font-bold flex-1">{modalNote.title || t('ntUntitled')}</span>
                <button type="button" className="mini-btn" title={t('ntClose')} onClick={() => setModalId(null)}>
                  <X size={15} />
                </button>
              </div>
              {modalNote.imageBase64 && (
                <img src={modalNote.imageBase64} alt="" className="rounded-lg mb-3 w-full max-h-56 object-cover" />
              )}
              <NoteEditor key={sig(modalNote)} note={modalNote} />
              <div className="flex justify-end mt-3 pt-3 border-t" style={{ borderColor: 'var(--line)' }}>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={async () => {
                    if (window.confirm(t('ntDeleteConfirm', { title: modalNote.title || t('ntUntitled') }))) {
                      setModalId(null)
                      await deleteNote(modalNote.id)
                    }
                  }}
                >
                  <Trash2 size={13} /> {t('ntDelete')}
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}

function Check16({ done }: { done: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={done ? '#2f6d4f' : 'currentColor'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: done ? 1 : 0.35 }}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}