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

function RunView({ r, highlight }: { r: InlineRun; highlight?: string }) {
  let node: React.ReactNode = r.mention ? (
    <span className="mention-hl">{markText(r.text, highlight)}</span>
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

export default function RichPreview({ text, highlight }: { text: string; highlight?: string }) {
  const [dash, setDash] = useState<DashStyle>('en')
  useEffect(() => {
    setDash(getDashStyle())
  }, [])
  const blocks = parseRichText(replaceDashes(text, dash))
  if (blocks.length === 0) return null
  return (
    <div className="prose-write">
      {blocks.map((b, i) => (
        <p key={i} style={{ textAlign: b.align }}>
          {b.lines.map((line, j) => (
            <span key={j}>
              {j > 0 && <br />}
              {line.map((r, k) => (
                <RunView key={k} r={r} highlight={highlight} />
              ))}
            </span>
          ))}
        </p>
      ))}
    </div>
  )
}