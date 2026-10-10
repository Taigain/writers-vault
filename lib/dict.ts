export type DictForm = { d: string; b: string }
export type DictEntryMap = { word: string; forms: Record<string, string> }
export type DictMap = Record<string, DictEntryMap>

const DICT_RE = /\[~([^\]\n]+)\]/g
const ZONE_RE = /\[lng\]([\s\S]*?)\[\/lng\]/g

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

function escapeReg(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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

function substituteToken(token: string, dict: DictMap): string | null {
  const entry = dict[token.toLowerCase()]
  if (!entry) return null
  return transferCase(token, entry.forms[token.toLowerCase()] ?? entry.word)
}

export function applyDictZones(text: string, dict: DictMap): string {
  if (!text || text.indexOf('[lng]') === -1) return text
  const keys = Object.keys(dict).sort((a, b) => b.length - a.length)
  const strip = (inner: string) => {
    if (keys.length === 0) return inner
    const re = new RegExp(
      '(?<![\\p{L}\\p{N}])(' + keys.map(escapeReg).join('|') + ')(?![\\p{L}\\p{N}])',
      'giu',
    )
    return inner.replace(re, (tok) => substituteToken(tok, dict) ?? tok)
  }
  return text.replace(ZONE_RE, (_m, inner: string) => strip(inner))
}

export function applyDict(text: string, dict: DictMap): string {
  if (!text) return text
  let out = text
  if (out.indexOf('[lng]') !== -1) out = applyDictZones(out, dict)
  if (out.indexOf('[~') === -1) return out
  return out.replace(DICT_RE, (_m, raw: string) => {
    const token = raw.trim()
    return substituteToken(token, dict) ?? token
  })
}