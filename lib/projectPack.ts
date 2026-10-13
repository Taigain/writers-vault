import JSZip from 'jszip'
import { randomUUID } from 'crypto'
import { prisma, schemaReady } from './prisma'

export const PACK_FORMAT = 1
const nid = () => randomUUID()
type Row = Record<string, any>

export async function packBook(bookId: string): Promise<Buffer> {
  await schemaReady
  const book = await prisma.book.findUnique({ where: { id: bookId }, include: { series: true } })
  if (!book) throw new Error('book not found')
  const [chapters, characters, relations, locations, events, eventChars, eventMentions, dict, notes, lore, storylines, beats, beatLines, beatChars, scenes, sceneChars, mentions] =
    await Promise.all([
      prisma.chapter.findMany({ where: { bookId }, orderBy: { order: 'asc' } }),
      prisma.character.findMany({ where: { bookId } }),
      prisma.characterRelation.findMany({ where: { character: { bookId } } }),
      prisma.location.findMany({ where: { bookId } }),
      prisma.timelineEvent.findMany({ where: { bookId } }),
      prisma.eventCharacter.findMany({ where: { event: { bookId } } }),
      prisma.eventMention.findMany({ where: { event: { bookId } } }),
      prisma.dictEntry.findMany({ where: { bookId } }),
      prisma.note.findMany({ where: { bookId } }),
      prisma.loreEntry.findMany({ where: { bookId } }),
      prisma.storyline.findMany({ where: { bookId }, orderBy: { order: 'asc' } }),
      prisma.plotBeat.findMany({ where: { bookId } }),
      prisma.beatLine.findMany({ where: { line: { bookId } } }),
      prisma.beatCharacter.findMany({ where: { beat: { bookId } } }),
      prisma.scene.findMany({ where: { chapter: { bookId } }, orderBy: { order: 'asc' } }),
      prisma.sceneCharacter.findMany({ where: { scene: { chapter: { bookId } } } }),
      prisma.chapterMention.findMany({ where: { chapter: { bookId } } }),
    ])
  const zip = new JSZip()
  zip.file(
    'manifest.json',
    JSON.stringify(
      { format: PACK_FORMAT, app: 'writers-vault', exportedAt: new Date().toISOString(), bookTitle: book.title },
      null,
      2,
    ),
  )
  zip.file('book.json', JSON.stringify({ ...book, seriesName: book.series?.name ?? null }))
  zip.file('chapters.json', JSON.stringify(chapters))
  zip.file('characters.json', JSON.stringify(characters))
  zip.file('relations.json', JSON.stringify(relations))
  zip.file('locations.json', JSON.stringify(locations))
  zip.file('events.json', JSON.stringify(events))
  zip.file('eventChars.json', JSON.stringify(eventChars))
  zip.file('eventMentions.json', JSON.stringify(eventMentions))
  zip.file('dict.json', JSON.stringify(dict))
  zip.file('notes.json', JSON.stringify(notes))
  zip.file('lore.json', JSON.stringify(lore))
  zip.file('storylines.json', JSON.stringify(storylines))
  zip.file('beats.json', JSON.stringify(beats))
  zip.file('beatLines.json', JSON.stringify(beatLines))
  zip.file('beatChars.json', JSON.stringify(beatChars))
  zip.file('scenes.json', JSON.stringify(scenes))
  zip.file('sceneChars.json', JSON.stringify(sceneChars))
  zip.file('mentions.json', JSON.stringify(mentions))
  return (await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' })) as Buffer
}

export async function unpackBook(buf: Buffer): Promise<{ bookId: string; title: string }> {
  await schemaReady
  const zip = await JSZip.loadAsync(buf)
  const mf = zip.file('manifest.json')
  if (!mf) throw new Error('not a .wvproj file')
  const manifest = JSON.parse(await mf.async('string')) as { format: number }
  if (!manifest.format || manifest.format > PACK_FORMAT) throw new Error('unsupported pack format')
  const read = async <T,>(name: string, fallback: T): Promise<T> => {
    const f = zip.file(name)
    if (!f) return fallback
    try {
      return JSON.parse(await f.async('string')) as T
    } catch {
      return fallback
    }
  }
  const book = await read<Row | null>('book.json', null)
  if (!book) throw new Error('book.json missing')
  const chapters = await read<Row[]>('chapters.json', [])
  const characters = await read<Row[]>('characters.json', [])
  const relations = await read<Row[]>('relations.json', [])
  const locations = await read<Row[]>('locations.json', [])
  const events = await read<Row[]>('events.json', [])
  const eventChars = await read<Row[]>('eventChars.json', [])
  const eventMentions = await read<Row[]>('eventMentions.json', [])
  const dict = await read<Row[]>('dict.json', [])
  const notes = await read<Row[]>('notes.json', [])
  const lore = await read<Row[]>('lore.json', [])
  const storylines = await read<Row[]>('storylines.json', [])
  const beats = await read<Row[]>('beats.json', [])
  const beatLines = await read<Row[]>('beatLines.json', [])
  const beatChars = await read<Row[]>('beatChars.json', [])
  const scenes = await read<Row[]>('scenes.json', [])
  const sceneChars = await read<Row[]>('sceneChars.json', [])
  const mentions = await read<Row[]>('mentions.json', [])

  const newBookId = nid()
  let seriesId: string | null = null
  if (book.seriesName) {
    const ex = await prisma.series.findFirst({ where: { name: book.seriesName } })
    seriesId = ex ? ex.id : (await prisma.series.create({ data: { id: nid(), name: book.seriesName } })).id
  }
  await prisma.book.create({
    data: {
      id: newBookId,
      title: book.title,
      annotation: book.annotation ?? '',
      synopsis: book.synopsis ?? '',
      coverBase64: book.coverBase64 ?? null,
      status: book.status ?? 'active',
      genre: book.genre ?? '',
      spineColor: book.spineColor ?? '',
      spineStyle: book.spineStyle ?? 'tome',
      exportMeta: book.exportMeta ?? true,
      exportTitle: book.exportTitle ?? false,
      exportAnnotation: book.exportAnnotation ?? false,
      exportSynopsis: book.exportSynopsis ?? false,
      structure: book.structure ?? null,
      seriesId,
    },
  })
  const chMap = new Map<string, string>()
  const charMap = new Map<string, string>()
  const locMap = new Map<string, string>()
  const evMap = new Map<string, string>()
  const lineMap = new Map<string, string>()
  const beatMap = new Map<string, string>()
  const sceneMap = new Map<string, string>()
  chapters.forEach((c) => chMap.set(c.id, nid()))
  characters.forEach((c) => charMap.set(c.id, nid()))
  locations.forEach((c) => locMap.set(c.id, nid()))
  events.forEach((c) => evMap.set(c.id, nid()))
  storylines.forEach((c) => lineMap.set(c.id, nid()))
  beats.forEach((c) => beatMap.set(c.id, nid()))
  scenes.forEach((c) => sceneMap.set(c.id, nid()))
  const remap = (map: Map<string, string>, id: unknown) => (id ? map.get(String(id)) ?? null : null)

  for (const c of chapters) {
    await prisma.chapter.create({
      data: { id: chMap.get(c.id)!, bookId: newBookId, title: c.title, content: c.content ?? '', order: c.order, actName: c.actName ?? null },
    })
  }
  for (const c of characters) {
    await prisma.character.create({
      data: {
        id: charMap.get(c.id)!,
        bookId: newBookId,
        name: c.name,
        role: c.role ?? 'secondary',
        bio: c.bio ?? '',
        appearance: c.appearance ?? '',
        personality: c.personality ?? '',
        decisions: c.decisions ?? '',
        arc: c.arc ?? '',
        aliases: c.aliases ?? '',
        portraitBase64: c.portraitBase64 ?? null,
        age: c.age ?? '',
        gender: c.gender ?? '',
        birth: c.birth ?? '',
        race: c.race ?? '',
        country: c.country ?? '',
        language: c.language ?? '',
        archetype: c.archetype ?? '',
        goal: c.goal ?? '',
        conflict: c.conflict ?? '',
        trauma: c.trauma ?? '',
        obsession: c.obsession ?? '',
        strengths: c.strengths ?? '',
        weaknesses: c.weaknesses ?? '',
        height: c.height ?? '',
        weight: c.weight ?? '',
        build: c.build ?? '',
        eyes: c.eyes ?? '',
        hair: c.hair ?? '',
        clothing: c.clothing ?? '',
        posture: c.posture ?? '',
        voice: c.voice ?? '',
      },
    })
  }
  for (const r of relations) {
    const a = remap(charMap, r.characterId)
    const b = remap(charMap, r.relatedId)
    if (a && b && a !== b) await prisma.characterRelation.create({ data: { id: nid(), characterId: a, relatedId: b, note: r.note ?? '' } })
  }
  for (const l of locations) {
    await prisma.location.create({ data: { id: locMap.get(l.id)!, bookId: newBookId, name: l.name, desc: l.desc ?? '', imageBase64: l.imageBase64 ?? null } })
  }
  for (const e of events) {
    await prisma.timelineEvent.create({
      data: {
        id: evMap.get(e.id)!,
        bookId: newBookId,
        dateType: e.dateType ?? 'book',
        date: e.date ?? '',
        bookYear: e.bookYear ?? null,
        bookDay: e.bookDay ?? null,
        description: e.description ?? '',
        summary: e.summary ?? '',
        chapterId: remap(chMap, e.chapterId),
        tag: e.tag ?? null,
      },
    })
  }
  for (const ec of eventChars) {
    const e = remap(evMap, ec.eventId)
    const c = remap(charMap, ec.characterId)
    if (e && c) await prisma.eventCharacter.create({ data: { id: nid(), eventId: e, characterId: c } })
  }
  for (const em of eventMentions) {
    const e = remap(evMap, em.eventId)
    const ch = remap(chMap, em.chapterId)
    if (e && ch) await prisma.eventMention.create({ data: { id: nid(), eventId: e, chapterId: ch, pos: em.pos ?? null } })
  }
  for (const d of dict) {
    await prisma.dictEntry.create({ data: { id: nid(), bookId: newBookId, key: d.key, word: d.word, meaning: d.meaning ?? '', forms: d.forms ?? '[]' } })
  }
  for (const n of notes) {
    await prisma.note.create({
      data: { id: nid(), bookId: newBookId, title: n.title ?? '', text: n.text ?? '', kind: n.kind ?? 'other', done: Boolean(n.done), imageBase64: n.imageBase64 ?? null, posX: n.posX ?? null, posY: n.posY ?? null },
    })
  }
  for (const l of lore) {
    await prisma.loreEntry.create({ data: { id: nid(), bookId: newBookId, text: l.text ?? '', tags: l.tags ?? '', imageBase64: l.imageBase64 ?? null } })
  }
  for (const s of storylines) {
    await prisma.storyline.create({ data: { id: lineMap.get(s.id)!, bookId: newBookId, name: s.name, order: s.order ?? 0 } })
  }
  for (const b of beats) {
    await prisma.plotBeat.create({
      data: {
        id: beatMap.get(b.id)!,
        bookId: newBookId,
        lineId: remap(lineMap, b.lineId),
        title: b.title ?? '',
        summary: b.summary ?? '',
        order: b.order ?? 0,
        chapterId: remap(chMap, b.chapterId),
        eventId: remap(evMap, b.eventId),
      },
    })
  }
  for (const bl of beatLines) {
    const l = remap(lineMap, bl.lineId)
    const b = remap(beatMap, bl.beatId)
    if (l && b) await prisma.beatLine.create({ data: { id: nid(), lineId: l, beatId: b, order: bl.order ?? 0 } })
  }
  for (const bc of beatChars) {
    const b = remap(beatMap, bc.beatId)
    const c = remap(charMap, bc.characterId)
    if (b && c) await prisma.beatCharacter.create({ data: { id: nid(), beatId: b, characterId: c } })
  }
  for (const s of scenes) {
    const ch = remap(chMap, s.chapterId)
    if (!ch) continue
    await prisma.scene.create({ data: { id: sceneMap.get(s.id)!, chapterId: ch, order: s.order ?? 0, title: s.title ?? '', start: s.start ?? 0, end: s.end ?? 0 } })
  }
  for (const sc of sceneChars) {
    const s = remap(sceneMap, sc.sceneId)
    const c = remap(charMap, sc.characterId)
    if (s && c) await prisma.sceneCharacter.create({ data: { id: nid(), sceneId: s, characterId: c } })
  }
  for (const m of mentions) {
    const ch = remap(chMap, m.chapterId)
    if (!ch) continue
    await prisma.chapterMention.create({
      data: { id: nid(), chapterId: ch, characterId: remap(charMap, m.characterId), locationId: remap(locMap, m.locationId), snippet: m.snippet ?? '', pos: m.pos ?? null, note: m.note ?? null },
    })
  }
  return { bookId: newBookId, title: book.title }
}