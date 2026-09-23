'use server'

import { prisma, schemaReady } from './prisma'
import { revalidatePath } from 'next/cache'
import { ROLES } from './roles'

const validRole = (role: string): string =>
  ROLES.some((r) => r.key === role) ? role : 'secondary'

function parseAliases(input: string): string[] {
  return (input ?? '')
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1)
}

export async function readImageField(
  fd: FormData,
  name: string,
): Promise<{ value: string | null; clear: boolean; keep: boolean }> {
  if (fd.get(name + '_clear') === '1') return { value: null, clear: true, keep: false }
  const raw = fd.get(name)
  if (typeof raw === 'string') {
    if (raw.startsWith('data:image')) return { value: raw, clear: false, keep: false }
    return { value: null, clear: false, keep: true }
  }
  if (raw instanceof File && raw.size > 0) {
    const buf = Buffer.from(await raw.arrayBuffer())
    return { value: `data:${raw.type};base64,${buf.toString('base64')}`, clear: false, keep: false }
  }
  return { value: null, clear: false, keep: true }
}

// --- BOOKS ---
export async function getBooks() {
  return prisma.book.findMany({ orderBy: { createdAt: 'desc' } })
}

export async function createBook(formData: FormData) {
  const title = formData.get('title') as string
  const coverFile = formData.get('cover') as File

  let coverBase64 = null
  if (coverFile && coverFile.size > 0) {
    const buffer = Buffer.from(await coverFile.arrayBuffer())
    coverBase64 = `data:${coverFile.type};base64,${buffer.toString('base64')}`
  }

  await prisma.book.create({ data: { title, coverBase64 } })
  revalidatePath('/')
}

export async function getBook(id: string) {
  return prisma.book.findUnique({ where: { id } })
}

export async function saveBook(id: string, fd: FormData) {
  await schemaReady
  const title = (fd.get('title') as string) || 'Без названия'
  const annotation = (fd.get('annotation') as string) ?? ''
  const synopsis = (fd.get('synopsis') as string) ?? ''

  const cover = fd.get('cover')
  let coverBase64: string | undefined
  if (cover instanceof File && cover.size > 0) {
    const buf = Buffer.from(await cover.arrayBuffer())
    coverBase64 = `data:${cover.type};base64,${buf.toString('base64')}`
  }

  await prisma.book.update({
    where: { id },
    data: {
      title,
      annotation,
      synopsis,
      ...(coverBase64 ? { coverBase64 } : {}),
    },
  })
  revalidatePath('/')
  revalidatePath(`/book/${id}`)
}

export async function removeBookCover(id: string) {
  await prisma.book.update({ where: { id }, data: { coverBase64: null } })
  revalidatePath('/')
  revalidatePath(`/book/${id}`)
}

// --- CHAPTERS ---
export async function getChapters(bookId: string) {
  return prisma.chapter.findMany({ where: { bookId }, orderBy: { order: 'asc' } })
}

export async function saveChapter(chapterId: string, title: string, content: string) {
  await prisma.chapter.update({ where: { id: chapterId }, data: { title, content } })
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { bookId: true },
  })
  if (!chapter) return
  const bookId = chapter.bookId

  const mentions = content.match(/\[@(.*?)\]/g) || []
  const uniqueNames = [...new Set(mentions.map((m) => m.replace(/[\[@\]]/g, '').trim()))]
  const lowerNames = uniqueNames.map((n) => n.toLowerCase())
  const characters = await prisma.character.findMany({ where: { bookId } })
  const matchedChars = characters.filter((ch) =>
    [ch.name, ...parseAliases(ch.aliases)].some((k) => lowerNames.includes(k.toLowerCase())),
  )
  const locations = await prisma.location.findMany({ where: { bookId } })
  const matchedLocs = locations.filter((l) => lowerNames.includes(l.name.toLowerCase()))

  await prisma.chapterMention.deleteMany({ where: { chapterId } })
  const mentionsToCreate: { chapterId: string; characterId?: string; locationId?: string; snippet: string }[] = []
  for (const entity of matchedChars) {
    mentionsToCreate.push({ chapterId, characterId: entity.id, snippet: content.substring(0, 100) })
  }
  for (const loc of matchedLocs) {
    mentionsToCreate.push({ chapterId, locationId: loc.id, snippet: content.substring(0, 100) })
  }
  if (mentionsToCreate.length > 0) {
    await prisma.chapterMention.createMany({ data: mentionsToCreate })
  }

  const eventMarks = content.match(/\[#(.*?)\]/g) || []
  const eventNames = [
    ...new Set(eventMarks.map((m) => m.replace(/[\[#\]]/g, '').trim().toLowerCase())),
  ]
  const events = await prisma.timelineEvent.findMany({ where: { bookId } })
  const matchedEvents = events.filter((e) => {
    const tag = (e.tag ?? '').replace(/^#/, '').toLowerCase()
    return (tag !== '' && eventNames.includes(tag)) || eventNames.includes(e.description.toLowerCase())
  })
  await prisma.eventMention.deleteMany({ where: { chapterId } })
  if (matchedEvents.length > 0) {
    await prisma.eventMention.createMany({
      data: matchedEvents.map((ev) => ({ chapterId, eventId: ev.id })),
    })
  }
  revalidatePath(`/book/${bookId}`)
}

export async function createChapter(bookId: string, order: number) {
  const chapter = await prisma.chapter.create({
    data: { title: 'Новая глава', content: '', order, bookId },
  })
  revalidatePath(`/book/${bookId}`)
  return chapter.id
}

// --- CHARACTERS ---
export type CharacterInput = {
  name: string
  role: string
  bio: string
  appearance: string
  personality: string
  decisions: string
  arc: string
  aliases?: string
  portraitBase64?: string | null
}

export async function getCharacters(bookId: string) {
  return prisma.character.findMany({
    where: { bookId },
    include: {
      mentions: { include: { chapter: true } },
      relations: { include: { related: true } },
    },
  })
}

async function characterBookPath(id: string) {
  const c = await prisma.character.findUnique({ where: { id }, select: { bookId: true } })
  return c ? `/book/${c.bookId}` : '/'
}

export async function createCharacter(bookId: string, name: string, role: string) {
  await prisma.character.create({ data: { name, bookId, role: validRole(role) } })
  revalidatePath(`/book/${bookId}`)
}

export async function saveCharacter(id: string, data: CharacterInput) {
  await prisma.character.update({
    where: { id },
    data: {
      ...data,
      role: validRole(data.role),
      ...(data.aliases !== undefined ? { aliases: data.aliases } : {}),
    },
  })
  revalidatePath(await characterBookPath(id))
}

export async function addCharacterRelation(characterId: string, relatedId: string, note: string) {
  if (!relatedId || characterId === relatedId) return
  await prisma.characterRelation.create({ data: { characterId, relatedId, note } })
  revalidatePath(await characterBookPath(characterId))
}

export async function removeCharacterRelation(relationId: string) {
  const rel = await prisma.characterRelation.findUnique({
    where: { id: relationId },
    select: { characterId: true },
  })
  await prisma.characterRelation.delete({ where: { id: relationId } })
  if (rel) revalidatePath(await characterBookPath(rel.characterId))
}

// --- LOCATIONS ---
export async function getLocations(bookId: string) {
  return prisma.location.findMany({ where: { bookId }, include: { mentions: { include: { chapter: true } } } })
}

export async function saveLocation(id: string, fd: FormData) {
  const name = (fd.get('name') as string) || ''
  const desc = (fd.get('desc') as string) ?? ''
  const img = await readImageField(fd, 'image')
  await prisma.location.update({
    where: { id },
    data: img.clear
      ? { name, desc, imageBase64: null }
      : img.keep
        ? { name, desc }
        : { name, desc, imageBase64: img.value },
  })
  const loc = await prisma.location.findUnique({ where: { id }, select: { bookId: true } })
  if (loc) revalidatePath(`/book/${loc.bookId}`)
}

export async function removeLocationImage(id: string) {
  await prisma.location.update({ where: { id }, data: { imageBase64: null } })
  const loc = await prisma.location.findUnique({ where: { id }, select: { bookId: true } })
  if (loc) revalidatePath(`/book/${loc.bookId}`)
}

export async function createLocation(bookId: string, name: string) {
  await prisma.location.create({ data: { name, bookId } })
  revalidatePath(`/book/${bookId}`)
}

// --- TIMELINE ---
export type TimelineInput = {
  dateType: 'calendar' | 'book'
  date: string
  bookYear: number | null
  bookDay: number | null
  description: string
  summary: string
  chapterId: string | null
  tag: string | null
}

export type TimelineRow = {
  id: string
  dateType: 'calendar' | 'book'
  date: string
  bookYear: number | null
  bookDay: number | null
  description: string
  summary: string
  chapterId: string | null
  chapterTitle: string | null
  chapterFirstSentence: string | null
  participantIds: string[]
  mentionChapters: string[]
  tag: string | null
}

function extractFirstSentence(text: string): string | null {
  if (!text) return null
  const cleaned = text.replace(/\[@(.*?)\]/g, '$1').replace(/\[#(.*?)\]/g, '$1').replace(/\s+/g, ' ').trim()
  const match = cleaned.match(/[^.!?…]+[.!?…]+/)
  if (match) return match[0].trim()
  return cleaned.length > 120 ? cleaned.slice(0, 120) + '…' : cleaned || null
}

export async function getTimeline(bookId: string) {
  const rows = await prisma.timelineEvent.findMany({
    where: { bookId },
    include: {
      chapter: { select: { title: true, content: true } },
      participants: { select: { characterId: true } },
      mentions: { select: { chapter: { select: { title: true } } } },
    },
  })
  return rows.map<TimelineRow>((r) => ({
    id: r.id,
    dateType: (r.dateType === 'book' ? 'book' : 'calendar') as 'calendar' | 'book',
    date: r.date,
    bookYear: r.bookYear,
    bookDay: r.bookDay,
    description: r.description,
    summary: r.summary,
    chapterId: r.chapterId,
    chapterTitle: r.chapter?.title ?? null,
    chapterFirstSentence: r.chapter ? extractFirstSentence(r.chapter.content) : null,
    participantIds: r.participants.map((p) => p.characterId),
    mentionChapters: r.mentions.map((m) => m.chapter.title),
    tag: r.tag,
  }))
}

export async function saveTimelineEvent(id: string, data: TimelineInput) {
  await prisma.timelineEvent.update({ where: { id }, data })
  const ev = await prisma.timelineEvent.findUnique({ where: { id }, select: { bookId: true } })
  if (ev) revalidatePath(`/book/${ev.bookId}`)
}

export async function createTimelineEvent(bookId: string, data: TimelineInput) {
  await prisma.timelineEvent.create({ data: { ...data, bookId } })
  revalidatePath(`/book/${bookId}`)
}

export async function deleteTimelineEvent(id: string) {
  const ev = await prisma.timelineEvent.findUnique({ where: { id }, select: { bookId: true } })
  await prisma.timelineEvent.delete({ where: { id } })
  if (ev) revalidatePath(`/book/${ev.bookId}`)
}

// --- EVENT PARTICIPANTS ---
async function eventBookPath(eventId: string) {
  const ev = await prisma.timelineEvent.findUnique({ where: { id: eventId }, select: { bookId: true } })
  return ev ? `/book/${ev.bookId}` : '/'
}

export async function addEventCharacter(eventId: string, characterId: string) {
  const exists = await prisma.eventCharacter.findFirst({ where: { eventId, characterId } })
  if (!exists) await prisma.eventCharacter.create({ data: { eventId, characterId } })
  revalidatePath(await eventBookPath(eventId))
}

export async function removeEventCharacter(eventId: string, characterId: string) {
  await prisma.eventCharacter.deleteMany({ where: { eventId, characterId } })
  revalidatePath(await eventBookPath(eventId))
}

// --- LORE ---
function parseTags(input: string): string[] {
  const hashed = input.match(/#[\p{L}\p{N}_-]+/gu) ?? []
  let tokens = hashed.map((t) => t.toLowerCase())
  if (tokens.length === 0) {
    tokens = input
      .split(/[\s,;]+/)
      .filter(Boolean)
      .map((t) => '#' + t.replace(/^#+/, '').toLowerCase())
  }
  return [...new Set(tokens.filter((t) => t.length > 1))]
}

export async function getLoreEntries(bookId: string) {
  const rows = await prisma.loreEntry.findMany({ where: { bookId }, orderBy: { createdAt: 'desc' } })
  return rows.map((r) => ({
    id: r.id,
    text: r.text,
    tags: parseTags(r.tags),
    createdAt: r.createdAt.toISOString(),
    imageBase64: r.imageBase64,
  }))
}

export async function createLoreEntry(bookId: string, text: string, tagsRaw: string) {
  const tags = parseTags(tagsRaw)
  if (!text.trim() || tags.length === 0) return
  await prisma.loreEntry.create({ data: { bookId, text: text.trim(), tags: tags.join(' ') } })
  revalidatePath(`/book/${bookId}`)
}

export async function updateLoreEntry(id: string, text: string, tagsRaw: string) {
  const tags = parseTags(tagsRaw)
  if (!text.trim() || tags.length === 0) return
  const entry = await prisma.loreEntry.findUnique({ where: { id }, select: { bookId: true } })
  await prisma.loreEntry.update({ where: { id }, data: { text: text.trim(), tags: tags.join(' ') } })
  if (entry) revalidatePath(`/book/${entry.bookId}`)
}

export async function deleteLoreEntry(id: string) {
  const entry = await prisma.loreEntry.findUnique({ where: { id }, select: { bookId: true } })
  await prisma.loreEntry.delete({ where: { id } })
  if (entry) revalidatePath(`/book/${entry.bookId}`)
}

// --- GRAPH ---
export type GraphData = {
  chapters: { id: string; title: string; firstSentence: string | null }[]
  characters: { id: string; name: string; role: string; snippet: string | null }[]
  events: { id: string; label: string; snippet: string | null }[]
  edges: { kind: 'ch-ch' | 'ch-char' | 'ch-event' | 'char-char' | 'ev-char'; a: string; b: string }[]
}

export async function getGraphData(bookId: string): Promise<GraphData> {
  const [chapters, characters, events, evChars, evMentions] = await Promise.all([
    prisma.chapter.findMany({
      where: { bookId },
      orderBy: { order: 'asc' },
      select: { id: true, title: true, content: true },
    }),
    prisma.character.findMany({
      where: { bookId },
      select: {
        id: true,
        name: true,
        role: true,
        bio: true,
        mentions: { select: { chapterId: true } },
        relations: { select: { relatedId: true } },
      },
    }),
    prisma.timelineEvent.findMany({
      where: { bookId },
      select: { id: true, description: true, summary: true, chapterId: true },
    }),
    prisma.eventCharacter.findMany({
      where: { event: { bookId } },
      select: { eventId: true, characterId: true },
    }),
    prisma.eventMention.findMany({
      where: { event: { bookId } },
      select: { eventId: true, chapterId: true },
    }),
  ])

  const edges: GraphData['edges'] = []
  for (let i = 0; i + 1 < chapters.length; i++) {
    edges.push({ kind: 'ch-ch', a: chapters[i].id, b: chapters[i + 1].id })
  }
  for (const c of characters) {
    for (const m of c.mentions) edges.push({ kind: 'ch-char', a: m.chapterId, b: c.id })
    for (const r of c.relations) edges.push({ kind: 'char-char', a: c.id, b: r.relatedId })
  }
  for (const e of events) {
    if (e.chapterId) edges.push({ kind: 'ch-event', a: e.chapterId, b: e.id })
  }
  for (const ec of evChars) edges.push({ kind: 'ev-char', a: ec.eventId, b: ec.characterId })
  for (const em of evMentions) edges.push({ kind: 'ch-event', a: em.chapterId, b: em.eventId })

  return {
    chapters: chapters.map((c) => ({
      id: c.id,
      title: c.title,
      firstSentence: extractFirstSentence(c.content),
    })),
    characters: characters.map((c) => ({
      id: c.id,
      name: c.name,
      role: c.role,
      snippet: c.bio ? extractFirstSentence(c.bio) ?? c.bio.slice(0, 140) : null,
    })),
    events: events.map((e) => ({
      id: e.id,
      label: e.description || 'Событие',
      snippet: e.summary || null,
    })),
    edges,
  }
}

// --- DELETE ---
export async function deleteBook(id: string) {
  await prisma.book.delete({ where: { id } })
  revalidatePath('/')
}

export async function checkChapterExists(id: string): Promise<boolean> {
  const chapter = await prisma.chapter.findUnique({ where: { id }, select: { id: true } })
  return chapter !== null
}

export async function deleteChapter(id: string) {
  const chapter = await prisma.chapter.findUnique({
    where: { id },
    select: { bookId: true }
  })
  
  if (!chapter) return

  await prisma.$transaction([
    prisma.chapterMention.deleteMany({ where: { chapterId: id } }),
    prisma.eventMention.deleteMany({ where: { chapterId: id } }),
    prisma.chapter.delete({ where: { id } })
  ])

  revalidatePath(`/book/${chapter.bookId}`)
}

export async function deleteCharacter(id: string) {
  const path = await characterBookPath(id)
  await prisma.character.delete({ where: { id } })
  revalidatePath(path)
}

export async function deleteLocation(id: string) {
  const loc = await prisma.location.findUnique({ where: { id }, select: { bookId: true } })
  await prisma.location.delete({ where: { id } })
  if (loc) revalidatePath(`/book/${loc.bookId}`)
}

export async function getSeriesList() {
  await schemaReady
  return prisma.series.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } })
}

export async function getBooksWithSeries() {
  await schemaReady
  return prisma.book.findMany({
    orderBy: { createdAt: 'asc' },
    include: { series: true },
  })
}

export async function createSeries(fd: FormData) {
  await schemaReady
  const name = ((fd.get('name') as string) ?? '').trim()
  if (!name) return
  const existing = await prisma.series.findUnique({ where: { name } })
  if (!existing) {
    await prisma.series.create({ data: { name } })
  }
  revalidatePath('/')
}

export async function deleteSeries(id: string) {
  await schemaReady
  await prisma.series.delete({ where: { id } })
  revalidatePath('/')
}

export async function setBookSeries(bookId: string, seriesId: string | null) {
  await schemaReady
  await prisma.book.update({ where: { id: bookId }, data: { seriesId } })
  revalidatePath('/')
  revalidatePath(`/book/${bookId}`)
}

export async function moveChapter(chapterId: string, dir: number) {
  await schemaReady
  const ch = await prisma.chapter.findUnique({
    where: { id: chapterId },
    select: { id: true, bookId: true, actName: true },
  })
  if (!ch) return
  const siblings = await prisma.chapter.findMany({
    where: { bookId: ch.bookId, actName: ch.actName },
    orderBy: { order: 'asc' },
    select: { id: true },
  })
  const idx = siblings.findIndex((s) => s.id === chapterId)
  const target = idx + dir
  if (idx < 0 || target < 0 || target >= siblings.length) return
  const ids = siblings.map((s) => s.id)
  const [moved] = ids.splice(idx, 1)
  ids.splice(target, 0, moved)
  await prisma.$transaction(
    ids.map((id, i) => prisma.chapter.update({ where: { id }, data: { order: i + 1 } })),
  )
  await renumberBook(ch.bookId)
  revalidatePath(`/book/${ch.bookId}`)
}

export async function getBooksWithChapters() {
  await schemaReady
  return prisma.book.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      title: true,
      chapters: { orderBy: { order: 'asc' }, select: { id: true, title: true } },
    },
  })
}

export async function setChapterAct(chapterId: string, actName: string | null) {
  await schemaReady
  const ch = await prisma.chapter.findUnique({ where: { id: chapterId }, select: { bookId: true } })
  if (!ch) return
  const maxOrd = await prisma.chapter.aggregate({ where: { bookId: ch.bookId }, _max: { order: true } })
  await prisma.chapter.update({
    where: { id: chapterId },
    data: { actName, order: (maxOrd._max.order ?? 0) + 1 },
  })
  await renumberBook(ch.bookId)
  revalidatePath(`/book/${ch.bookId}`)
}

export async function renameActInBook(bookId: string, oldName: string, newName: string) {
  await schemaReady
  const name = newName.trim()
  if (!name) return
  await prisma.chapter.updateMany({ where: { bookId, actName: oldName }, data: { actName: name } })
  revalidatePath(`/book/${bookId}`)
}

export async function deleteActInBook(bookId: string, name: string) {
  await schemaReady
  await prisma.chapter.updateMany({ where: { bookId, actName: name }, data: { actName: null } })
  revalidatePath(`/book/${bookId}`)
}

export async function createChapterInAct(bookId: string, actName: string) {
  await schemaReady
  const count = await prisma.chapter.count({ where: { bookId } })
  const maxOrd = await prisma.chapter.aggregate({ where: { bookId }, _max: { order: true } })
  await prisma.chapter.create({
    data: { bookId, actName, title: `Глава ${count + 1}`, order: (maxOrd._max.order ?? 0) + 1 },
  })
  await renumberBook(bookId)
  revalidatePath(`/book/${bookId}`)
}

type BlockKey = { t: 'c' | 'a'; id: string }
const keyOf = (k: BlockKey) => k.t + ':' + k.id

async function readStructure(bookId: string): Promise<BlockKey[]> {
  const book = await prisma.book.findUnique({ where: { id: bookId }, select: { structure: true } })
  const chapters = await prisma.chapter.findMany({
    where: { bookId },
    orderBy: { order: 'asc' },
    select: { id: true, actName: true },
  })
  let list: BlockKey[] = []
  if (book?.structure) {
    try {
      list = JSON.parse(book.structure) as BlockKey[]
    } catch {
      list = []
    }
  }
  const looseIds = new Set(chapters.filter((c) => !c.actName).map((c) => c.id))
  const actNames: string[] = []
  for (const c of chapters) {
    if (c.actName && !actNames.includes(c.actName)) actNames.push(c.actName)
  }
  list = list.filter((k) => (k.t === 'c' ? looseIds.has(k.id) : actNames.includes(k.id)))
  const seen = new Set(list.map(keyOf))
  for (const c of chapters) {
    if (!c.actName && !seen.has('c:' + c.id)) list.push({ t: 'c', id: c.id })
  }
  for (const n of actNames) {
    if (!seen.has('a:' + n)) list.push({ t: 'a', id: n })
  }
  return list
}

async function writeStructure(bookId: string, list: BlockKey[]) {
  await prisma.book.update({ where: { id: bookId }, data: { structure: JSON.stringify(list) } })
}

async function renumberBook(bookId: string) {
  const list = await readStructure(bookId)
  const chapters = await prisma.chapter.findMany({
    where: { bookId },
    orderBy: { order: 'asc' },
    select: { id: true, actName: true },
  })
  const loose: string[] = []
  const byAct = new Map<string, string[]>()
  for (const c of chapters) {
    if (c.actName) {
      const arr = byAct.get(c.actName) ?? []
      arr.push(c.id)
      byAct.set(c.actName, arr)
    } else {
      loose.push(c.id)
    }
  }
  const looseSet = new Set(loose)
  const updates: { id: string; order: number }[] = []
  let n = 1
  for (const k of list) {
    if (k.t === 'c') {
      if (looseSet.has(k.id)) updates.push({ id: k.id, order: n++ })
    } else {
      for (const cid of byAct.get(k.id) ?? []) updates.push({ id: cid, order: n++ })
    }
  }
  if (updates.length > 0) {
    await prisma.$transaction(
      updates.map((u) => prisma.chapter.update({ where: { id: u.id }, data: { order: u.order } })),
    )
  }
}

export async function setBookExportMeta(bookId: string, value: boolean) {
  await schemaReady
  await prisma.book.update({ where: { id: bookId }, data: { exportMeta: value } })
  revalidatePath(`/book/${bookId}`)
}

export async function moveBlock(bookId: string, key: string, dir: number) {
  await schemaReady
  const list = await readStructure(bookId)
  const idx = list.findIndex((k) => keyOf(k) === key)
  const target = idx + dir
  if (idx < 0 || target < 0 || target >= list.length) return
  const [m] = list.splice(idx, 1)
  list.splice(target, 0, m)
  await writeStructure(bookId, list)
  await renumberBook(bookId)
  revalidatePath(`/book/${bookId}`)
}

export async function saveLoreEntryFull(fd: FormData) {
  await schemaReady
  const id = ((fd.get('id') as string) ?? '').trim() || null
  const bookId = ((fd.get('bookId') as string) ?? '').trim()
  const text = (fd.get('text') as string) ?? ''
  const tagsRaw = (fd.get('tags') as string) ?? ''
  const img = await readImageField(fd, 'image')
  const tags = parseTags(tagsRaw)
  if (!text.trim() || tags.length === 0) return
  if (id) {
    const entry = await prisma.loreEntry.findUnique({ where: { id }, select: { bookId: true, imageBase64: true } })
    await prisma.loreEntry.update({
      where: { id },
      data: {
        text: text.trim(),
        tags: tags.join(' '),
        ...(img.clear ? { imageBase64: null } : img.keep ? {} : { imageBase64: img.value }),
      },
    })
    if (entry) revalidatePath(`/book/${entry.bookId}`)
  } else {
    if (!bookId) return
    await prisma.loreEntry.create({
      data: { bookId, text: text.trim(), tags: tags.join(' '), imageBase64: img.clear ? null : img.value },
    })
    revalidatePath(`/book/${bookId}`)
  }
}

export async function getBookBlocks(bookId: string) {
  await schemaReady
  const list = await readStructure(bookId)
  const chapters = await prisma.chapter.findMany({ where: { bookId }, orderBy: { order: 'asc' } })
  const chMap = new Map(chapters.map((c) => [c.id, c]))
  const byAct = new Map<string, typeof chapters>()
  for (const c of chapters) {
    if (!c.actName) continue
    const arr = byAct.get(c.actName) ?? []
    arr.push(c)
    byAct.set(c.actName, arr)
  }
  const blocks: (
    | { kind: 'chapter'; ch: (typeof chapters)[number] }
    | { kind: 'act'; name: string; chs: typeof chapters }
  )[] = []
  for (const k of list) {
    if (k.t === 'c') {
      const ch = chMap.get(k.id)
      if (ch) blocks.push({ kind: 'chapter', ch })
    } else {
      blocks.push({ kind: 'act', name: k.id, chs: byAct.get(k.id) ?? [] })
    }
  }
  return blocks
}

// --- NOTES ---
export type NoteRow = {
  id: string
  title: string
  text: string
  kind: string
  done: boolean
  imageBase64: string | null
  posX: number | null
  posY: number | null
}

export async function getNotes(bookId: string): Promise<NoteRow[]> {
  await schemaReady
  const rows = await prisma.note.findMany({ where: { bookId }, orderBy: { createdAt: 'asc' } })
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    text: r.text,
    kind: r.kind,
    done: r.done,
    imageBase64: r.imageBase64,
    posX: r.posX,
    posY: r.posY,
  }))
}

export async function createNote(bookId: string, fd?: FormData) {
  await schemaReady
  const title = ((fd?.get('title') as string) ?? '').trim()
  await prisma.note.create({ data: { bookId, title } })
  revalidatePath(`/book/${bookId}`)
}

export async function saveNote(id: string, fd: FormData) {
  await schemaReady
  const title = ((fd.get('title') as string) ?? '').trim()
  const text = (fd.get('text') as string) ?? ''
  const kind = (fd.get('kind') as string) ?? 'other'
  const done = fd.get('done') === '1'
  const img = await readImageField(fd, 'image')
  const note = await prisma.note.findUnique({ where: { id }, select: { bookId: true } })
  if (!note) return
  await prisma.note.update({
    where: { id },
    data: {
      title,
      text,
      kind,
      done,
      ...(img.clear ? { imageBase64: null } : img.keep ? {} : { imageBase64: img.value }),
    },
  })
  revalidatePath(`/book/${note.bookId}`)
}

export async function toggleNoteDone(id: string) {
  await schemaReady
  const n = await prisma.note.findUnique({ where: { id }, select: { bookId: true, done: true } })
  if (!n) return
  await prisma.note.update({ where: { id }, data: { done: !n.done } })
  revalidatePath(`/book/${n.bookId}`)
}

export async function moveNote(id: string, x: number, y: number) {
  await schemaReady
  await prisma.note.update({ where: { id }, data: { posX: x, posY: y } })
}

export async function deleteNote(id: string) {
  await schemaReady
  const n = await prisma.note.findUnique({ where: { id }, select: { bookId: true } })
  if (!n) return
  await prisma.note.delete({ where: { id } })
  revalidatePath(`/book/${n.bookId}`)
}

export async function setBookStatus(bookId: string, status: string) {
  await schemaReady
  const st = status === 'idea' || status === 'archive' ? status : 'active'
  await prisma.book.update({ where: { id: bookId }, data: { status: st } })
  revalidatePath('/')
  revalidatePath(`/book/${bookId}`)
}

export async function setSeriesStatus(seriesId: string, status: string) {
  await schemaReady
  const st = status === 'idea' || status === 'archive' ? status : 'active'
  await prisma.book.updateMany({ where: { seriesId }, data: { status: st } })
  revalidatePath('/')
}

// --- STORYLINES ---
export type StorylineRow = {
  id: string
  name: string
  beats: {
    id: string
    title: string
    summary: string
    chapterId: string | null
    chapterTitle: string | null
    chapterOrder: number | null
    eventId: string | null
    eventLabel: string | null
    eventYear: number | null
    eventDay: number | null
  }[]
}

export async function getStorylines(bookId: string): Promise<StorylineRow[]> {
  await schemaReady
  const rows = await prisma.storyline.findMany({
    where: { bookId },
    orderBy: { order: 'asc' },
    include: {
      beats: {
        orderBy: { order: 'asc' },
        include: {
          chapter: { select: { title: true, order: true } },
          event: { select: { description: true, bookYear: true, bookDay: true } },
        },
      },
    },
  })
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    beats: r.beats.map((b) => ({
      id: b.id,
      title: b.title,
      summary: b.summary,
      chapterId: b.chapterId,
      chapterTitle: b.chapter?.title ?? null,
      chapterOrder: b.chapter?.order ?? null,
      eventId: b.eventId,
      eventLabel: b.event?.description ?? null,
      eventYear: b.event?.bookYear ?? null,
      eventDay: b.event?.bookDay ?? null,
    })),
  }))
}

export async function createStoryline(bookId: string, fd: FormData) {
  await schemaReady
  const name = ((fd.get('name') as string) ?? '').trim()
  if (!name) return
  const count = await prisma.storyline.count({ where: { bookId } })
  await prisma.storyline.create({ data: { bookId, name, order: count + 1 } })
  revalidatePath(`/book/${bookId}`)
}

export async function saveStoryline(id: string, fd: FormData) {
  await schemaReady
  const name = ((fd.get('name') as string) ?? '').trim()
  if (!name) return
  const line = await prisma.storyline.findUnique({ where: { id }, select: { bookId: true } })
  if (!line) return
  await prisma.storyline.update({ where: { id }, data: { name } })
  revalidatePath(`/book/${line.bookId}`)
}

export async function deleteStoryline(id: string) {
  await schemaReady
  const line = await prisma.storyline.findUnique({ where: { id }, select: { bookId: true } })
  if (!line) return
  await prisma.storyline.delete({ where: { id } })
  revalidatePath(`/book/${line.bookId}`)
}

export async function moveStoryline(id: string, dir: number) {
  await schemaReady
  const line = await prisma.storyline.findUnique({ where: { id }, select: { bookId: true } })
  if (!line) return
  const siblings = await prisma.storyline.findMany({
    where: { bookId: line.bookId },
    orderBy: { order: 'asc' },
    select: { id: true },
  })
  const idx = siblings.findIndex((s) => s.id === id)
  const target = idx + dir
  if (idx < 0 || target < 0 || target >= siblings.length) return
  const ids = siblings.map((s) => s.id)
  const [m] = ids.splice(idx, 1)
  ids.splice(target, 0, m)
  await prisma.$transaction(ids.map((sid, i) => prisma.storyline.update({ where: { id: sid }, data: { order: i + 1 } })))
  revalidatePath(`/book/${line.bookId}`)
}

export async function createBeat(lineId: string, fd: FormData) {
  await schemaReady
  const title = ((fd.get('title') as string) ?? '').trim()
  const line = await prisma.storyline.findUnique({ where: { id: lineId }, select: { bookId: true } })
  if (!line) return
  const count = await prisma.plotBeat.count({ where: { lineId } })
  await prisma.plotBeat.create({ data: { lineId, title, order: count + 1 } })
  revalidatePath(`/book/${line.bookId}`)
}

export async function saveBeat(id: string, fd: FormData) {
  await schemaReady
  const title = ((fd.get('title') as string) ?? '').trim()
  const summary = (fd.get('summary') as string) ?? ''
  const chapterId = ((fd.get('chapterId') as string) ?? '') || null
  const eventId = ((fd.get('eventId') as string) ?? '') || null
  const beat = await prisma.plotBeat.findUnique({
    where: { id },
    select: { line: { select: { bookId: true } } },
  })
  if (!beat) return
  await prisma.plotBeat.update({ where: { id }, data: { title, summary, chapterId, eventId } })
  revalidatePath(`/book/${beat.line.bookId}`)
}

export async function deleteBeat(id: string) {
  await schemaReady
  const beat = await prisma.plotBeat.findUnique({
    where: { id },
    select: { line: { select: { bookId: true } } },
  })
  if (!beat) return
  await prisma.plotBeat.delete({ where: { id } })
  revalidatePath(`/book/${beat.line.bookId}`)
}

export async function moveBeat(lineId: string, id: string, dir: number) {
  await schemaReady
  const line = await prisma.storyline.findUnique({ where: { id: lineId }, select: { bookId: true } })
  if (!line) return
  const siblings = await prisma.plotBeat.findMany({
    where: { lineId },
    orderBy: { order: 'asc' },
    select: { id: true },
  })
  const idx = siblings.findIndex((s) => s.id === id)
  const target = idx + dir
  if (idx < 0 || target < 0 || target >= siblings.length) return
  const ids = siblings.map((s) => s.id)
  const [m] = ids.splice(idx, 1)
  ids.splice(target, 0, m)
  await prisma.$transaction(ids.map((bid, i) => prisma.plotBeat.update({ where: { id: bid }, data: { order: i + 1 } })))
  revalidatePath(`/book/${line.bookId}`)
}

import { importDocx } from './importDocx'

export async function importBookFromDocx(
  fd: FormData,
): Promise<{ ok: true; bookId: string } | { ok: false; error: string }> {
  await schemaReady
  try {
    const file = fd.get('file')
    if (!(file instanceof File) || file.size === 0) return { ok: false, error: 'Файл не выбран или пуст' }
    const name = file.name.toLowerCase()
    if (!name.endsWith('.docx')) {
      return {
        ok: false,
        error: 'Формат .doc не поддерживается. Сохраните файл как .docx в Word или LibreOffice и попробуйте снова.',
      }
    }
    const buffer = Buffer.from(await file.arrayBuffer())
    const { coverBase64, chapters } = await importDocx(buffer)
    const bookTitle = file.name.replace(/\.docx?$/i, '')
    const book = await prisma.book.create({
      data: { title: bookTitle, coverBase64, status: 'active', exportMeta: true },
    })
    for (let i = 0; i < chapters.length; i++) {
      await prisma.chapter.create({
        data: { bookId: book.id, title: chapters[i].title, content: chapters[i].content, order: i + 1 },
      })
    }
    revalidatePath('/')
    return { ok: true, bookId: book.id }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Ошибка импорта' }
  }
}

export async function importChaptersFromDocx(
  bookId: string,
  fd: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await schemaReady
  try {
    const file = fd.get('file')
    if (!(file instanceof File) || file.size === 0) return { ok: false, error: 'Файл не выбран или пуст' }
    const name = file.name.toLowerCase()
    if (!name.endsWith('.docx')) {
      return {
        ok: false,
        error: 'Формат .doc не поддерживается. Сохраните файл как .docx в Word или LibreOffice и попробуйте снова.',
      }
    }
    const book = await prisma.book.findUnique({ where: { id: bookId }, select: { id: true } })
    if (!book) return { ok: false, error: 'Книга не найдена' }
    const buffer = Buffer.from(await file.arrayBuffer())
    const { chapters } = await importDocx(buffer)
    const maxOrd = await prisma.chapter.aggregate({ where: { bookId }, _max: { order: true } })
    let next = (maxOrd._max.order ?? 0) + 1
    for (const ch of chapters) {
      await prisma.chapter.create({ data: { bookId, title: ch.title, content: ch.content, order: next++ } })
    }
    revalidatePath(`/book/${bookId}`)
    return { ok: true }
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Ошибка импорта' }
  }
}