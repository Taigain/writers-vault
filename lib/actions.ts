'use server'

import { prisma, schemaReady } from './prisma'
import { revalidatePath } from 'next/cache'
import { ROLES } from './roles'

const validRole = (role: string): string =>
  ROLES.some((r) => r.key === role) ? role : 'secondary'

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
  const uniqueNames = [...new Set(mentions.map((m) => m.replace(/[@\[\]]/g, '').trim()))]
  const entities = await prisma.character.findMany({ where: { bookId, name: { in: uniqueNames } } })
  const locations = await prisma.location.findMany({ where: { bookId, name: { in: uniqueNames } } })

  await prisma.chapterMention.deleteMany({ where: { chapterId } })
  const mentionsToCreate: { chapterId: string; characterId?: string; locationId?: string; snippet: string }[] = []
  for (const entity of entities) {
    mentionsToCreate.push({ chapterId, characterId: entity.id, snippet: content.substring(0, 100) })
  }
  for (const loc of locations) {
    mentionsToCreate.push({ chapterId, locationId: loc.id, snippet: content.substring(0, 100) })
  }
  if (mentionsToCreate.length > 0) {
    await prisma.chapterMention.createMany({ data: mentionsToCreate })
  }

  const eventMarks = content.match(/\[#(.*?)\]/g) || []
  const eventNames = [...new Set(eventMarks.map((m) => m.replace(/[#\[\]]/g, '').trim()))]
  const events = await prisma.timelineEvent.findMany({
    where: { bookId, description: { in: eventNames } },
  })
  await prisma.eventMention.deleteMany({ where: { chapterId } })
  if (events.length > 0) {
    await prisma.eventMention.createMany({
      data: events.map((ev) => ({ chapterId, eventId: ev.id })),
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
    data: { ...data, role: validRole(data.role) },
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
  const file = fd.get('image') as File | null

  let imageBase64: string | null = null
  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer())
    imageBase64 = `data:${file.type};base64,${buffer.toString('base64')}`
  }

  await prisma.location.update({
    where: { id },
    data: imageBase64 ? { name, desc, imageBase64 } : { name, desc },
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

export async function deleteChapter(chapterId: string) {
  const ch = await prisma.chapter.findUnique({ where: { id: chapterId }, select: { bookId: true } })
  await prisma.chapter.delete({ where: { id: chapterId } })
  if (ch) revalidatePath(`/book/${ch.bookId}`)
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
    select: { id: true, bookId: true },
  })
  if (!ch) return
  const siblings = await prisma.chapter.findMany({
    where: { bookId: ch.bookId },
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