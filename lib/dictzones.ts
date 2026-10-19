export type DictZoneEntry = {
  key: string
  word: string
  meaning: string
  forms: { d: string; b: string }[]
  groupId: string | null
}
export type DictZoneGroup = { id: string; slug: string }

function applyCase(src: string, dst: string): string {
  if (!src || !dst) return dst
  if (src.length > 1 && src === src.toUpperCase()) return dst.toUpperCase()
  const first = src.charAt(0)
  if (first !== first.toLowerCase() && first === first.toUpperCase()) {
    return dst.charAt(0).toUpperCase() + dst.slice(1)
  }
  return dst
}

function buildMap(entries: DictZoneEntry[]): Map<string, { d: string; b: string }> {
  const map = new Map<string, { d: string; b: string }>()
  for (const e of entries) {
    const base = e.meaning.trim()
    if (base) map.set(base.toLowerCase(), { d: base, b: e.word })
    for (const f of e.forms) {
      if (f.d && f.b) map.set(f.d.toLowerCase(), { d: f.d, b: f.b })
    }
  }
  return map
}

function substituteZone(segment: string, map: Map<string, { d: string; b: string }>): string {
  return segment.replace(/[\p{L}\p{N}'’-]+/gu, (tok) => {
    const hit = map.get(tok.toLowerCase())
    return hit ? applyCase(tok, hit.b) : tok
  })
}

// Единый проход подстановки: явные маркеры глобально по ключу,
// именованные зоны — только словарём своей группы (неизвестный slug → общий),
// общие зоны [lng] — только общим словарём (записи без группы).
export function applyDictFull(text: string, entries: DictZoneEntry[], groups: DictZoneGroup[]): string {
  const common = buildMap(entries.filter((e) => e.groupId == null))
  const bySlug = new Map<string, Map<string, { d: string; b: string }>>()
  for (const g of groups) {
    bySlug.set(g.slug.toLowerCase(), buildMap(entries.filter((e) => e.groupId === g.id)))
  }
  let out = text.replace(/\[~([^\]\n]+)\]/g, (m, k: string) => {
    const e = entries.find((x) => x.key === k.trim().toLowerCase())
    if (!e) return m
    return applyCase(k.trim(), e.word)
  })
  out = out.replace(/\[lang:([^\]]+)\]([\s\S]*?)\[\/lang\]/g, (_m, slug: string, inner: string) =>
    substituteZone(inner, bySlug.get(slug.trim().toLowerCase()) ?? common),
  )
  out = out.replace(/\[lng\]([\s\S]*?)\[\/lng\]/g, (_m, inner: string) => substituteZone(inner, common))
  return out
}