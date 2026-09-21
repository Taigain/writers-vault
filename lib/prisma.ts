import { PrismaClient } from '@prisma/client'

const g = globalThis as unknown as { prisma?: PrismaClient; schemaReady?: Promise<void> }

export const prisma = g.prisma ?? new PrismaClient()
if (!g.prisma) g.prisma = prisma

async function ensureSchema() {
  try {
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Series" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`)
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Series_name_key" ON "Series"("name")`)
    const bookCols = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("Book")`)
    if (!bookCols.some((c) => c.name === 'exportMeta')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Book" ADD COLUMN "exportMeta" BOOLEAN NOT NULL DEFAULT 1`)
    }
    if (!bookCols.some((c) => c.name === 'structure')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Book" ADD COLUMN "structure" TEXT`)
    }
        const charCols = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("Character")`)
    if (!charCols.some((c) => c.name === 'aliases')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Character" ADD COLUMN "aliases" TEXT NOT NULL DEFAULT ''`)
    }
    const chCols = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("Chapter")`)
    if (!chCols.some((c) => c.name === 'actName')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Chapter" ADD COLUMN "actName" TEXT`)
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Chapter_actName_idx" ON "Chapter"("actName")`)
    }
        const charCols2 = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("Character")`)
    if (!charCols2.some((c) => c.name === 'portraitBase64')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Character" ADD COLUMN "portraitBase64" TEXT`)
    }
    const loreCols = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("LoreEntry")`)
    if (!loreCols.some((c) => c.name === 'imageBase64')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "LoreEntry" ADD COLUMN "imageBase64" TEXT`)
    }
        const evCols = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("TimelineEvent")`)
    if (!evCols.some((c) => c.name === 'tag')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "TimelineEvent" ADD COLUMN "tag" TEXT`)
    }
  } catch (e) {
    console.error('ensureSchema failed:', e)
  }
}

export const schemaReady = g.schemaReady ?? ensureSchema()
if (!g.schemaReady) g.schemaReady = schemaReady