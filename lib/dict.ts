export type DictForm = { d: string; b: string }
export type DictEntryMap = { word: string; forms: Record<string, string> }
export type DictMap = Record<string, DictEntryMap>

const DICT_RE = /\[~([^\]\n]+)\]/g

export function parseForms(raw: string | null | undefined): DictForm[] {
  if (!raw) return []
  try {
    const arr = JSON.parse(raw) as DictForm[]
    return Array.isArray(arr) ? arr.filter((p) => p && typeof p.d === 'string' && typeof p.b === 'string') : []
  } catch {
    return []
  }
}

export function buildDictMap(rows: { key: string; word: string; forms: DictForm[] }[]): DictMap {
  const map: DictMap = {}
  for (const r of rows) {
    const entry: DictEntryMap = { word: r.word, forms: {} }
    for (const p of r.forms) entry.forms[p.d.toLowerCase()] = p.b
    map[r.key] = entry
    for (const p of r.forms) {
      const dk = p.d.toLowerCase()
      if (!map[dk]) map[dk] = entry
    }
  }
  return map
}

function transferCase(src: string, dst: string): string {
  if (!src || !dst) return dst
  const letters = src.replace(/[^\p{L}]/gu, '')
  if (letters.length > 1 && letters === letters.toUpperCase()) return dst.toUpperCase()
  if (letters.length > 0 && letters[0] === letters[0].toUpperCase()) {
    return dst.charAt(0).toUpperCase() + dst.slice(1)
  }
  return dst
}

export function applyDict(text: string, dict: DictMap): string {
  if (!text || text.indexOf('[~') === -1) return text
  return text.replace(DICT_RE, (_m, raw: string) => {
    const token = raw.trim()
    const entry = dict[token.toLowerCase()]
    if (!entry) return token
    const base = entry.forms[token.toLowerCase()] ?? entry.word
    return transferCase(token, base)
  })
}