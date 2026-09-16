-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TimelineEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dateType" TEXT NOT NULL DEFAULT 'calendar',
    "date" TEXT NOT NULL DEFAULT '',
    "bookYear" INTEGER,
    "bookDay" INTEGER,
    "description" TEXT NOT NULL,
    "summary" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bookId" TEXT NOT NULL,
    "chapterId" TEXT,
    CONSTRAINT "TimelineEvent_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TimelineEvent_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_TimelineEvent" ("bookDay", "bookId", "bookYear", "createdAt", "date", "dateType", "description", "id") SELECT "bookDay", "bookId", "bookYear", "createdAt", "date", "dateType", "description", "id" FROM "TimelineEvent";
DROP TABLE "TimelineEvent";
ALTER TABLE "new_TimelineEvent" RENAME TO "TimelineEvent";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
