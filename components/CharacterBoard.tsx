'use client'

import { useEffect, useRef, useState } from 'react'
import { Plus, Edit3, Copy, Trash2, Pin, GripHorizontal, Link2 } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import { roleLabel } from '@/lib/roles'
import { deleteCharacter, duplicateCharacter, moveCharacterOnBoard, setBookBoardHeight } from '@/lib/actions'
import { useRouter } from 'next/navigation'
import { relationColor, relationLegend } from '@/lib/relations'
import { portraitSrc } from '@/lib/portrait'
import type { CharRow, CharRelation } from './characterTypes'

const CARD_W = 180
const CARD_H = 290
const TOP_PAD = 130
const SIDE_PAD = 20
const PIN_Y = 6

function jitter(seed: string): number {
  let h = 0
  for (let k = 0; k < seed.length; k++) h = (h * 31 + seed.charCodeAt(k)) | 0
  return (((h & 0x7fffffff) % 100) / 100 - 0.5) * 2
}

export default function CharacterBoard({
  bookId,
  characters,
  relations,
  boardHeight,
  onOpen,
  onNew,
  onRelate,
}: {
  bookId: string
  characters: CharRow[]
  relations: CharRelation[]
  boardHeight: number | null
  onOpen: (id: string) => void
  onNew: () => void
  onRelate: (a: string, b: string) => void
}) {
  const { t, lang } = useLang()
  const router = useRouter()
  const wrapRef = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(1200)
  const [overrides, setOverrides] = useState<Record<string, { x: number; y: number }>>({})
  const dragRef = useRef<{
    id: string
    sx: number
    sy: number
    ox: number
    oy: number
    lx: number
    ly: number
    moved: boolean
  } | null>(null)
  const justDragged = useRef(false)
  const [connect, setConnect] = useState(false)
  const [selA, setSelA] = useState<string | null>(null)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const measure = () => setWidth(Math.max(600, el.clientWidth))
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    measure()
    return () => ro.disconnect()
  }, [])

  const cols = Math.max(2, Math.min(6, Math.floor(width / 260)))
  const rows = Math.max(1, Math.ceil(characters.length / cols))
  const autoH = Math.max(620, TOP_PAD + rows * (CARD_H + 50) + 60)
  const [stretch, setStretch] = useState<number | null>(null)
  const boardH = stretch ?? boardHeight ?? autoH
  const areaH = boardH - TOP_PAD - 20
  const cw = (width - SIDE_PAD * 2) / cols
  const rh = areaH / rows

  const clamp = (p: { x: number; y: number }) => ({
    x: Math.max(8, Math.min(width - CARD_W - 8, p.x)),
    y: Math.max(8, Math.min(boardH - CARD_H - 8, p.y)),
  })
  const gridPos = (i: number) => ({
    x: SIDE_PAD + (i % cols) * cw + cw / 2 - CARD_W / 2 + jitter('x' + i) * 30,
    y: TOP_PAD + Math.floor(i / cols) * rh + rh / 2 - CARD_H / 2 + jitter('y' + i) * 24,
  })
  const effPos = (c: CharRow, i: number) =>
    clamp(
      overrides[c.id] ??
        (c.boardX != null && c.boardY != null ? { x: c.boardX, y: c.boardY } : gridPos(i)),
    )

  const placed = characters.map((c, i) => {
    const p = effPos(c, i)
    return {
      c,
      i,
      x: p.x,
      y: p.y,
      rot: jitter('r' + c.id) * 6,
      px: p.x + CARD_W / 2,
      py: p.y + PIN_Y,
    }
  })
  const posMap = new Map(placed.map((p) => [p.c.id, p]))
  const lines = relations.filter((r) => posMap.has(r.characterId) && posMap.has(r.relatedId))
  const legend = relationLegend(lang)

  return (
    <div className="cr-board-wrap" ref={wrapRef}>
      <div className="cr-connect-bar">
        <button
          type="button"
          className={`btn btn-sm ${connect ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => {
            setConnect((v) => !v)
            setSelA(null)
          }}
        >
          <Link2 size={13} /> {t('rlMode')}
        </button>
        {connect && (
          <span className="text-xs" style={{ color: 'var(--soft)' }}>
            {selA ? t('rlModeHint2') : t('rlModeHint1')}
          </span>
        )}
      </div>
      <div className="cr-board" style={{ height: boardH }}>
        <svg className="cr-strings" width={width} height={boardH}>
          {lines.map((r) => {
            const a = posMap.get(r.characterId)!
            const b = posMap.get(r.relatedId)!
            const mx = (a.px + b.px) / 2
            const my = (a.py + b.py) / 2 + 34
            return (
              <path
                key={r.id}
                d={`M ${a.px} ${a.py} Q ${mx} ${my} ${b.px} ${b.py}`}
                stroke={relationColor(r.note)}
                strokeWidth={1.6}
                fill="none"
                opacity={0.9}
              />
            )
          })}
        </svg>
        <button type="button" className="cr-board-new" onClick={onNew}>
          <Pin size={13} />
          <Plus size={16} />
          <span>{t('crNew')}</span>
        </button>
        {placed.map((p) => (
          <div
            key={p.c.id}
            className={`cr-board-card ${selA === p.c.id ? 'cr-board-card-sel' : ''}`}
            style={{ left: p.x, top: p.y, width: CARD_W, transform: `rotate(${p.rot}deg)` }}
            onPointerDown={(e) => {
              if (connect) return
              justDragged.current = false
              if ((e.target as HTMLElement).closest('button')) return
              const cur = effPos(p.c, p.i)
              dragRef.current = {
                id: p.c.id,
                sx: e.clientX,
                sy: e.clientY,
                ox: cur.x,
                oy: cur.y,
                lx: cur.x,
                ly: cur.y,
                moved: false,
              }
              ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
            }}
            onPointerMove={(e) => {
              const d = dragRef.current
              if (!d || d.id !== p.c.id) return
              const dx = e.clientX - d.sx
              const dy = e.clientY - d.sy
              if (!d.moved && Math.hypot(dx, dy) < 4) return
              d.moved = true
              const np = clamp({ x: d.ox + dx, y: d.oy + dy })
              d.lx = np.x
              d.ly = np.y
              setOverrides((o) => ({ ...o, [p.c.id]: np }))
            }}
            onPointerUp={() => {
              const d = dragRef.current
              dragRef.current = null
              if (!d || !d.moved) return
              justDragged.current = true
              setTimeout(() => {
                justDragged.current = false
              }, 0)
              void moveCharacterOnBoard(p.c.id, d.lx, d.ly)
            }}
          >
            <span className="cr-pin" />
            <div className="cr-board-tape" />
            <button
              type="button"
              className="cr-board-photo"
              onClick={() => {
                if (justDragged.current) return
                if (connect) {
                  if (!selA) {
                    setSelA(p.c.id)
                    return
                  }
                  if (selA === p.c.id) {
                    setSelA(null)
                    return
                  }
                  const a = selA
                  setSelA(null)
                  onRelate(a, p.c.id)
                  return
                }
                onOpen(p.c.id)
              }}
            >
              <span className="cr-board-initial">{p.c.name.charAt(0).toUpperCase()}</span>
              <img
                className="cr-photo-img"
                src={portraitSrc(p.c)}
                alt=""
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </button>
            <div className="cr-board-name">{p.c.name}</div>
            <div className="cr-board-role">{roleLabel(p.c.role, lang)}</div>
            <div className="cr-board-actions">
              <button type="button" onClick={() => onOpen(p.c.id)} title={t('crEdit')}>
                <Edit3 size={12} />
              </button>
              <button
                type="button"
                onClick={async () => {
                  await duplicateCharacter(p.c.id)
                  router.refresh()
                }}
                title={t('crDuplicate')}
              >
                <Copy size={12} />
              </button>
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm(t('crDeleteConfirm', { name: p.c.name }))) {
                    await deleteCharacter(p.c.id)
                    router.refresh()
                  }
                }}
                title={t('crDelete')}
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
        <div
          className="cr-board-resize"
          title={t('crBoardStretch')}
          onDoubleClick={() => {
            setStretch(null)
            void setBookBoardHeight(bookId, null)
          }}
          onPointerDown={(e) => {
            e.preventDefault()
            const startY = e.clientY
            const startH = boardH
            const move = (ev: PointerEvent) => {
              setStretch(Math.max(420, Math.min(4000, startH + (ev.clientY - startY))))
            }
            const up = (ev: PointerEvent) => {
              window.removeEventListener('pointermove', move)
              window.removeEventListener('pointerup', up)
              void setBookBoardHeight(bookId, Math.max(420, Math.min(4000, startH + (ev.clientY - startY))))
            }
            window.addEventListener('pointermove', move)
            window.addEventListener('pointerup', up)
          }}
        >
          <GripHorizontal size={14} />
        </div>
      </div>
      {relations.length > 0 && (
        <div className="cr-legend">
          {legend.map((l) => (
            <span key={l.c} className="cr-legend-item">
              <span className="cr-legend-dot" style={{ background: l.c }} />
              {l.t}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}