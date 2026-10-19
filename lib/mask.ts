const MARKER_RE =
  /\[@[^\]]*\]|\[#[^\]]*\]|\[~[^\]]*\]|\[sc:[^\]]*\]|\[\/sc\]|\[hl=\d+\]|\[\/hl\]|\[lng\]|\[\/lng\]|\[size=\d+\]|\[\/size\]|\[(center|right|left)\]/g

// Заменяет служебные маркеры пробелами той же длины: правила линтера и
// подсветки не видят швов и внутренностей меток, а офсеты остаются 1:1,
// поэтому переходы к месту и автоправки бьют точно в оригинальный текст.
export function maskMarkers(text: string): string {
  return text.replace(MARKER_RE, (m) => ' '.repeat(m.length))
}

export function isSeparatorLine(line: string): boolean {
  return line.trim() === '***'
}