export type ZoneKind = { type: 'common' } | { type: 'named'; slug: string }

export function zoneOpenMarker(kind: ZoneKind): string {
  return kind.type === 'common' ? '[lng]' : `[lang:${kind.slug}]`
}
export function zoneCloseMarker(kind: ZoneKind): string {
  return kind.type === 'common' ? '[/lng]' : '[/lang]'
}

const ZONE_TOKEN_RE = /\[lng\]|\[lang:([^\]]+)\]|\[\/lng\]|\[\/lang\]/g

// Внутренняя открытая зона, содержащая позицию pos (курсор или начало выделения)
export function findZoneAt(
  text: string,
  pos: number,
): { kind: ZoneKind; openAt: number; openLen: number } | null {
  const stack: { kind: ZoneKind; openAt: number; openLen: number }[] = []
  const re = new RegExp(ZONE_TOKEN_RE.source, 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    if (m.index >= pos) break
    const tok = m[0]
    if (tok === '[lng]') stack.push({ kind: { type: 'common' }, openAt: m.index, openLen: tok.length })
    else if (tok.startsWith('[lang:'))
      stack.push({ kind: { type: 'named', slug: m[1] ?? '' }, openAt: m.index, openLen: tok.length })
    else stack.pop()
  }
  return stack.length > 0 ? stack[stack.length - 1] : null
}

// Границы зоны: открывающий маркер и парный закрывающий после него
export function zoneSpan(
  text: string,
  from: number,
): { kind: ZoneKind; openAt: number; openLen: number; closeAt: number; closeLen: number } | null {
  const z = findZoneAt(text, from)
  if (!z) return null
  const re = new RegExp(ZONE_TOKEN_RE.source, 'g')
  re.lastIndex = z.openAt + z.openLen
  let depth = 1
  let m: RegExpExecArray | null
  while ((m = re.exec(text))) {
    const tok = m[0]
    if (tok === '[lng]' || tok.startsWith('[lang:')) depth++
    else {
      depth--
      if (depth === 0) return { ...z, closeAt: m.index, closeLen: tok.length }
    }
  }
  return null
}

// Перезаворачивание зоны в маркеры другого типа без трогания содержимого
export function rezoneText(
  text: string,
  span: { openAt: number; openLen: number; closeAt: number; closeLen: number },
  kind: ZoneKind,
): string {
  const before = text.slice(0, span.openAt)
  const middle = text.slice(span.openAt + span.openLen, span.closeAt)
  const after = text.slice(span.closeAt + span.closeLen)
  return before + zoneOpenMarker(kind) + middle + zoneCloseMarker(kind) + after
}