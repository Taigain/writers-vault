import mammoth from 'mammoth'
import Jimp from 'jimp'

export type ImportResult = {
  coverBase64: string | null
  chapters: { title: string; content: string }[]
  warnings: string[]
}

const MIN_COVER_DIM = 400
const MIN_TEXT_FOR_CONTENT = 40

const ENTITIES: [RegExp, string][] = [
  [/&nbsp;/g, ' '],
  [/&amp;/g, '&'],
  [/&lt;/g, '<'],
  [/&gt;/g, '>'],
  [/&quot;/g, '"'],
  [/&#39;/g, "'"],
  [/[\u201C\u201D]/g, '"'],
  [/[\u2018\u2019]/g, "'"],
]

function decodeEntities(s: string): string {
  let out = s
  for (const [re, v] of ENTITIES) out = out.replace(re, v)
  return out
}

function applyInline(s: string): string {
  let out = s
  out = out.replace(/<(?:strong|b)[^>]*>([\s\S]*?)<\/(?:strong|b)>/gi, '**$1**')
  out = out.replace(/<(?:em|i)[^>]*>([\s\S]*?)<\/(?:em|i)>/gi, '*$1*')
  out = out.replace(/<br\s*\/?>/gi, '\n')
  out = out.replace(/<[^>]+>/g, '')
  return decodeEntities(out)
}

function stripTags(s: string): string {
  return decodeEntities(s.replace(/<[^>]+>/g, ''))
}

type Block =
  | { type: 'img'; src: string }
  | { type: 'heading'; level: number; text: string }
  | { type: 'text'; text: string }

const IMG_SRC = '<img\\s+[^>]*?src=["\']([^"\']+)["\'][^>]*>'

function htmlToBlocks(html: string): Block[] {
  const blocks: Block[] = []
  const tokenRe = /<(h[1-6])(?:\s[^>]*)?>|<\/h[1-6]>|<p(?:\s[^>]*)?>|<\/p>|<img\s+[^>]*>/gi
  let buf = ''
  let mode: 'none' | 'p' | 'h' = 'none'
  let headLevel = 0

  const flushBuf = () => {
    if (mode === 'h') {
      blocks.push({ type: 'heading', level: headLevel, text: stripTags(buf).trim() })
    } else {
      const imgRe = new RegExp(IMG_SRC, 'gi')
      let m: RegExpExecArray | null
      while ((m = imgRe.exec(buf)) !== null) {
        blocks.push({ type: 'img', src: m[1] })
      }
      const text = applyInline(buf.replace(new RegExp(IMG_SRC, 'gi'), '')).trim()
      if (text) blocks.push({ type: 'text', text })
    }
    buf = ''
    mode = 'none'
  }

  let last = 0
  let m: RegExpExecArray | null
  while ((m = tokenRe.exec(html)) !== null) {
    const between = html.slice(last, m.index)
    last = tokenRe.lastIndex
    const tok = m[0].toLowerCase()
    if (mode !== 'none') {
      buf += between
    } else if (between.trim()) {
      buf += between
      mode = 'p'
    }
    if (tok.startsWith('<h') && m[1]) {
      if (mode !== 'none') flushBuf()
      mode = 'h'
      headLevel = parseInt(m[1], 10)
    } else if (tok.startsWith('</h')) {
      if (mode === 'h') flushBuf()
    } else if (tok.startsWith('<p')) {
      if (mode !== 'none') flushBuf()
      mode = 'p'
    } else if (tok === '</p>') {
      if (mode === 'p') flushBuf()
    } else if (tok.startsWith('<img')) {
      if (mode === 'none') {
        const src = new RegExp(IMG_SRC, 'i').exec(m[0])?.[1]
        if (src) blocks.push({ type: 'img', src })
      } else {
        buf += m[0]
      }
    }
  }
  const tail = html.slice(last)
  if (tail.trim() || mode !== 'none') {
    buf += tail
    flushBuf()
  }
  return blocks
}

async function normalizeImage(dataUri: string): Promise<string | null> {
  try {
    const img = await Jimp.read(dataUri)
    const w = img.bitmap.width
    const h = img.bitmap.height
    if (w < MIN_COVER_DIM || h < MIN_COVER_DIM) return null
    const maxDim = 1400
    if (w > maxDim || h > maxDim) {
      if (w >= h) img.resize(maxDim, Jimp.AUTO)
      else img.resize(Jimp.AUTO, maxDim)
    }
    const buf = await img.getBufferAsync(Jimp.MIME_JPEG)
    return 'data:image/jpeg;base64,' + buf.toString('base64')
  } catch {
    return null
  }
}

export async function importDocx(buffer: Buffer): Promise<ImportResult> {
  const warnings: string[] = []
  const result = await mammoth.convertToHtml({ buffer })
  const html = result.value ?? ''
  for (const msg of result.messages ?? []) {
    if (msg.type === 'warning') warnings.push(msg.message)
  }
  const blocks = htmlToBlocks(html)

  const chapters: { title: string; content: string }[] = []
  let coverBase64: string | null = null
  let coverFound = false
  let firstContentSeen = false
  let currentTitle = 'Глава 1'
  let currentParts: string[] = []

  const flush = () => {
    const content = currentParts.join('\n\n').replace(/\n{3,}/g, '\n\n').trim()
    if (content.length > 0 || currentTitle !== 'Глава 1') {
      chapters.push({ title: currentTitle, content })
    }
    currentParts = []
  }

  for (const b of blocks) {
    if (b.type === 'img') {
      if (!coverFound && !firstContentSeen && b.src.startsWith('data:image')) {
        coverBase64 = await normalizeImage(b.src)
        coverFound = true
        if (!coverBase64) warnings.push('Обложка слишком маленькая и пропущена')
      }
      continue
    }
    if (b.type === 'heading') {
      if (b.level <= 2) {
        flush()
        currentTitle = b.text || 'Глава ' + (chapters.length + 1)
        firstContentSeen = true
      } else {
        currentParts.push('**' + b.text + '**')
        if (b.text.length >= MIN_TEXT_FOR_CONTENT) firstContentSeen = true
      }
      continue
    }
    if (!firstContentSeen && b.text.length >= MIN_TEXT_FOR_CONTENT) firstContentSeen = true
    currentParts.push(b.text)
  }
  flush()

  if (chapters.length === 0) chapters.push({ title: 'Глава 1', content: '' })
  return { coverBase64, chapters, warnings }
}