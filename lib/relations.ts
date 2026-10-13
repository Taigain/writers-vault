export function relationColor(note: string): string {
  const n = note.toLowerCase()
  if (/друг|союзник|товарищ|friend|ally|companion/.test(n)) return '#3a7a4a'
  if (/враг|противник|недруг|enemy|rival|foe/.test(n)) return '#8c3a2b'
  if (/родит|сын|дочь|брат|сестр|семь|отц|мат|parent|child|sibling|family|father|mother/.test(n)) return '#b98a3e'
  if (/люб|возлюбл|lover|romance|wife|husband|жена|муж/.test(n)) return '#a64563'
  if (/наставник|учитель|mentor|teacher|master/.test(n)) return '#2b5a8c'
  return '#6b6359'
}

export function relationLegend(lang: 'ru' | 'en') {
  const ru = [
    { c: '#3a7a4a', t: 'Союзники' },
    { c: '#8c3a2b', t: 'Противники' },
    { c: '#b98a3e', t: 'Семья' },
    { c: '#a64563', t: 'Любовь' },
    { c: '#2b5a8c', t: 'Наставники' },
    { c: '#6b6359', t: 'Прочие' },
  ]
  const en = [
    { c: '#3a7a4a', t: 'Allies' },
    { c: '#8c3a2b', t: 'Rivals' },
    { c: '#b98a3e', t: 'Family' },
    { c: '#a64563', t: 'Romance' },
    { c: '#2b5a8c', t: 'Mentors' },
    { c: '#6b6359', t: 'Other' },
  ]
  return lang === 'ru' ? ru : en
}