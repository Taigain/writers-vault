import type { InlineRun } from '@/lib/richtext'
import { parseRichText } from '@/lib/richtext'

function RunView({ r }: { r: InlineRun }) {
  if (r.mention) return <span className="mention-hl">{r.text}</span>
  let node: React.ReactNode = r.text
  if (r.bold) node = <strong>{node}</strong>
  if (r.italic) node = <em>{node}</em>
  if (r.size) node = <span style={{ fontSize: `${r.size}px` }}>{node}</span>
  return <>{node}</>
}

export default function RichPreview({ text }: { text: string }) {
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
                <RunView key={k} r={r} />
              ))}
            </span>
          ))}
        </p>
      ))}
    </div>
  )
}