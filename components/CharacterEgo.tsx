'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { useLang } from '@/lib/useLang'

export type EgoData = {
  center: { id: string; name: string } | null
  nodes: { id: string; name: string }[]
  edges: { other: string; weight: number; kinds: string[]; note: string | null }[]
}

type Pt = { x: number; y: number }

const W = 640
const H = 420

export default function CharacterEgo({ ego }: { ego: EgoData }) {
  const { t } = useLang()
  const svgRef = useRef<SVGSVGElement | null>(null)
  const dragRef = useRef<{ id: string; ox: number; oy: number; moved: number } | null>(null)

  const radial = useMemo(() => {
    const map: Record<string, Pt> = {}
    const R = Math.min(170, 80 + ego.nodes.length * 10)
    ego.nodes.forEach((n, i) => {
      const a = (i / ego.nodes.length) * Math.PI * 2
      map[n.id] = { x: W / 2 + R * Math.cos(a), y: H / 2 + R * Math.sin(a) }
    })
    return map
  }, [ego])

  const [pos, setPos] = useState<Record<string, Pt> | null>(null)
  const [centerPos, setCenterPos] = useState<Pt>({ x: W / 2, y: H / 2 })
  const P = pos ?? radial

  const posRef = useRef({ nodes: P, center: centerPos })
  useEffect(() => {
    posRef.current = { nodes: P, center: centerPos }
  }, [P, centerPos])

  const storeKey = ego.center ? 'wv-ego-' + ego.center.id : null

  useEffect(() => {
    if (!storeKey) return
    try {
      const raw = localStorage.getItem(storeKey)
      if (!raw) return
      const saved = JSON.parse(raw) as { center?: Pt; nodes?: Record<string, Pt> }
      if (saved.nodes) setPos({ ...radial, ...saved.nodes })
      if (saved.center) setCenterPos(saved.center)
    } catch {
      /* ignore */
    }
  }, [storeKey, radial])

  const persist = () => {
    if (!storeKey) return
    try {
      localStorage.setItem(
        storeKey,
        JSON.stringify({ center: posRef.current.center, nodes: posRef.current.nodes }),
      )
    } catch {
      /* ignore */
    }
  }

  const toSvg = (e: React.PointerEvent): Pt | null => {
    const svg = svgRef.current
    if (!svg) return null
    const ctm = svg.getScreenCTM()
    if (!ctm) return null
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse())
    return { x: p.x, y: p.y }
  }

  const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

  const onDown = (id: string) => (e: React.PointerEvent) => {
    const p = toSvg(e)
    if (!p) return
    const cur = id === 'center' ? centerPos : P[id]
    if (!cur) return
    dragRef.current = { id, ox: p.x - cur.x, oy: p.y - cur.y, moved: 0 }
    ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
    e.preventDefault()
  }

  const onMove = (e: React.PointerEvent) => {
    const d = dragRef.current
    if (!d) return
    const p = toSvg(e)
    if (!p) return
    d.moved++
    const nx = clamp(p.x - d.ox, 30, W - 30)
    const ny = clamp(p.y - d.oy, 26, H - 34)
    if (d.id === 'center') setCenterPos({ x: nx, y: ny })
    else setPos((prev) => ({ ...(prev ?? radial), [d.id]: { x: nx, y: ny } }))
  }

  const jump = (id: string) => {
    const el = document.getElementById('char-' + id) as HTMLDetailsElement | null
    if (!el) return
    el.open = true
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const onUp = (id: string) => () => {
    const d = dragRef.current
    dragRef.current = null
    if (!d) return
    if (d.moved < 3) {
      jump(id === 'center' ? ego.center?.id ?? id : id)
      return
    }
    persist()
  }

  const resetLayout = () => {
    if (storeKey) {
      try {
        localStorage.removeItem(storeKey)
      } catch {
        /* ignore */
      }
    }
    setPos(null)
    setCenterPos({ x: W / 2, y: H / 2 })
  }

  if (!ego.center || ego.nodes.length === 0) {
    return (
      <div className="text-xs" style={{ color: 'var(--soft)' }}>
        {t('egoEmpty')}
      </div>
    )
  }

  const cx = centerPos.x
  const cy = centerPos.y
  const maxW = Math.max(...ego.edges.map((e) => e.weight), 1)
  const kindLabel = (k: string) =>
    k === 'relation' ? t('egoRel') : k === 'scene' ? t('egoScene') : t('egoChapter')
  const edgeLabel = (e: { weight: number; kinds: string[]; note: string | null }) => {
    const base = e.note || kindLabel(e.kinds[0] ?? 'scene')
    return e.weight > 1 ? `${base} ×${e.weight}` : base
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button type="button" className="mini-btn" title={t('egoReset')} onClick={resetLayout}>
          <RotateCcw size={13} />
        </button>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ maxHeight: 420, touchAction: 'none', userSelect: 'none' }}
        onPointerMove={onMove}
      >
        {ego.edges.map((e, i) => {
          const p = P[e.other]
          if (!p) return null
          const hasRel = e.kinds.includes('relation')
          const onlyChapter = e.kinds.length === 1 && e.kinds[0] === 'chapter'
          const mx = (cx + p.x) / 2
          const my = (cy + p.y) / 2
          return (
            <g key={i}>
              <line
                x1={cx}
                y1={cy}
                x2={p.x}
                y2={p.y}
                style={{
                  stroke: hasRel ? 'var(--gold, #a8873a)' : 'var(--line, #d8cfc0)',
                  strokeWidth: 1 + (e.weight / maxW) * 4,
                  strokeOpacity: hasRel ? 0.85 : 0.7,
                  strokeDasharray: onlyChapter ? '4 4' : undefined,
                }}
              >
                <title>
                  {(e.note ? e.note + ' · ' : '') + e.kinds.map(kindLabel).join(', ') + ' · ' + e.weight}
                </title>
              </line>
              <text
                x={mx}
                y={my - 7}
                textAnchor="middle"
                fontSize={10}
                style={{
                  fill: 'var(--soft, #6b6257)',
                  stroke: 'var(--bg, #f6f3ec)',
                  strokeWidth: 4,
                  paintOrder: 'stroke',
                }}
              >
                {edgeLabel(e)}
              </text>
            </g>
          )
        })}
        <circle
          cx={cx}
          cy={cy}
          r={32}
          style={{ fill: 'none', stroke: 'var(--gold, #a8873a)', strokeOpacity: 0.25, strokeWidth: 6 }}
        />
        <g
          onPointerDown={onDown('center')}
          onPointerUp={onUp('center')}
          style={{ cursor: 'grab' }}
        >
          <circle cx={cx} cy={cy} r={26} style={{ fill: 'var(--gold, #a8873a)' }} />
          <text
            x={cx}
            y={cy + 5}
            textAnchor="middle"
            fontSize={16}
            fontWeight={700}
            style={{ fill: '#ffffff' }}
          >
            {ego.center.name.charAt(0).toUpperCase()}
          </text>
          <text
            x={cx}
            y={cy + 46}
            textAnchor="middle"
            fontSize={12}
            fontWeight={700}
            style={{ fill: 'var(--fg, #201c17)' }}
          >
            {ego.center.name}
          </text>
        </g>
        {ego.nodes.map((n) => {
          const p = P[n.id]
          if (!p) return null
          return (
            <g key={n.id} onPointerDown={onDown(n.id)} onPointerUp={onUp(n.id)} style={{ cursor: 'grab' }}>
              <circle
                cx={p.x}
                cy={p.y}
                r={20}
                style={{ fill: 'var(--soft-bg, #f3ede2)', stroke: 'var(--line, #d8cfc0)', strokeWidth: 1.5 }}
              />
              <text
                x={p.x}
                y={p.y + 4}
                textAnchor="middle"
                fontSize={12}
                fontWeight={600}
                style={{ fill: 'var(--fg, #201c17)' }}
              >
                {n.name.charAt(0).toUpperCase()}
              </text>
              <text
                x={p.x}
                y={p.y + 34}
                textAnchor="middle"
                fontSize={10}
                style={{ fill: 'var(--soft, #6b6257)' }}
              >
                {n.name}
              </text>
            </g>
          )
        })}
      </svg>
      <div className="flex flex-wrap gap-3 text-xs" style={{ color: 'var(--soft)' }}>
        <span className="flex items-center gap-1">
          <span style={{ width: 18, borderTop: '3px solid var(--gold)', display: 'inline-block' }} />
          {t('egoRel')}
        </span>
        <span className="flex items-center gap-1">
          <span style={{ width: 18, borderTop: '3px solid var(--line)', display: 'inline-block' }} />
          {t('egoScene')}
        </span>
        <span className="flex items-center gap-1">
          <span style={{ width: 18, borderTop: '2px dashed var(--line)', display: 'inline-block' }} />
          {t('egoChapter')}
        </span>
        <span>{t('egoHint')}</span>
        <span>{t('egoDrag')}</span>
      </div>
    </div>
  )
}