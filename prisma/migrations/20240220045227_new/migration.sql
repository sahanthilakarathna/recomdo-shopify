/*
  Warnings:

  - You are about to drop the `RecomdoAIConfig` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RecomdoAIConfig";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Config" (
    "confi_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
