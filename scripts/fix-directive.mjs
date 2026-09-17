import fs from 'node:fs'

const files = [
  'components/ActBar.tsx',
  'components/ChapterSearch.tsx',
  'components/SeriesPicker.tsx',
]

for (const f of files) {
  let t = fs.readFileSync(f, 'utf8')
  t = t.replace(/[\uFEFF\u200B\u200C\u200D\u2060]/g, '')
  const nl = t.indexOf('\n')
  t = '"use client"' + (nl === -1 ? '' : t.slice(nl))
  fs.writeFileSync(f, t, 'utf8')
  console.log(f, '->', JSON.stringify(t.slice(0, 12)))
}