export type QuoteStyle = { key: string; open: string; close: string; label: string }

export const QUOTE_STYLES: QuoteStyle[] = [
  { key: 'guillemets', open: '«', close: '»', label: '«…»' },
  { key: 'laps', open: '„', close: '“', label: '„…“' },
  { key: 'english', open: '“', close: '”', label: '“…”' },
]

const LS_KEY = 'wv-quotes'

export function getQuoteStyle(): QuoteStyle {
  try {
    const k = localStorage.getItem(LS_KEY)
    return QUOTE_STYLES.find((s) => s.key === k) ?? QUOTE_STYLES[0]
  } catch {
    return QUOTE_STYLES[0]
  }
}

export function setQuoteStyle(key: string) {
  try {
    localStorage.setItem(LS_KEY, key)
  } catch {
    /* ignore */
  }
}

const QUOTE_CHARS = new Set(['«', '»', '„', '“', '”', '"', '‘', '’'])

export function normalizeQuotes(text: string, style: QuoteStyle): string {
  let open = true
  let out = ''
  for (const ch of text) {
    if (QUOTE_CHARS.has(ch)) {
      out += open ? style.open : style.close
      open = !open
    } else {
      out += ch
    }
  }
  return out
}