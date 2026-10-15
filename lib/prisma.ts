import { PrismaClient } from '@prisma/client'

const g = globalThis as unknown as { prisma?: PrismaClient; schemaReady?: Promise<void> }
export const prisma = g.prisma ?? new PrismaClient()
if (!g.prisma) g.prisma = prisma

const MIGRATIONS: string[] = [
  "ALTER TABLE Book ADD COLUMN genre TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE Book ADD COLUMN spineColor TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE Book ADD COLUMN spineStyle TEXT NOT NULL DEFAULT 'tome'",
  "CREATE TABLE IF NOT EXISTS IdeaNote (id TEXT NOT NULL PRIMARY KEY, text TEXT NOT NULL DEFAULT '', color TEXT NOT NULL DEFAULT '', x INTEGER NOT NULL DEFAULT 40, y INTEGER NOT NULL DEFAULT 40, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "UPDATE TimelineEvent SET tag = REPLACE(tag, '_', ' ') WHERE instr(tag, '_') > 0",
  "UPDATE TimelineEvent SET description = REPLACE(description, '_', ' ') WHERE instr(description, '_') > 0",
  "CREATE TABLE IF NOT EXISTS License (id TEXT NOT NULL PRIMARY KEY, keyText TEXT NOT NULL DEFAULT '', proUntil DATETIME, trialUsedAt DATETIME, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE TABLE IF NOT EXISTS CloudAccount (id TEXT NOT NULL PRIMARY KEY, provider TEXT NOT NULL, displayName TEXT NOT NULL DEFAULT '', accessToken TEXT NOT NULL, refreshToken TEXT NOT NULL DEFAULT '', expiresAt DATETIME, createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "CREATE TABLE IF NOT EXISTS CloudSyncState (id TEXT NOT NULL PRIMARY KEY, bookId TEXT NOT NULL, accountId TEXT NOT NULL, remotePath TEXT NOT NULL, lastPushAt DATETIME, lastPullAt DATETIME, lastChecksum TEXT NOT NULL DEFAULT '', CONSTRAINT CloudSyncState_bookId_fkey FOREIGN KEY (bookId) REFERENCES Book (id) ON DELETE CASCADE ON UPDATE CASCADE)",
  "CREATE UNIQUE INDEX IF NOT EXISTS CloudSyncState_bookId_accountId_key ON CloudSyncState (bookId, accountId)",
  "ALTER TABLE Book ADD COLUMN exportTitle BOOLEAN NOT NULL DEFAULT 0",
  "ALTER TABLE Book ADD COLUMN exportAnnotation BOOLEAN NOT NULL DEFAULT 0",
  "ALTER TABLE Book ADD COLUMN exportSynopsis BOOLEAN NOT NULL DEFAULT 0",
  "ALTER TABLE Character ADD COLUMN age TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE Character ADD COLUMN gender TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE Character ADD COLUMN birth TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE Character ADD COLUMN race TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE Character ADD COLUMN country TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE Character ADD COLUMN language TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE Character ADD COLUMN archetype TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE Character ADD COLUMN goal TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE Character ADD COLUMN conflict TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE Character ADD COLUMN trauma TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE Character ADD COLUMN obsession TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE Character ADD COLUMN strengths TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE Character ADD COLUMN weaknesses TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE Character ADD COLUMN height TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE Character ADD COLUMN weight TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE Character ADD COLUMN build TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE Character ADD COLUMN eyes TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE Character ADD COLUMN hair TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE Character ADD COLUMN clothing TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE Character ADD COLUMN posture TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE Character ADD COLUMN voice TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE Character ADD COLUMN boardX INTEGER",
  "ALTER TABLE Character ADD COLUMN boardY INTEGER",
  "ALTER TABLE Book ADD COLUMN boardH INTEGER",
  "ALTER TABLE CharacterRelation ADD COLUMN kind TEXT NOT NULL DEFAULT 'mutual'",
  "ALTER TABLE PlotBeat ADD COLUMN canvasX INTEGER",
  "ALTER TABLE PlotBeat ADD COLUMN canvasY INTEGER",
  "CREATE TABLE IF NOT EXISTS BeatLink (id TEXT NOT NULL PRIMARY KEY, aId TEXT NOT NULL, bId TEXT NOT NULL, CONSTRAINT BeatLink_aId_fkey FOREIGN KEY (aId) REFERENCES PlotBeat (id) ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT BeatLink_bId_fkey FOREIGN KEY (bId) REFERENCES PlotBeat (id) ON DELETE CASCADE ON UPDATE CASCADE)",
  "CREATE UNIQUE INDEX IF NOT EXISTS BeatLink_aId_bId_key ON BeatLink (aId, bId)",
  "CREATE TABLE IF NOT EXISTS AuthorProfile (id TEXT NOT NULL PRIMARY KEY, name TEXT NOT NULL DEFAULT '', penNames TEXT NOT NULL DEFAULT '', genres TEXT NOT NULL DEFAULT '', createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)",
  "ALTER TABLE Book ADD COLUMN authorName TEXT",
  "ALTER TABLE Book ADD COLUMN exportAuthor BOOLEAN NOT NULL DEFAULT 0",
]

async function runMigrations() {
  for (const sql of MIGRATIONS) {
    try {
      await prisma.$executeRawUnsafe(sql)
    } catch {
      /* колонка или таблица уже существуют — пропускаем */
    }
  }
}

async function ensureSchema() {
  try {
    await prisma.$executeRawUnsafe(
      `CREATE TABLE IF NOT EXISTS "Series" ( "id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP )`,
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
    const emCols = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("EventMention")`)
    if (!emCols.some((c) => c.name === 'pos')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "EventMention" ADD COLUMN "pos" INTEGER`)
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
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Scene" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "chapterId" TEXT NOT NULL,
      "order" INTEGER NOT NULL DEFAULT 0,
      "title" TEXT NOT NULL DEFAULT '',
      "start" INTEGER NOT NULL DEFAULT 0,
      "end" INTEGER NOT NULL DEFAULT 0,
      CONSTRAINT "Scene_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`)
    await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "SceneCharacter" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "sceneId" TEXT NOT NULL,
      "characterId" TEXT NOT NULL,
      CONSTRAINT "SceneCharacter_sceneId_fkey" FOREIGN KEY ("sceneId") REFERENCES "Scene" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
      CONSTRAINT "SceneCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`)
    await prisma.$executeRawUnsafe(
      `CREATE UNIQUE INDEX IF NOT EXISTS "SceneCharacter_sceneId_characterId_key" ON "SceneCharacter"("sceneId", "characterId")`,
    )
    const cmCols = await prisma.$queryRawUnsafe<Array<{ name: string }>>(`PRAGMA table_info("ChapterMention")`)
    if (!cmCols.some((c) => c.name === 'pos')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "ChapterMention" ADD COLUMN "pos" INTEGER`)
    }
    if (!cmCols.some((c) => c.name === 'note')) {
      await prisma.$executeRawUnsafe(`ALTER TABLE "ChapterMention" ADD COLUMN "note" TEXT`)
    }
  } catch (e) {
    console.error('ensureSchema failed:', e)
  } finally {
    await runMigrations()
  }
}

export const schemaReady = g.schemaReady ?? ensureSchema()
if (!g.schemaReady) g.schemaReady = schemaReady