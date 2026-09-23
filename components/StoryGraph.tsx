'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ZoomIn, ZoomOut, Expand, Minimize, Crosshair } from 'lucide-react'
import { useLang } from '@/lib/useLang'
import type { StorylineRow } from '@/lib/actions'

const LINE_COLORS = ['#8c3a2b', '#2f6d4f', '#3d6b8c', '#7a3b6e', '#20655d', '#8a5a2b', '#555555', '#33691e']
const C_CHAR = '#4c3d8f'
const C_EVENT = '#a9812f'

type GNode = {
  id: string
  kind: 'beat' | 'char' | 'event'
  label: string
  color: string
  x: number
  y: number
  ring?: boolean
  summary?: string
  role?: string
  chOrder?: number | null
  year?: number | null
  day?: number | null
}

type GEdge = { a: string; b: string; kind: 'chain' | 'link'; color: string; curve: number }

function buildGraph(lines: StorylineRow[]) {
  const nodes = new Map<string, GNode>()
  const edges: GEdge[] = []
  const charBeats = new Map<string, string[]>()
  const eventBeats = new Map<string, string[]>()
  const charMeta = new Map<string, { name: string; role: string }>()
  const eventMeta = new Map<string, { label: string; year: number | null; day: number | null }>()

  lines.forEach((line, li) => {
    const color = LINE_COLORS[li % LINE_COLORS.length]
    line.beats.forEach((b, bi) => {
      nodes.set('b:' + b.id, {
        id: 'b:' + b.id,
        kind: 'beat',
        label: b.title || 'Бит ' + (bi + 1),
        color,
        x: 150 + bi * 180 + li * 40,
        y: 150 + li * 170,
        ring: bi === 0,
        summary: b.summary,
        chOrder: b.chapterOrder,
      })
      if (bi > 0) {
        edges.push({ a: 'b:' + line.beats[bi - 1].id, b: 'b:' + b.id, kind: 'chain', color, curve: 0 })
      }
      b.characters.forEach((ch, ci) => {
        charMeta.set(ch.id, { name: ch.name, role: ch.roleLabel })
        const arr = charBeats.get(ch.id) ?? []
        arr.push('b:' + b.id)
        charBeats.set(ch.id, arr)
        edges.push({ a: 'b:' + b.id, b: 'c:' + ch.id, kind: 'link', color: C_CHAR, curve: (ci % 2 ? 1 : -1) * 26 })
      })
      if (b.eventId) {
        eventMeta.set(b.eventId, { label: b.eventLabel ?? '', year: b.eventYear, day: b.eventDay })
        const arr = eventBeats.get(b.eventId) ?? []
        arr.push('b:' + b.id)
        eventBeats.set(b.eventId, arr)
        edges.push({ a: 'b:' + b.id, b: 'e:' + b.eventId, kind: 'link', color: C_EVENT, curve: (arr.length % 2 ? -1 : 1) * 30 })
      }
    })
  })

  const placed: { x: number; y: number }[] = []
  const place = (mx: number, my: number) => {
    let x = mx
    let y = my
    let guard = 0
    while (placed.some((p) => Math.hypot(p.x - x, p.y - y) < 70) && guard < 40) {
      x += 80
      guard++
    }
    placed.push({ x, y })
    return { x, y }
  }

  charBeats.forEach((beatIds, id) => {
    const xs = beatIds.map((b) => nodes.get(b)!.x)
    const ys = beatIds.map((b) => nodes.get(b)!.y)
    const mx = xs.reduce((s, v) => s + v, 0) / xs.length
    const my = ys.reduce((s, v) => s + v, 0) / ys.length
    const p = place(mx, my - 95)
    const meta = charMeta.get(id)!
    nodes.set('c:' + id, { id: 'c:' + id, kind: 'char', label: meta.name, role: meta.role, color: C_CHAR, x: p.x, y: p.y })
  })
  eventBeats.forEach((beatIds, id) => {
    const xs = beatIds.map((b) => nodes.get(b)!.x)
    const ys = beatIds.map((b) => nodes.get(b)!.y)
    const mx = xs.reduce((s, v) => s + v, 0) / xs.length
    const my = ys.reduce((s, v) => s + v, 0) / ys.length
    const p = place(mx, my + 95)
    const meta = eventMeta.get(id)!
    nodes.set('e:' + id, {
      id: 'e:' + id,
      kind: 'event',
      label: meta.label,
      color: C_EVENT,
      x: p.x,
      y: p.y,
      year: meta.year,
      day: meta.day,
    })
  })

  const list = [...nodes.values()]
  for (let pass = 0; pass < 2; pass++) {
    for (let i = 0; i < list.length; i++) {
      for (let j = i + 1; j < list.length; j++) {
        const a = list[i]
        const b = list[j]
        const d = Math.hypot(a.x - b.x, a.y - b.y)
        if (d > 0 && d < 64) {
          const push = (64 - d) / 2
          const dx = ((a.x - b.x) / d) * push
          const dy = ((a.y - b.y) / d) * push
          a.x += dx
          a.y += dy
          b.x -= dx
          b.y -= dy
        }
      }
    }
  }
  const minX = Math.min(...list.map((n) => n.x))
  const minY = Math.min(...list.map((n) => n.y))
  list.forEach((n) => {
    n.x += 90 - minX
    n.y += 90 - minY
  })
  return { nodes: list, edges }
}

export default function StoryGraph({ lines }: { lines: StorylineRow[] }) {
  const { t } = useLang()
  const [tip, setTip] = useState<{ x: number; y: number; title: string; body: string } | null>(null)
  const [sel, setSel] = useState<string | null>(null)
  const [view, setView] = useState({ s: 1, x: 20, y: 10 })
  const [fs, setFs] = useState(false)
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const panRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null)

  const { nodes, edges } = useMemo(() => buildGraph(lines), [lines])
  const shown = lines.filter((l) => l.beats.length > 0)

  useEffect(() => {
    const onFs = () => setFs(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const rect = el.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      setView((v) => {
        const ns = Math.min(2.5, Math.max(0.4, v.s * (e.deltaY < 0 ? 1.15 : 0.87)))
        const k = ns / v.s
        return { s: ns, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k }
      })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const p = panRef.current
      if (!p) return
      setView((v) => ({ ...v, x: p.ox + (e.clientX - p.sx), y: p.oy + (e.clientY - p.sy) }))
    }
    const onUp = () => {
      panRef.current = null
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  if (shown.length === 0) return null

  const byId = new Map(nodes.map((n) => [n.id, n]))
  const neighbor = new Set<string>()
  if (sel) {
    neighbor.add(sel)
    for (const e of edges) {
      if (e.a === sel) neighbor.add(e.b)
      if (e.b === sel) neighbor.add(e.a)
    }
  }
  const dim = (id: string) => (sel && !neighbor.has(id) ? 0.15 : 1)
  const dimEdge = (e: GEdge) => (sel && e.a !== sel && e.b !== sel ? 0.1 : 1)

  const zoomBy = (f: number) => {
    const el = wrapRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const cx = rect.width / 2
    const cy = rect.height / 2
    setView((v) => {
      const ns = Math.min(2.5, Math.max(0.4, v.s * f))
      const k = ns / v.s
      return { s: ns, x: cx - (cx - v.x) * k, y: cy - (cy - v.y) * k }
    })
  }

  const toggleFs = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    else wrapRef.current?.requestFullscreen?.().catch(() => {})
  }

  const tipFor = (n: GNode) => {
    if (n.kind === 'beat') return { title: n.label, body: n.summary ? n.summary.slice(0, 160) : '' }
    if (n.kind === 'char') return { title: n.label, body: n.role ?? '' }
    return {
      title: n.label,
      body: n.year != null ? t('slChipBookTime', { y: String(n.year), d: String(n.day ?? '-') }) : '',
    }
  }

  return (
    <div className="card p-4 mb-5">
      <div className="flex flex-wrap items-center gap-4 mb-3 text-xs" style={{ color: 'var(--soft)' }}>
        {shown.map((l, li) => (
          <span key={l.id} className="flex items-center gap-1.5">
            <i style={{ width: 18, height: 3, background: LINE_COLORS[li % LINE_COLORS.length], borderRadius: 2 }} />
            {l.name}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <i className="graph-dot" style={{ background: C_CHAR, width: 8, height: 8 }} /> {t('slMapChars')}
        </span>
        <span className="flex items-center gap-1.5">
          <i style={{ width: 8, height: 8, background: C_EVENT, transform: 'rotate(45deg)' }} /> {t('slMapEvents')}
        </span>
        <span className="flex-1" />
        <span className="flex items-center gap-1">
          <button type="button" className="mini-btn" title="-" onClick={() => zoomBy(0.85)}>
            <ZoomOut size={14} />
          </button>
          <button type="button" className="mini-btn" title="+" onClick={() => zoomBy(1.18)}>
            <ZoomIn size={14} />
          </button>
          <button type="button" className="mini-btn" title="1:1" onClick={() => setView({ s: 1, x: 20, y: 10 })}>
            <Crosshair size={14} />
          </button>
          <button type="button" className="mini-btn" title={fs ? t('chZenExit') : t('chZen')} onClick={toggleFs}>
            {fs ? <Minimize size={14} /> : <Expand size={14} />}
          </button>
        </span>
      </div>
      <div ref={wrapRef} className="storygraph-wrap">
        <svg
          width="100%"
          height="100%"
          onMouseDown={(e) => {
            const tgt = e.target as Element
            if (tgt.getAttribute('data-bg') === '1') {
              panRef.current = { sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y }
            }
          }}
          onMouseLeave={() => setTip(null)}
          onClick={() => setSel(null)}
        >
          <rect width="100%" height="100%" fill="transparent" data-bg="1" />
          <defs>
            {LINE_COLORS.map((c, i) => (
              <marker key={i} id={'arr' + i} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill={c} />
              </marker>
            ))}
          </defs>
          <g transform={`translate(${view.x} ${view.y}) scale(${view.s})`}>
            {edges.filter((e) => e.kind === 'link').map((e, i) => {
              const a = byId.get(e.a)!
              const b = byId.get(e.b)!
              const mx = (a.x + b.x) / 2
              const my = (a.y + b.y) / 2 + e.curve
              return (
                <path
                  key={'l' + i}
                  d={`M ${a.x} ${a.y} Q ${mx} ${my} ${b.x} ${b.y}`}
                  fill="none"
                  stroke={e.color}
                  strokeWidth={1.1}
                  opacity={0.55 * dimEdge(e)}
                />
              )
            })}
            {shown.map((line, li) => {
              const color = LINE_COLORS[li % LINE_COLORS.length]
              const marker = `url(#arr${li % LINE_COLORS.length})`
              const chain = edges.filter((e) => e.kind === 'chain' && e.color === color)
              const first = byId.get('b:' + line.beats[0].id)!
              const last = byId.get('b:' + line.beats[line.beats.length - 1].id)!
              return (
                <g key={line.id}>
                  {chain.map((e, i) => {
                    const a = byId.get(e.a)!
                    const b = byId.get(e.b)!
                    return (
                      <line
                        key={'c' + i}
                        x1={a.x}
                        y1={a.y}
                        x2={b.x}
                        y2={b.y}
                        stroke={color}
                        strokeWidth={2}
                        markerEnd={marker}
                        opacity={dimEdge(e)}
                      />
                    )
                  })}
                  <line x1={first.x - 90} y1={first.y - 50} x2={first.x - 14} y2={first.y - 8} stroke={color} strokeWidth={1.6} markerEnd={marker} opacity={0.9} />
                  <text x={first.x - 95} y={first.y - 56} fontSize={11} fontWeight={700} fill={color}>
                    {line.name}
                  </text>
                  <line x1={last.x + 14} y1={last.y - 8} x2={last.x + 90} y2={last.y - 50} stroke={color} strokeWidth={1.6} markerEnd={marker} opacity={0.9} />
                  <text x={last.x + 60} y={last.y - 56} fontSize={11} fontWeight={700} fill={color}>
                    {line.name}
                  </text>
                </g>
              )
            })}
            {nodes.map((n) => {
              const tt = tipFor(n)
              const handlers = {
                onMouseEnter: () => setTip({ x: n.x, y: n.y, ...tt }),
                onClick: (ev: React.MouseEvent) => {
                  ev.stopPropagation()
                  setSel(sel === n.id ? null : n.id)
                },
              }
              if (n.kind === 'beat') {
                return (
                  <g key={n.id} opacity={dim(n.id)} style={{ cursor: 'pointer' }} {...handlers}>
                    {n.ring && <circle cx={n.x} cy={n.y} r={14} fill="none" stroke={n.color} strokeWidth={1.5} opacity={0.8} />}
                    <circle cx={n.x} cy={n.y} r={10} fill={n.color} stroke="#ffffff" strokeWidth={2} />
                    <text x={n.x} y={n.y + 26} fontSize={11} fontWeight={600} textAnchor="middle" fill="var(--fg)">
                      {n.label.slice(0, 24)}
                    </text>
                    {n.chOrder != null && (
                      <text x={n.x} y={n.y + 38} fontSize={9} textAnchor="middle" fill="var(--soft)">
                        {t('slChipCh', { n: n.chOrder })}
                      </text>
                    )}
                  </g>
                )
              }
              if (n.kind === 'char') {
                return (
                  <g key={n.id} opacity={dim(n.id)} style={{ cursor: 'pointer' }} {...handlers}>
                    <circle cx={n.x} cy={n.y} r={5} fill={n.color} />
                    <text x={n.x + 9} y={n.y + 3} fontSize={10} fill="var(--soft)">
                      {n.label}
                    </text>
                  </g>
                )
              }
              return (
                <g key={n.id} opacity={dim(n.id)} style={{ cursor: 'pointer' }} {...handlers}>
                  <rect x={n.x - 4.5} y={n.y - 4.5} width={9} height={9} fill={n.color} transform={`rotate(45 ${n.x} ${n.y})`} />
                  <text x={n.x + 9} y={n.y + 3} fontSize={10} fill="var(--soft)">
                    {n.label.slice(0, 26)}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
        {tip && (
          <div
            style={{
              position: 'absolute',
              left: view.x + tip.x * view.s + 14,
              top: view.y + tip.y * view.s - 10,
              maxWidth: 250,
              zIndex: 5,
              pointerEvents: 'none',
              background: 'var(--card)',
              border: '1px solid var(--line)',
              borderRadius: '.5rem',
              padding: '.4rem .6rem',
              boxShadow: '0 4px 14px rgba(0,0,0,.15)',
            }}
          >
            <div className="text-xs font-bold">{tip.title}</div>
            {tip.body && (
              <div className="text-[11px] mt-1" style={{ color: 'var(--soft)' }}>
                {tip.body}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}