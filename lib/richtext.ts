import { isSeparatorLine } from './mask'

export type Align = 'left' | 'center' | 'right'
export type InlineRun = {
  text: string
  bold: boolean
  italic: boolean
  size: number | null
  mention: boolean
  hl: number | null
  refKind: 'char' | 'event' | null
  imgId?: string
}
export type RichLine = { align: Align; runs: InlineRun[] }
export type RichBlock = { sep?: boolean; lines: RichLine[] }

type Base = {
  bold: boolean
  italic: boolean
  size: number | null
  hl: number | null
  hlStack: number[]
}

const BASE: Base = { bold: false, italic: false, size: null, hl: null, hlStack: [] }

const ALIGN_RE = /^\[(left|center|right)\]\s*/i

// Разбор БЕЗ регулярных выражений по токенам: ручной сканер по символам.
// Не зависит от экранирования, групп захвата и lastIndex, поэтому
// устойчив к любым повреждениям шаблона при ручных правках файла.
function parseInline(text: string, base: Base): InlineRun[] {
  const runs: InlineRun[] = []
  let cur: Base = { ...base, hlStack: [...base.hlStack] }
  let plain = ''
  const flush = () => {
    if (!plain) return
    runs.push({
      text: plain,
      bold: cur.bold,
      italic: cur.italic,
      size: cur.size,
      mention: false,
      hl: cur.hl,
      refKind: null,
    })
    plain = ''
  }
  let i = 0
  while (i < text.length) {
    const ch = text[i]
    if (ch === '[') {
      const close = text.indexOf(']', i + 1)
      if (close !== -1) {
        const tok = text.slice(i, close + 1)
        if (tok.startsWith('[@') || tok.startsWith('[#')) {
          const inner = tok.slice(2, -1)
          flush()
          runs.push({
            text: tok.startsWith('[#') ? inner.replace(/_/g, ' ') : inner,
            bold: true,
            italic: false,
            size: cur.size,
            mention: true,
            hl: cur.hl,
            refKind: tok.startsWith('[@') ? 'char' : 'event',
          })
          i = close + 1
          continue
        }
        if (tok.startsWith('[sc:') || tok === '[/sc]') {
          flush()
          i = close + 1
          continue
        }
        if (tok.startsWith('[hl=')) {
          flush()
          const n = parseInt(tok.slice(4, -1), 10)
          cur = { ...cur, hl: n, hlStack: [...cur.hlStack, n] }
          i = close + 1
          continue
        }
        if (tok === '[/hl]') {
          flush()
          const stack = cur.hlStack.slice(0, -1)
          cur = { ...cur, hlStack: stack, hl: stack.length ? stack[stack.length - 1] : null }
          i = close + 1
          continue
        }
        if (tok === '[lng]' || tok === '[/lng]' || tok.startsWith('[lang:') || tok === '[/lang]') {
          flush()
          i = close + 1
          continue
        }
        if (tok.startsWith('[img:')) {
          flush()
          runs.push({
            text: '',
            bold: cur.bold,
            italic: cur.italic,
            size: cur.size,
            mention: false,
            hl: cur.hl,
            refKind: null,
            imgId: tok.slice(5, -1),
          })
          i = close + 1
          continue
        }
        if (tok.startsWith('[size=')) {
          const END = '[/size]'
          const endIdx = text.indexOf(END, close + 1)
          if (endIdx !== -1) {
            const size = parseInt(tok.slice(6, -1), 10)
            const inner = text.slice(close + 1, endIdx)
            flush()
            runs.push(...parseInline(inner, { ...cur, size }))
            i = endIdx + END.length
            continue
          }
        }
      }
      plain += ch
      i++
      continue
    }
    if (ch === '*') {
      if (text.startsWith('**', i)) {
        const endIdx = text.indexOf('**', i + 2)
        if (endIdx !== -1) {
          flush()
          runs.push(...parseInline(text.slice(i + 2, endIdx), { ...cur, bold: true }))
          i = endIdx + 2
          continue
        }
      }
      const endIdx = text.indexOf('*', i + 1)
      const nlIdx = text.indexOf('\n', i + 1)
      if (endIdx > i + 1 && (nlIdx === -1 || endIdx < nlIdx)) {
        flush()
        runs.push(...parseInline(text.slice(i + 1, endIdx), { ...cur, italic: true }))
        i = endIdx + 1
        continue
      }
      plain += ch
      i++
      continue
    }
    plain += ch
    i++
  }
  flush()
  return runs
}

export function parseRichText(text: string): RichBlock[] {
  const blocks: RichBlock[] = []
  const paragraphs = text.replace(/\r/g, '').split(/\n{2,}/)
  for (const raw of paragraphs) {
    const p = raw.trim()
    if (!p) continue
    if (isSeparatorLine(p)) {
      blocks.push({
        sep: true,
        lines: [
          {
            align: 'center',
            runs: [
              { text: '* * *', bold: false, italic: false, size: null, mention: false, hl: null, refKind: null },
            ],
          },
        ],
      })
      continue
    }
    blocks.push({
      lines: p.split('\n').map((ln) => {
        const m = ln.match(ALIGN_RE)
        const align: Align = m ? (m[1].toLowerCase() as Align) : 'left'
        const body = m ? ln.slice(m[0].length) : ln
        return { align, runs: parseInline(body, BASE) }
      }),
    })
  }
  return blocks
}