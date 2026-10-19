import { maskMarkers } from './mask'

export type PunctIssue = {
  pos: number
  len: number
  bad: string
  fix: string
  msgKey: string
}

export function checkPunctuation(text: string): PunctIssue[] {
  const src = maskMarkers(text)
  const out: PunctIssue[] = []
  const push = (pos: number, len: number, fix: string, msgKey: string) => {
    out.push({ pos, len, bad: text.slice(pos, pos + len), fix, msgKey })
  }
  // пробел перед знаком: «слово ,» → «слово,»
  for (const m of src.matchAll(/ +([,.;:!?])/g)) {
    push(m.index!, m[0].length, m[1], 'pkSpaceBefore')
  }
  // нет пробела после знака: «слово.Слово» → «слово. Слово»
  for (const m of src.matchAll(/([,;:!?])(?=[A-Za-zА-Яа-яЁё])/g)) {
    push(m.index!, 1, m[1] + ' ', 'pkNoSpaceAfter')
  }
  // лишние пробелы между словами
  for (const m of src.matchAll(/([^ \n]) {2,}([^ \n])/g)) {
    push(m.index! + 1, m[0].length - 2, ' ', 'pkDoubleSpace')
  }
  // повторы знаков
  for (const m of src.matchAll(/,{2,}/g)) push(m.index!, m[0].length, ',', 'pkRepeat')
  for (const m of src.matchAll(/([!?])\1+/g)) push(m.index!, m[0].length, m[1], 'pkRepeat')
  // три точки вместо многоточия
  for (const m of src.matchAll(/\.\.\./g)) push(m.index!, 3, '…', 'pkEllipsis')
  // дефис вместо тире между словами
  for (const m of src.matchAll(/(\p{L}) - (\p{L})/gu)) {
    push(m.index! + m[1].length + 1, 1, '—', 'pkDash')
  }
  out.sort((a, b) => a.pos - b.pos)
  const res: PunctIssue[] = []
  let lastEnd = -1
  for (const iss of out) {
    if (iss.pos < lastEnd) continue
    res.push(iss)
    lastEnd = iss.pos + iss.len
  }
  return res
}