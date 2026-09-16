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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bookId" TEXT NOT NULL,
    CONSTRAINT "TimelineEvent_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TimelineEvent" ("bookId", "date", "description", "id") SELECT "bookId", "date", "description", "id" FROM "TimelineEvent";
DROP TABLE "TimelineEvent";
ALTER TABLE "new_TimelineEvent" RENAME TO "TimelineEvent";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
