export type PunctIssue = {
  pos: number
  len: number
  bad: string
  fix: string
  msgKey: string
}

export function checkPunctuation(text: string): PunctIssue[] {
  const out: PunctIssue[] = []
  const push = (pos: number, len: number, fix: string, msgKey: string) => {
    out.push({ pos, len, bad: text.slice(pos, pos + len), fix, msgKey })
  }
  for (const m of text.matchAll(/ +([,.;:!?])/g)) {
    push(m.index!, m[0].length, m[1], 'pkSpaceBefore')
  }
  for (const m of text.matchAll(/([,;:!?])(?=[A-Za-zА-Яа-яЁё])/g)) {
    push(m.index!, 1, m[1] + ' ', 'pkNoSpaceAfter')
  }
  for (const m of text.matchAll(/([^ \n]) {2,}([^ \n])/g)) {
    push(m.index! + 1, m[0].length - 2, ' ', 'pkDoubleSpace')
  }
  for (const m of text.matchAll(/,{2,}/g)) push(m.index!, m[0].length, ',', 'pkRepeat')
  for (const m of text.matchAll(/([!?])\1+/g)) push(m.index!, m[0].length, m[1], 'pkRepeat')
  for (const m of text.matchAll(/\.\.\./g)) push(m.index!, 3, '…', 'pkEllipsis')
  for (const m of text.matchAll(/(\p{L}) - (\p{L})/gu)) {
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