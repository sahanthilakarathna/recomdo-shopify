/*
  Warnings:

  - The primary key for the `Configurations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `confi_id` on the `Configurations` table. All the data in the column will be lost.
  - Added the required column `config_id` to the `Configurations` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Configurations" (
    "config_id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "shop" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Configurations" ("path", "shop", "updated_at", "value") SELECT "path", "shop", "updated_at", "value" FROM "Configurations";
DROP TABLE "Configurations";
ALTER TABLE "new_Configurations" RENAME TO "Configurations";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
