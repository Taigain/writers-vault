import { PrismaClient } from '@prisma/client'

const g = globalThis as unknown as { prisma?: PrismaClient; schemaReady?: Promise<void> }
export const prisma = g.prisma ?? new PrismaClient()
if (!g.prisma) g.prisma = prisma

async function ensureSchema() {
  try {
    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "Series" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )`,
    )
    await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Series_name_key" ON "Series"("name")`)

    const bookCols = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("Book")`)
    if (!bookCols.some((c) => c.name === 'exportMeta')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Book" ADD COLUMN "exportMeta" BOOLEAN NOT NULL DEFAULT 1`)
    }
    if (!bookCols.some((c) => c.name === 'status')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "Book" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active'`)
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

    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "Storyline" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "bookId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT "Storyline_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )`,
    )
    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "PlotBeat" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "lineId" TEXT NOT NULL,
        "title" TEXT NOT NULL DEFAULT '',
        "summary" TEXT NOT NULL DEFAULT '',
        "order" INTEGER NOT NULL DEFAULT 0,
        "chapterId" TEXT,
        "eventId" TEXT,
        CONSTRAINT "PlotBeat_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "Storyline" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "PlotBeat_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
        CONSTRAINT "PlotBeat_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "TimelineEvent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
      )`,
    )
    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "Note" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "bookId" TEXT NOT NULL,
        "title" TEXT NOT NULL DEFAULT '',
        "text" TEXT NOT NULL DEFAULT '',
        "kind" TEXT NOT NULL DEFAULT 'other',
        "done" BOOLEAN NOT NULL DEFAULT 0,
        "imageBase64" TEXT,
        "posX" INTEGER,
        "posY" INTEGER,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Note_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )`,
    )
    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "BeatCharacter" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "beatId" TEXT NOT NULL,
        "characterId" TEXT NOT NULL,
        CONSTRAINT "BeatCharacter_beatId_fkey" FOREIGN KEY ("beatId") REFERENCES "PlotBeat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "BeatCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )`,
    )
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS "BeatCharacter_beatId_characterId_key" ON "BeatCharacter"("beatId", "characterId")`,
    )

    const beatCols = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("PlotBeat")`)
    if (!beatCols.some((c) => c.name === 'bookId')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "PlotBeat" ADD COLUMN "bookId" TEXT`)
      await prisma.$executeRawUnsafe(
        `UPDATE "PlotBeat" SET "bookId" = (SELECT "bookId" FROM "Storyline" WHERE "Storyline"."id" = "PlotBeat"."lineId")`,
      )
    }

    const pbCols = await prisma.$queryRawUnsafe<Array<{ name: string; notnull: number }>>(
      `PRAGMA table_info("PlotBeat")`,
    )
    if (pbCols.some((c) => c.name === 'lineId' && c.notnull === 1)) {
      try {
        await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = OFF`)
        await prisma.$transaction([
          prisma.$executeRawUnsafe(`CREATE TABLE "PlotBeat_new" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "bookId" TEXT,
            "lineId" TEXT,
            "title" TEXT NOT NULL DEFAULT '',
            "summary" TEXT NOT NULL DEFAULT '',
            "order" INTEGER NOT NULL DEFAULT 0,
            "chapterId" TEXT,
            "eventId" TEXT,
            CONSTRAINT "PlotBeat_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT "PlotBeat_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
            CONSTRAINT "PlotBeat_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "TimelineEvent" ("id") ON DELETE SET NULL ON UPDATE CASCADE
          )`),
          prisma.$executeRawUnsafe(`INSERT INTO "PlotBeat_new" ("id", "bookId", "lineId", "title", "summary", "order", "chapterId", "eventId")
            SELECT "id", "bookId", "lineId", "title", "summary", "order", "chapterId", "eventId" FROM "PlotBeat"`),
          prisma.$executeRawUnsafe(`DROP TABLE "PlotBeat"`),
          prisma.$executeRawUnsafe(`ALTER TABLE "PlotBeat_new" RENAME TO "PlotBeat"`),
        ])
      } catch (e) {
        console.error('[ensureSchema] PlotBeat rebuild skipped:', e)
      } finally {
        await prisma.$executeRawUnsafe(`PRAGMA foreign_keys = ON`)
      }
    }

    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "BeatLine" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "beatId" TEXT NOT NULL,
        "lineId" TEXT NOT NULL,
        "order" INTEGER NOT NULL DEFAULT 0,
        CONSTRAINT "BeatLine_beatId_fkey" FOREIGN KEY ("beatId") REFERENCES "PlotBeat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "BeatLine_lineId_fkey" FOREIGN KEY ("lineId") REFERENCES "Storyline" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )`,
    )
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS "BeatLine_beatId_lineId_key" ON "BeatLine"("beatId", "lineId")`,
    )
    await prisma.$executeRawUnsafe(
      `INSERT OR IGNORE INTO "BeatLine" ("id", "beatId", "lineId", "order")
       SELECT 'mig_' || "id", "id", "lineId", "order" FROM "PlotBeat"
       WHERE "lineId" IS NOT NULL
         AND NOT EXISTS (SELECT 1 FROM "BeatLine" bl WHERE bl."beatId" = "PlotBeat"."id" AND bl."lineId" = "PlotBeat"."lineId")`,
    )

    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "DictEntry" (
        "id" TEXT NOT NULL PRIMARY KEY,
        "bookId" TEXT NOT NULL,
        "key" TEXT NOT NULL,
        "word" TEXT NOT NULL,
        "meaning" TEXT NOT NULL DEFAULT '',
        CONSTRAINT "DictEntry_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
      )`,
    )
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS "DictEntry_bookId_key_key" ON "DictEntry"("bookId", "key")`,
    )
    const dictCols = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("DictEntry")`)
    if (!dictCols.some((c) => c.name === 'forms')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "DictEntry" ADD COLUMN "forms" TEXT NOT NULL DEFAULT '[]'`)
    }
  } catch (e) {
    console.error('ensureSchema failed:', e)
  }
}

export const schemaReady = g.schemaReady ?? ensureSchema()
if (!g.schemaReady) g.schemaReady = schemaReady