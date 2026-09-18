import type { InlineRun } from '@/lib/richtext'
import { parseRichText } from '@/lib/richtext'

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
          <mark key={i} className="search-mark">{p}</mark>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  )
}

function RunView({ r, highlight }: { r: InlineRun; highlight?: string }) {
  if (r.mention) return <span className="mention-hl">{markText(r.text, highlight)}</span>
  let node: React.ReactNode = markText(r.text, highlight)
  if (r.bold) node = <strong>{node}</strong>
  if (r.italic) node = <em>{node}</em>
  if (r.size) node = <span style={{ fontSize: `${r.size}px` }}>{node}</span>
  return <>{node}</>
}

export default function RichPreview({ text, highlight }: { text: string; highlight?: string }) {
  const blocks = parseRichText(text)
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