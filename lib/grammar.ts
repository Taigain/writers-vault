export type GrammarIssue = {
  pos: number
  len: number
  bad: string
  fix: string
  msgKey: string
}

const VERB_END =
  '(?:ать|ять|еть|ить|уть|ыть|ал|ял|ел|ёл|ла|яла|ела|ёла|ло|яло|ело|ёло|ли|яли|ели|ёли|ёшь|ешь|ит|ет|ёт|ат|ят)(?:ся|сь)?'

export function checkGrammar(text: string): GrammarIssue[] {
  const out: GrammarIssue[] = []

  // Повтор слова подряд: «вышел вышел» (регистр не важен)
  const dupRe = /(?<![а-яёa-z-])([а-яёa-z]{2,})[ \t]+\1(?![а-яёa-z])/gi
  for (const m of text.matchAll(dupRe)) {
    out.push({ pos: m.index ?? 0, len: m[0].length, bad: m[0], fix: m[1], msgKey: 'pnDupWord' })
  }

  // Разрыв пробелом: «по гулять» → «погулять», «во обще» → «вообще»
  const splitRe =
    /(?<![а-яёa-z])(?:по[ \t]+(чувств|смотр|став|дум|звон|тряс|тяну|верн|бежа|лета|еха|шел|шла|шли|гуля|плы|прыга|скака|толка|гля)[а-яё]*|во[ \t]+(общ|круг)[а-яё]*)/gi
  for (const m of text.matchAll(splitRe)) {
    out.push({
      pos: m.index ?? 0,
      len: m[0].length,
      bad: m[0],
      fix: m[0].replace(/[ \t]+/, ''),
      msgKey: 'pnSplit',
    })
  }

  // Разрыв дефисом: «по-смотреть» → «посмотреть», «об-катать» → «обкатать»
  const hyphRe = new RegExp(
    '(?<![а-яёa-z-])(по|во|об|обо|от|ото|за|про|с|со|в|на|над|под|при|пре|о|из|ис|вы|до|пере|вз|вс|раз|рас)[ \\t]*-[ \\t]*([а-яёa-z]*?' +
      VERB_END +
      ')(?![а-яёa-z-])',
    'gi',
  )
  for (const m of text.matchAll(hyphRe)) {
    out.push({
      pos: m.index ?? 0,
      len: m[0].length,
      bad: m[0],
      fix: m[1] + m[2],
      msgKey: 'pnSplit',
    })
  }

  return out
}