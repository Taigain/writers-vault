'use client'

import { useEffect, useRef, useState } from 'react'
import { BookOpen, Save, Trash2 } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import {
  getCanvasBeats,
  getBeatLinks,
  moveBeatOnCanvas,
  linkBeats,
  unlinkBeats,
  createBeatAt,
  saveBeat,
  deleteBeat,
  type CanvasBeat,
} from '@/lib/actions'

const W = 240
const H = 168

type Side = 'l' | 'r' | 't' | 'b'
const NORM: Record<Side, { x: number; y: number }> = {
  l: { x: -1, y: 0 },
  r: { x: 1, y: 0 },
  t: { x: 0, y: -1 },
  b: { x: 0, y: 1 },
}
const anchorPt = (p: { x: number; y: number }, s: Side) =>
  s === 'l'
    ? { x: p.x, y: p.y + H / 2 }
    : s === 'r'
      ? { x: p.x + W, y: p.y + H / 2 }
      : s === 't'
        ? { x: p.x + W / 2, y: p.y }
        : { x: p.x + W / 2, y: p.y + H }
function bestSides(a: { x: number; y: number }, b: { x: number; y: number }): [Side, Side] {
  const sides: Side[] = ['l', 'r', 't', 'b']
  let best: [Side, Side] = ['r', 'l']
  let bd = Infinity
  for (const sa of sides)
    for (const sb of sides) {
      const pa = anchorPt(a, sa)
      const pb = anchorPt(b, sb)
      const d = (pa.x - pb.x) ** 2 + (pa.y - pb.y) ** 2
      if (d < bd) {
        bd = d
        best = [sa, sb]
      }
    }
  return best
}

function CharChips({ characters, initial }: { characters: { id: string; name: string }[]; initial: string[] }) {
  const [on, setOn] = useState<Record<string, boolean>>(() => {
    const m: Record<string, boolean> = {}
    for (const id of initial) m[id] = true
    return m
  })
  return (
    <div className="flex flex-wrap gap-1.5">
      {characters.map((ch) => (
        <label
          key={ch.id}
          className="chip cursor-pointer select-none"
          style={on[ch.id] ? { background: '#4c3d8f', color: '#fff', borderColor: '#4c3d8f' } : undefined}
        >
          <input
            type="checkbox"
            name="charIds"
            value={ch.id}
            checked={!!on[ch.id]}
            onChange={(e) => setOn((c) => ({ ...c, [ch.id]: e.target.checked }))}
            className="hidden"
          />
          {ch.name}
        </label>
      ))}
    </div>
  )
}

export default function PlotCanvas({
  bookId,
  chapters,
  characters,
}: {
  bookId: string
  chapters: { id: string; title: string; order: number }[]
  characters: { id: string; name: string }[]
}) {
  const { t } = useLang()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [beats, setBeats] = useState<CanvasBeat[] | null>(null)
  const [links, setLinks] = useState<{ id: string; aId: string; bId: string }[]>([])
  const [over, setOver] = useState<Record<string, { x: number; y: number }>>({})
  const [link, setLink] = useState<{ from: string; side: Side; px: number; py: number } | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const dragRef = useRef<{ id: string; sx: number; sy: number; ox: number; oy: number; lx: number; ly: number; moved: boolean } | null>(null)

  const load = async () => {
    const [bs, ls] = await Promise.all([getCanvasBeats(bookId), getBeatLinks(bookId)])
    setBeats(bs)
    setLinks(ls)
    setOver({})
  }
  useEffect(() => {
    void load()
  }, [bookId])

  const grid = (i: number) => ({ x: 40 + (i % 4) * (W + 40), y: 40 + Math.floor(i / 4) * (H + 50) })
  const placed = (beats ?? []).map((b, i) => {
    const o = over[b.id]
    const g = b.canvasX != null && b.canvasY != null ? { x: b.canvasX, y: b.canvasY } : grid(i)
    return { b, x: o?.x ?? g.x, y: o?.y ?? g.y }
  })
  const posMap = new Map(placed.map((p) => [p.b.id, p]))
  const boardH = Math.max(560, ...placed.map((p) => p.y + H + 60))
  const editBeat = beats?.find((b) => b.id === editId) ?? null

  const startLink = (e: React.PointerEvent, id: string, side: Side) => {
    e.stopPropagation()
    e.preventDefault()
    const r0 = wrapRef.current!.getBoundingClientRect()
    const start = anchorPt(posMap.get(id)!, side)
    setLink({ from: id, side, px: start.x, py: start.y })
    const move = (ev: PointerEvent) => {
      const r = wrapRef.current!.getBoundingClientRect()
      setLink({ from: id, side, px: ev.clientX - r.left, py: ev.clientY - r.top })
    }
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      const el = document.elementFromPoint(ev.clientX, ev.clientY)?.closest('[data-beat-id]')
      const target = el?.getAttribute('data-beat-id') ?? null
      setLink(null)
      if (target && target !== id) void linkBeats(id, target).then(load)
      void r0
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <div className="space-y-3">
      <div className="text-xs" style={{ color: 'var(--soft)' }}>{t('pcHint')}</div>
      <div
        ref={wrapRef}
        className="pc-wrap"
        style={{ height: boardH }}
        onDoubleClick={async (e) => {
          if (e.target !== wrapRef.current) return
          const r = wrapRef.current!.getBoundingClientRect()
          const x = Math.max(8, e.clientX - r.left - W / 2)
          const y = Math.max(8, e.clientY - r.top - H / 2)
          const id = await createBeatAt(bookId, x, y)
          await load()
          setEditId(id)
        }}
      >
        <svg className="pc-lines" width="100%" height={boardH}>
          {links.map((l) => {
            const a = posMap.get(l.aId)
            const b = posMap.get(l.bId)
            if (!a || !b) return null
            const [sa, sb] = bestSides(a, b)
            const pa = anchorPt(a, sa)
            const pb = anchorPt(b, sb)
            const ca = { x: pa.x + NORM[sa].x * 50, y: pa.y + NORM[sa].y * 50 }
            const cb = { x: pb.x + NORM[sb].x * 50, y: pb.y + NORM[sb].y * 50 }
            return (
              <path
                key={l.id}
                d={`M ${pa.x} ${pa.y} C ${ca.x} ${ca.y}, ${cb.x} ${cb.y}, ${pb.x} ${pb.y}`}
                stroke="var(--gold)"
                strokeWidth={1.6}
                fill="none"
                opacity={0.85}
                onClick={async () => {
                  if (window.confirm(t('pcLinkDel'))) {
                    await unlinkBeats(l.id)
                    await load()
                  }
                }}
              />
            )
          })}
          {link &&
            (() => {
              const from = posMap.get(link.from)
              if (!from) return null
              const pa = anchorPt(from, link.side)
              return (
                <path
                  d={`M ${pa.x} ${pa.y} L ${link.px} ${link.py}`}
                  stroke="#8c3a2b"
                  strokeWidth={1.6}
                  strokeDasharray="5 4"
                  fill="none"
                />
              )
            })()}
        </svg>
        {placed.map((p) => (
          <div
            key={p.b.id}
            data-beat-id={p.b.id}
            className="pc-card"
            style={{ left: p.x, top: p.y }}
            onDoubleClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => {
              if ((e.target as HTMLElement).closest('.pc-anchor')) return
              dragRef.current = { id: p.b.id, sx: e.clientX, sy: e.clientY, ox: p.x, oy: p.y, lx: p.x, ly: p.y, moved: false }
              ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => {
              const d = dragRef.current
              if (!d || d.id !== p.b.id) return
              const dx = e.clientX - d.sx
              const dy = e.clientY - d.sy
              if (!d.moved && Math.hypot(dx, dy) < 4) return
              d.moved = true
              d.lx = Math.max(4, d.ox + dx)
              d.ly = Math.max(4, d.oy + dy)
              setOver((o) => ({ ...o, [p.b.id]: { x: d.lx, y: d.ly } }))
            }}
            onPointerUp={() => {
              const d = dragRef.current
              dragRef.current = null
              if (!d) return
              if (!d.moved) {
                setEditId(p.b.id)
                return
              }
              setBeats((prev) =>
                prev?.map((b) => (b.id === d.id ? { ...b, canvasX: Math.round(d.lx), canvasY: Math.round(d.ly) } : b)) ?? prev,
              )
              void moveBeatOnCanvas(d.id, d.lx, d.ly)
            }}
          >
            <span className="pc-anchor pc-a-l" onPointerDown={(e) => startLink(e, p.b.id, 'l')} />
            <span className="pc-anchor pc-a-r" onPointerDown={(e) => startLink(e, p.b.id, 'r')} />
            <span className="pc-anchor pc-a-t" onPointerDown={(e) => startLink(e, p.b.id, 't')} />
            <span className="pc-anchor pc-a-b" onPointerDown={(e) => startLink(e, p.b.id, 'b')} />
            <div className="pc-card-title">{p.b.title || t('slUntitledBeat')}</div>
            <div className="pc-card-sum">{p.b.summary}</div>
            <div className="pc-card-meta">
              {p.b.chapterTitle && (
                <span className="chip">
                  <BookOpen size={10} /> {p.b.chapterTitle}
                </span>
              )}
              {p.b.characters.slice(0, 3).map((c) => (
                <span key={c.id} className="chip">{c.name}</span>
              ))}
              {p.b.characters.length > 3 && <span className="chip">+{p.b.characters.length - 3}</span>}
            </div>
            {p.b.lines.length > 0 && (
              <div className="pc-card-lines">{p.b.lines.map((l) => l.name).join(', ')}</div>
            )}
          </div>
        ))}
      </div>
      {editBeat && (
        <div
          className="fixed inset-0 flex items-center justify-center p-6"
          style={{ background: 'rgba(20, 17, 14, 0.5)', zIndex: 340 }}
          onClick={() => setEditId(null)}
        >
          <form
            className="card p-5 w-full max-w-md space-y-3"
            onClick={(e) => e.stopPropagation()}
            action={async (fd: FormData) => {
              await saveBeat(editBeat.id, fd)
              setEditId(null)
              await load()
            }}
          >
            <input name="title" defaultValue={editBeat.title} className="input font-semibold" placeholder={t('pcTitle')} />
            <textarea name="summary" defaultValue={editBeat.summary} rows={3} className="textarea text-sm" placeholder={t('pcSummary')} />
            <select name="chapterId" defaultValue={editBeat.chapterId ?? ''} className="input">
              <option value="">{t('pcNoChapter')}</option>
              {chapters.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.order}. {c.title}
                </option>
              ))}
            </select>
            <input type="hidden" name="eventId" value={editBeat.eventId ?? ''} />
            <div className="field-label">{t('pcChars')}</div>
            <CharChips characters={characters} initial={editBeat.characters.map((c) => c.id)} />
            {characters.length === 0 && (
              <div className="text-xs" style={{ color: 'var(--soft)' }}>{t('pcNoChars')}</div>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="btn btn-danger btn-sm mr-auto"
                onClick={async () => {
                  if (window.confirm(t('pcDeleteConfirm', { name: editBeat.title || t('slUntitledBeat') }))) {
                    await deleteBeat(editBeat.id)
                    setEditId(null)
                    await load()
                  }
                }}
              >
                <Trash2 size={13} /> {t('pcDelete')}
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditId(null)}>
                {t('cmCancel')}
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                <Save size={13} /> {t('pcSave')}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}