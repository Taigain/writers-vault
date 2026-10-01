export type Align = 'left' | 'center' | 'right'
export type InlineRun = {
  text: string
  bold: boolean
  italic: boolean
  size: number | null
  mention: boolean
  hl: number | null
}
export type RichBlock = {
  align: Align
  lines: InlineRun[][]
}
type Base = { bold: boolean; italic: boolean; size: number | null; hl: number | null }
const ALIGN_RE = /^\[(left|center|right)\]\s*/i
const TOKEN_RE =
  /(\[@[^\]]*\])|(\[#[^\]]*\])|(\[sc:[^\]]*\])|(\[\/sc\])|(\[hl=\d+\])|(\[\/hl\])|(\*\*[\s\S]+?\*\*)|(\*[\s\S]+?\*)|(\[size=\d+\][\s\S]*?\[\/size\])/g

function parseInline(text: string, base: Base): InlineRun[] {
  const runs: InlineRun[] = []
  let last = 0
  let cur: Base = { ...base }
  const push = (t: string) => {
    if (!t) return
    runs.push({ text: t, bold: cur.bold, italic: cur.italic, size: cur.size, mention: false, hl: cur.hl })
  }
  const re = new RegExp(TOKEN_RE.source, 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) push(text.slice(last, m.index))
    const tok = m[0]
    if (m[1] || m[2]) {
      runs.push({ text: tok.slice(2, -1), bold: true, italic: false, size: cur.size, mention: true, hl: cur.hl })
    } else if (m[3] || m[4]) {
      /* границы сцены: видимого текста нет */
    } else if (m[5]) {
      cur = { ...cur, hl: parseInt(tok.slice(4, -1), 10) }
    } else if (m[6]) {
      cur = { ...cur, hl: null }
    } else if (m[7]) {
      runs.push(...parseInline(tok.slice(2, -2), { ...cur, bold: true }))
    } else if (m[8]) {
      runs.push(...parseInline(tok.slice(1, -1), { ...cur, italic: true }))
    } else if (m[9]) {
      const sm = tok.match(/^\[size=(\d+)\]/)
      if (sm) {
        const size = parseInt(sm[1], 10)
        const inner = tok.slice(sm[0].length, tok.length - '[/size]'.length)
        runs.push(...parseInline(inner, { ...cur, size }))
      }
    }
    last = m.index + tok.length
  }
  if (last < text.length) push(text.slice(last))
  return runs
}

export function parseRichText(text: string): RichBlock[] {
  const blocks: RichBlock[] = []
  const paragraphs = text.replace(/\r/g, '').split(/\n{2,}/)
  for (const raw of paragraphs) {
    const p = raw.trim()
    if (!p) continue
    let align: Align = 'left'
    let body = p
    const m = body.match(ALIGN_RE)
    if (m) {
      align = m[1].toLowerCase() as Align
      body = body.slice(m[0].length)
    }
    blocks.push({
      align,
      lines: body
        .split('\n')
        .map((ln) => parseInline(ln, { bold: false, italic: false, size: null, hl: null })),
    })
  }
  return blocks
}