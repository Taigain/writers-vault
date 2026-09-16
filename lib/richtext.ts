export type Align = 'left' | 'center' | 'right'

export type InlineRun = {
  text: string
  bold: boolean
  italic: boolean
  size: number | null
  mention: boolean
}

export type RichBlock = {
  align: Align
  lines: InlineRun[][]
}

type Base = { bold: boolean; italic: boolean; size: number | null }

const ALIGN_RE = /^\[(left|center|right)\]\s*/i

const TOKEN_RE =
  /(\[@[^\]]*\])|(\[#[^\]]*\])|(\*\*[\s\S]+?\*\*)|(\*[\s\S]+?\*)|(\[size=\d+\][\s\S]*?\[\/size\])/g

function pushPlain(text: string, base: Base, runs: InlineRun[]) {
  if (!text) return
  runs.push({ text, bold: base.bold, italic: base.italic, size: base.size, mention: false })
}

function parseInline(text: string, base: Base): InlineRun[] {
  const runs: InlineRun[] = []
  let last = 0
  const re = new RegExp(TOKEN_RE.source, 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index > last) pushPlain(text.slice(last, m.index), base, runs)
    const tok = m[0]
    if (m[1] || m[2]) {
      runs.push({ text: tok.slice(2, -1), bold: true, italic: false, size: base.size, mention: true })
    } else if (m[3]) {
      runs.push(...parseInline(tok.slice(2, -2), { ...base, bold: true }))
    } else if (m[4]) {
      runs.push(...parseInline(tok.slice(1, -1), { ...base, italic: true }))
    } else if (m[5]) {
      const sm = tok.match(/^\[size=(\d+)\]/)
      if (sm) {
        const size = parseInt(sm[1], 10)
        const inner = tok.slice(sm[0].length, tok.length - '[/size]'.length)
        runs.push(...parseInline(inner, { ...base, size }))
      }
    }
    last = m.index + tok.length
  }
  if (last < text.length) pushPlain(text.slice(last), base, runs)
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
    blocks.push({ align, lines: body.split('\n').map((ln) => parseInline(ln, { bold: false, italic: false, size: null })) })
  }
  return blocks
}