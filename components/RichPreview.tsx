import type { InlineRun } from '@/lib/richtext'
import { parseRichText } from '@/lib/richtext'
import { HL_COLORS } from '@/lib/scenes'
import { useEffect, useState } from 'react'
import { getDashStyle, replaceDashes, type DashStyle } from '@/lib/dashes'

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function markText(text: string, q?: string) {
  if (!q || q.trim().length < 2) return <>{text}</>
  const parts = text.split(new RegExp(`(${escapeReg(q)})`, 'gi'))
  return (
    <>
      {parts.map((p, i) =>
        p.toLowerCase() === q.toLowerCase() ? (
          <mark key={i} className="search-mark">
            {p}
          </mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

function RunView({
  r,
  highlight,
  onRef,
  images,
}: {
  r: InlineRun
  highlight?: string
  onRef?: (kind: 'char' | 'event', key: string) => void
  images?: Record<string, PreviewImage>
}) {
  if (r.imgId && images && images[r.imgId]) {
    const im = images[r.imgId]
    return (
      <span
        className="rv-figure"
        style={{
          display: 'block',
          textAlign: (im.align === 'left' || im.align === 'right' ? im.align : 'center') as
            | 'left'
            | 'center'
            | 'right',
          margin: '10px 0',
        }}
      >
        <img
          src={im.base64}
          alt={im.caption}
          style={{ width: im.widthPct + '%', maxWidth: '100%', borderRadius: 6, border: '1px solid var(--line)' }}
        />
        {im.caption && (
          <span style={{ display: 'block', fontSize: 12, marginTop: 4, color: 'var(--soft)' }}>
            {im.caption}
          </span>
        )}
      </span>
    )
  }
  let node: React.ReactNode = r.mention ? (
    onRef && r.refKind ? (
      <button
        type="button"
        className="mention-hl run-mention"
        onClick={() => onRef(r.refKind === 'event' ? 'event' : 'char', r.text)}
      >
        {markText(r.text, highlight)}
      </button>
    ) : (
      <span className="mention-hl">{markText(r.text, highlight)}</span>
    )
  ) : (
    markText(r.text, highlight)
  )
  if (r.bold) node = <strong>{node}</strong>
  if (r.italic) node = <em>{node}</em>
  if (r.size) node = <span style={{ fontSize: `${r.size}px` }}>{node}</span>
  if (r.hl) {
    node = (
      <span
        style={{
          background: HL_COLORS[(r.hl - 1) % HL_COLORS.length] + '55',
          borderRadius: 3,
          padding: '0 2px',
        }}
      >
        {node}
      </span>
    )
  }
  return <>{node}</>
}

export type PreviewImage = { base64: string; caption: string; align: string; widthPct: number }

export default function RichPreview({
  text,
  highlight,
  onRef,
  images,
}: {
  text: string
  highlight?: string
  onRef?: (kind: 'char' | 'event', key: string) => void
  images?: Record<string, PreviewImage>
}) {
  const [dash, setDash] = useState<DashStyle>('en')
  useEffect(() => {
    setDash(getDashStyle())
  }, [])
  const blocks = parseRichText(replaceDashes(text, dash))
  if (blocks.length === 0) return null
  return (
    <div className="prose-write">
        {blocks.map((b, i) => (
          <p key={i} style={b.sep ? { letterSpacing: 8, color: 'var(--soft)' } : undefined}>
            {b.lines.map((line, j) => (
              <span key={j} style={{ display: 'block', textAlign: line.align }}>
                {line.runs.map((r, k) => (
                  <RunView key={k} r={r} highlight={highlight} onRef={onRef} images={images} />
                ))}
              </span>
            ))}
          </p>
        ))}
    </div>
  )
}