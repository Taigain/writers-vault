import { applyDictFull, type DictZoneEntry, type DictZoneGroup } from './dictzones'

export function mdSlug(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-zа-яё0-9]+/gi, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'book'
  )
}

export function mdQuote(s: string): string {
  return '"' + s.replace(/"/g, '\\"').replace(/\s+/g, ' ').trim() + '"'
}

export function richToMarkdown(
  text: string,
  dict: DictZoneEntry[],
  groups: DictZoneGroup[],
  dash: string,
): string {
  let s = applyDictFull(text, dict, groups)
  s = s.replace(/\[sc:[^\]]*\]/g, '').replace(/\[\/sc\]/g, '')
  s = s.replace(/\[hl=\d+\]/g, '').replace(/\[\/hl\]/g, '')
  s = s.replace(/\[size=\d+\]/g, '').replace(/\[\/size\]/g, '')
  s = s.replace(/\[lng\]/g, '').replace(/\[\/lng\]/g, '')
  s = s.replace(/\[lang:[^\]]*\]/g, '').replace(/\[\/lang\]/g, '')
  s = s.replace(/^\[(left|center|right)\][ \t]*/gim, '')
  s = s.replace(/\[@([^\]]*)\]/g, '$1')
  s = s.replace(/\[#([^\]]*)\]/g, (_m, x: string) => x.replace(/_/g, ' '))
  s = s.replace(/--/g, dash)
  return s
}