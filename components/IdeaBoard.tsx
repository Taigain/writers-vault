'use client'

import { useRef, useState } from 'react'
import { Pin, X } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import { createIdeaNote, deleteIdeaNote, updateIdeaNote } from '@/lib/actions'

export type IdeaNoteRow = { id: string; text: string; x: number; y: number; color: string }

const COLORS = [
  '#F9E79F',
  '#F5C6B8',
  '#C8E6C9',
  '#D7C4EC',
  '#AEDCF0',
  '#F0B7CE',
  '#E5D4B4',
  '#C4CEDB',
]

const autoGrow = (el: HTMLTextAreaElement | null) => {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

export default function IdeaBoard({ notes: initial }: { notes: IdeaNoteRow[] }) {
  const { t } = useLang()
  const [notes, setNotes] = useState<IdeaNoteRow[]>(initial)
  const [modal, setModal] = useState<{ x: number; y: number } | null>(null)
  const [modalText, setModalText] = useState('')
  const [modalColor, setModalColor] = useState(COLORS[0])
  const boardRef = useRef<HTMLDivElement | null>(null)
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null)

  const openModal = (e: React.MouseEvent) => {
    const board = boardRef.current
    if (!board) return
    const r = board.getBoundingClientRect()
    const x = Math.max(0, Math.round(e.clientX - r.left - 95))
    const y = Math.max(0, Math.round(e.clientY - r.top - 16))
    setModalText('')
    setModalColor(COLORS[0])
    setModal({ x, y })
  }

  const pinNote = async () => {
    if (!modal) return
    const text = modalText.trim()
    if (!text) return
    const created = await createIdeaNote(modal.x, modal.y, text, modalColor)
    setNotes((cur) => [
      ...cur,
      { id: created.id, text: created.text, x: created.x, y: created.y, color: created.color },
    ])
    setModal(null)
  }

  const onDown = (id: string) => (e: React.PointerEvent) => {
    const board = boardRef.current
    const note = notes.find((n) => n.id === id)
    if (!board || !note) return
    const r = board.getBoundingClientRect()
    dragRef.current = { id, dx: e.clientX - r.left - note.x, dy: e.clientY - r.top - note.y }
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
  }

  const onMove = (e: React.PointerEvent) => {
    const d = dragRef.current
    const board = boardRef.current
    if (!d || !board) return
    const r = board.getBoundingClientRect()
    const nx = Math.max(0, Math.min(r.width - 190, e.clientX - r.left - d.dx))
    const ny = Math.max(0, Math.min(r.height - 60, e.clientY - r.top - d.dy))
    setNotes((cur) => cur.map((n) => (n.id === d.id ? { ...n, x: Math.round(nx), y: Math.round(ny) } : n)))
  }

  const onUp = (id: string) => () => {
    const d = dragRef.current
    dragRef.current = null
    if (!d) return
    const n = notes.find((x) => x.id === id)
    if (n) void updateIdeaNote(id, { x: n.x, y: n.y })
  }

  return (
    <>
      <div ref={boardRef} className="idea-board" onDoubleClick={openModal} onPointerMove={onMove}>
        {notes.map((n, i) => (
          <div
            key={n.id}
            className="idea-note"
            style={{ left: n.x, top: n.y, background: n.color || COLORS[i % COLORS.length] }}
            onPointerDown={onDown(n.id)}
            onPointerUp={onUp(n.id)}
          >
            <Pin className="idea-pin" size={20} fill="#8c3a2b" stroke="#5a2519" strokeWidth={1} />
            <button
              type="button"
              className="mini-btn idea-del"
              title={t('chDelete')}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={async () => {
                await deleteIdeaNote(n.id)
                setNotes((cur) => cur.filter((x) => x.id !== n.id))
              }}
            >
              <X size={11} />
            </button>
            <textarea
              ref={autoGrow}
              defaultValue={n.text}
              placeholder={t('ibPh')}
              onInput={(e) => autoGrow(e.currentTarget)}
              onPointerDown={(e) => e.stopPropagation()}
              onBlur={(e) => {
                if (e.target.value !== n.text) void updateIdeaNote(n.id, { text: e.target.value })
              }}
            />
          </div>
        ))}
      </div>
      {modal && (
        <div
          className="fixed inset-0 flex items-center justify-center p-6"
          style={{ background: 'rgba(20, 17, 14, 0.35)', zIndex: 210 }}
          onClick={() => setModal(null)}
        >
          <div className="card p-5 w-full max-w-sm space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="font-bold">{t('ibNew')}</div>
            <textarea
              autoFocus
              className="idea-modal-ta"
              style={{ background: modalColor, border: 'none', resize: 'none', color: '#201c17' }}
              rows={3}
              placeholder={t('ibPh')}
              value={modalText}
              onChange={(e) => setModalText(e.target.value)}
              onInput={(e) => autoGrow(e.currentTarget)}
            />
            <div>
              <div className="field-label">{t('cbColor')}</div>
              <div className="flex flex-wrap gap-2">
                {COLORS.map((cHex) => (
                  <button
                    key={cHex}
                    type="button"
                    className={`note-swatch ${modalColor === cHex ? 'note-swatch-active' : ''}`}
                    style={{ background: cHex }}
                    onClick={() => setModalColor(cHex)}
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setModal(null)}>
                {t('ibCancel')}
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                disabled={!modalText.trim()}
                onClick={() => void pinNote()}
              >
                <Pin size={13} /> {t('ibPin')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}