'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { ZoomIn, ZoomOut, Maximize, Minimize, RotateCcw } from 'lucide-react'
import type { GraphData } from '@/lib/actions'
import { roleLabel } from '@/lib/roles'
import { useLang } from '@/lib/useLang'
import type { StrKey } from '@/lib/i18n'

type Mode = 'plot' | 'characters' | 'events'
type Kind = 'chapter' | 'character' | 'event'

type NodeT = {
  id: string
  kind: Kind
  label: string
  snippet: string | null
  role: string | null
}

const COLORS: Record<Kind, string> = {
  chapter: '#a9812f',
  character: '#8c3a2b',
  event: '#4c3d8f',
}

const KIND_KEY: Record<Kind, StrKey> = {
  chapter: 'gcKindChapter',
  character: 'gcKindCharacter',
  event: 'gcKindEvent',
}

const BIG_ROLES = ['protagonist', 'antagonist']
const MID_ROLES = ['tritagonist', 'secondary']

function buildGraph(data: GraphData, mode: Mode) {
  const nodeMap = new Map<string, NodeT>()
  const put = (n: NodeT) => {
    if (!nodeMap.has(n.id)) nodeMap.set(n.id, n)
  }

  for (const c of data.chapters) put({ id: `ch:${c.id}`, kind: 'chapter', label: c.title, snippet: c.firstSentence, role: null })
  for (const c of data.characters) put({ id: `char:${c.id}`, kind: 'character', label: c.name, snippet: c.snippet, role: c.role })
  for (const e of data.events) put({ id: `ev:${e.id}`, kind: 'event', label: e.label, snippet: e.snippet, role: null })

  const wanted =
    mode === 'plot'
      ? ['ch-ch', 'ch-char', 'ch-event']
      : mode === 'characters'
        ? ['char-char', 'ch-char', 'ev-char']
        : ['ch-event', 'ev-char']

  const mapEdge = (kind: string, a: string, b: string): [string, string] => {
    if (kind === 'ch-ch') return [`ch:${a}`, `ch:${b}`]
    if (kind === 'ch-char') return [`ch:${a}`, `char:${b}`]
    if (kind === 'ch-event') return [`ch:${a}`, `ev:${b}`]
    if (kind === 'char-char') return [`char:${a}`, `char:${b}`]
    return [`ev:${a}`, `char:${b}`]
  }

  const weights = new Map<string, number>()
  for (const e of data.edges) {
    if (!wanted.includes(e.kind)) continue
    const [a, b] = mapEdge(e.kind, e.a, e.b)
    if (a === b) continue
    const key = a < b ? `${a}|${b}` : `${b}|${a}`
    weights.set(key, (weights.get(key) ?? 0) + 1)
  }
  const edges: { a: string; b: string; w: number }[] = []
  for (const [key, w] of weights) {
    const [a, b] = key.split('|')
    edges.push({ a, b, w })
  }

  const connected = new Set<string>()
  for (const e of edges) {
    connected.add(e.a)
    connected.add(e.b)
  }

  const nodes = [...nodeMap.values()].filter((n) => {
    if (mode === 'plot') return n.kind === 'chapter' || connected.has(n.id)
    if (mode === 'characters') return n.kind === 'character' || connected.has(n.id)
    return n.kind === 'event' || connected.has(n.id)
  })

  const radius = (n: NodeT): number => {
    if (mode === 'plot') return n.kind === 'chapter' ? 24 : n.kind === 'event' ? 13 : 9
    if (mode === 'characters') {
      if (n.kind === 'character') {
        if (n.role && BIG_ROLES.includes(n.role)) return 24
        if (n.role && MID_ROLES.includes(n.role)) return 15
        return 9
      }
      return n.kind === 'event' ? 11 : 9
    }
    return n.kind === 'event' ? 22 : 11
  }

  return { nodes, edges, radius }
}

type EdgeT = { a: string; b: string; w: number }

function clusterCenters(kinds: Kind[]): Map<Kind, { x: number; y: number }> {
  const m = new Map<Kind, { x: number; y: number }>()
  if (kinds.length === 1) {
    m.set(kinds[0], { x: 500, y: 310 })
  } else if (kinds.length === 2) {
    m.set(kinds[0], { x: 320, y: 310 })
    m.set(kinds[1], { x: 680, y: 310 })
  } else {
    m.set(kinds[0], { x: 500, y: 185 })
    m.set(kinds[1], { x: 275, y: 435 })
    m.set(kinds[2], { x: 725, y: 435 })
  }
  return m
}

function simulate(nodes: NodeT[], edges: EdgeT[], radius: (n: NodeT) => number) {
  const W = 1000
  const H = 620
  const PAD = 70
  if (nodes.length === 0) return []
  const idx = new Map(nodes.map((n, i) => [n.id, i]))
  const kindsPresent = (['chapter', 'character', 'event'] as Kind[]).filter((k) =>
    nodes.some((n) => n.kind === k),
  )
  const centers = clusterCenters(kindsPresent)
  const byKind = new Map<Kind, number[]>()
  nodes.forEach((n, i) => {
    const arr = byKind.get(n.kind) ?? []
    arr.push(i)
    byKind.set(n.kind, arr)
  })
  const ringR = (count: number) => Math.min(190, 60 + count * 13)

  const pos = nodes.map(() => ({ x: 0, y: 0 }))
  for (const [kind, arr] of byKind) {
    const c = centers.get(kind)!
    const R = ringR(arr.length)
    arr.forEach((ni, k) => {
      const a = (k / arr.length) * Math.PI * 2 - Math.PI / 2
      pos[ni].x = c.x + Math.cos(a) * R
      pos[ni].y = c.y + Math.sin(a) * R
    })
  }

  const neigh = nodes.map(() => [] as { j: number; w: number }[])
  for (const e of edges) {
    const a = idx.get(e.a)
    const b = idx.get(e.b)
    if (a == null || b == null) continue
    neigh[a].push({ j: b, w: e.w })
    neigh[b].push({ j: a, w: e.w })
  }
  for (const [kind, arr] of byKind) {
    const c = centers.get(kind)!
    const scored = arr.map((ni, fallback) => {
      let wx = 0
      let wy = 0
      for (const { j, w } of neigh[ni]) {
        wx += (pos[j].x - c.x) * w
        wy += (pos[j].y - c.y) * w
      }
      return {
        ni,
        angle: neigh[ni].length ? Math.atan2(wy, wx) : (fallback / arr.length) * Math.PI * 2,
      }
    })
    scored.sort((p, q) => p.angle - q.angle)
    const R = ringR(arr.length)
    scored.forEach((s, k) => {
      const a = (k / scored.length) * Math.PI * 2 - Math.PI / 2
      pos[s.ni].x = c.x + Math.cos(a) * R
      pos[s.ni].y = c.y + Math.sin(a) * R
    })
  }

  const iterations = 90
  for (let it = 0; it < iterations; it++) {
    const cool = 1 - it / iterations
    const f = nodes.map(() => ({ x: 0, y: 0 }))
    for (const e of edges) {
      const a = idx.get(e.a)
      const b = idx.get(e.b)
      if (a == null || b == null) continue
      const dx = pos[b].x - pos[a].x
      const dy = pos[b].y - pos[a].y
      const d = Math.sqrt(dx * dx + dy * dy) || 1
      const rest = Math.max(70, 170 - e.w * 22)
      const force = (d - rest) * 0.015
      f[a].x += (dx / d) * force
      f[a].y += (dy / d) * force
      f[b].x -= (dx / d) * force
      f[b].y -= (dy / d) * force
    }
    for (let i = 0; i < nodes.length; i++) {
      const c = centers.get(nodes[i].kind)!
      const arr = byKind.get(nodes[i].kind)!
      const R = ringR(arr.length)
      const dx = pos[i].x - c.x
      const dy = pos[i].y - c.y
      const d = Math.sqrt(dx * dx + dy * dy) || 1
      const pull = (R - d) * 0.06
      f[i].x += (dx / d) * pull
      f[i].y += (dy / d) * pull
    }
    for (let i = 0; i < nodes.length; i++) {
      pos[i].x += Math.max(-14, Math.min(14, f[i].x)) * cool
      pos[i].y += Math.max(-14, Math.min(14, f[i].y)) * cool
    }
  }

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  for (const p of pos) {
    minX = Math.min(minX, p.x)
    maxX = Math.max(maxX, p.x)
    minY = Math.min(minY, p.y)
    maxY = Math.max(maxY, p.y)
  }
  const s = Math.min((W - PAD * 2) / (maxX - minX || 1), (H - PAD * 2) / (maxY - minY || 1))
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  return pos.map((p) => ({
    x: W / 2 + (p.x - cx) * s,
    y: H / 2 + (p.y - cy) * s,
  }))
}

export default function GraphCloud({ data }: { data: GraphData }) {
  const { lang, t } = useLang()
  const [mode, setMode] = useState<Mode>('plot')
  const [hover, setHover] = useState<string | null>(null)
  const [view, setView] = useState({ scale: 1, x: 0, y: 0 })
  const [isFull, setIsFull] = useState(false)
  const [dragging, setDragging] = useState(false)

  const wrapRef = useRef<HTMLDivElement | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null)

  useEffect(() => {
    const onFs = () => setIsFull(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  useEffect(() => {
    const el = viewportRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      setView((v) => ({
        ...v,
        scale: Math.min(4, Math.max(0.4, v.scale * (e.deltaY < 0 ? 1.12 : 0.9))),
      }))
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const toggleFull = async () => {
    const el = wrapRef.current
    if (!el) return
    if (document.fullscreenElement) await document.exitFullscreen()
    else await el.requestFullscreen()
  }

  const graph = useMemo(() => buildGraph(data, mode), [data, mode])
  const positions = useMemo(() => simulate(graph.nodes, graph.edges, graph.radius), [graph])

  const posById = useMemo(() => {
    const m = new Map<string, { x: number; y: number }>()
    graph.nodes.forEach((n, i) => m.set(n.id, positions[i]))
    return m
  }, [graph.nodes, positions])

  const hoverNode = hover ? graph.nodes.find((n) => n.id === hover) ?? null : null
  const hoverPos = hover ? posById.get(hover) ?? null : null
  const tipBelow = hoverPos ? hoverPos.y < 160 : false

  const MODES: { key: Mode; label: StrKey }[] = [
    { key: 'plot', label: 'gcPlot' },
    { key: 'characters', label: 'gcCharacters' },
    { key: 'events', label: 'gcEvents' },
  ]

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs font-semibold" style={{ color: 'var(--soft)' }}>{t('gcMode')}</span>
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMode(m.key)}
            className={`chip-btn ${mode === m.key ? 'chip-btn-active' : ''}`}
          >
            {t(m.label)}
          </button>
        ))}

        <span className="flex-1" />
        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--soft)' }}>
          <i className="graph-dot" style={{ background: COLORS.chapter }} /> {t('gcLegendCh')}
        </span>
        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--soft)' }}>
          <i className="graph-dot" style={{ background: COLORS.character }} /> {t('gcLegendChar')}
        </span>
        <span className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--soft)' }}>
          <i className="graph-dot" style={{ background: COLORS.event }} /> {t('gcLegendEv')}
        </span>
      </div>

      {graph.nodes.length < 2 ? (
        <div className="card p-10 text-center text-sm" style={{ color: 'var(--soft)' }}>
          {t('gcEmpty')}
        </div>
      ) : (
        <div
          ref={wrapRef}
          className={`relative card overflow-hidden ${isFull ? 'graph-full' : ''}`}
          style={{ background: 'var(--graph-bg)' }}
        >
          <div className="graph-controls">
            <button title={t('gcZoomIn')} onClick={() => setView((v) => ({ ...v, scale: Math.min(4, v.scale * 1.2) }))}>
              <ZoomIn size={15} />
            </button>
            <button title={t('gcZoomOut')} onClick={() => setView((v) => ({ ...v, scale: Math.max(0.4, v.scale / 1.2) }))}>
              <ZoomOut size={15} />
            </button>
            <button title={t('gcResetView')} onClick={() => setView({ scale: 1, x: 0, y: 0 })}>
              <RotateCcw size={15} />
            </button>
            <button title={isFull ? t('gcExitFull') : t('gcFull')} onClick={toggleFull}>
              {isFull ? <Minimize size={15} /> : <Maximize size={15} />}
            </button>
          </div>

          <div
            ref={viewportRef}
            className="graph-viewport"
            style={{ cursor: dragging ? 'grabbing' : 'grab' }}
            onMouseDown={(e) => {
              drag.current = { sx: e.clientX, sy: e.clientY, ox: view.x, oy: view.y }
              setDragging(true)
            }}
            onMouseMove={(e) => {
              const d = drag.current
              if (!d) return
              setView((v) => ({ ...v, x: d.ox + e.clientX - d.sx, y: d.oy + e.clientY - d.sy }))
            }}
            onMouseUp={() => {
              drag.current = null
              setDragging(false)
            }}
            onMouseLeave={() => {
              drag.current = null
              setDragging(false)
            }}
          >
            <div
              style={{
                width: '100%',
                transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})`,
                transformOrigin: '50% 50%',
              }}
            >
              <svg
                viewBox="0 0 1000 620"
                preserveAspectRatio="xMidYMid meet"
                style={{ width: '100%', height: isFull ? '100%' : 'auto', display: 'block' }}
              >
                {graph.edges.map((e, i) => {
                  const pa = posById.get(e.a)
                  const pb = posById.get(e.b)
                  if (!pa || !pb) return null
                  const active = hover === e.a || hover === e.b
                  return (
                    <line
                      key={i}
                      x1={pa.x}
                      y1={pa.y}
                      x2={pb.x}
                      y2={pb.y}
                      stroke={active ? '#8c3a2b' : 'rgba(111,102,92,.32)'}
                      strokeWidth={active ? 2.4 : Math.min(1 + e.w * 0.5, 3.5)}
                      strokeOpacity={active ? 1 : Math.min(0.35 + e.w * 0.12, 0.8)}
                    />
                  )
                })}
                {graph.nodes.map((n) => {
                  const p = posById.get(n.id)
                  if (!p) return null
                  const r = graph.radius(n)
                  return (
                    <g key={n.id}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={r}
                        className="graph-node"
                        strokeWidth={2.5}
                        opacity={hover && hover !== n.id ? 0.55 : 1}
                        style={{ cursor: 'pointer', transition: 'opacity .15s', fill: COLORS[n.kind] }}
                        onMouseEnter={() => setHover(n.id)}
                        onMouseLeave={() => setHover(null)}
                      />
                      {r >= 15 && (
                        <text
                          x={p.x}
                          y={p.y + r + 14}
                          textAnchor="middle"
                          fontSize={11}
                          fontWeight={700}
                          className="graph-label"
                          style={{ pointerEvents: 'none' }}
                        >
                          {n.label.length > 20 ? n.label.slice(0, 20) + '…' : n.label}
                        </text>
                      )}
                    </g>
                  )
                })}
              </svg>

              {hoverNode && hoverPos && (
                <div
                  className="graph-tip"
                  style={{
                    left: `${hoverPos.x / 10}%`,
                    top: `${hoverPos.y / 6.2}%`,
                    transform: `${tipBelow ? 'translate(-50%, 24px)' : 'translate(-50%, calc(-100% - 20px))'} scale(${1 / view.scale})`,
                    transformOrigin: tipBelow ? '50% 0%' : '50% 100%',
                  }}
                >
                  <div className="tv-tape" />
                  <div className="tv-date">
                    {t(KIND_KEY[hoverNode.kind])}
                    {hoverNode.kind === 'character' ? ` · ${roleLabel(hoverNode.role, lang)}` : ''}
                  </div>
                  <div className="tv-title">{hoverNode.label}</div>
                  {hoverNode.snippet && <p className="tv-summary">{hoverNode.snippet}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}