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
    const cols = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("Book")`)
    if (!cols.some((c) => c.name === 'seriesId')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Book" ADD COLUMN "seriesId" TEXT REFERENCES "Series"("id") ON DELETE SET NULL ON UPDATE CASCADE`)
      await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "Book_seriesId_idx" ON "Book"("seriesId")`)
    }
  } catch (e) {
    console.error('ensureSchema failed:', e)
  }
}

export const schemaReady = g.schemaReady ?? ensureSchema()
if (!g.schemaReady) g.schemaReady = schemaReady