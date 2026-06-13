/*
  Warnings:

  - You are about to drop the column `referer` on the `PageView` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[anonymousId]` on the table `Visitor` will be added. If there are existing duplicate values, this will fail.
  - Made the column `url` on table `PageView` required. This step will fail if there are existing NULL values in that column.
  - Made the column `path` on table `PageView` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PageView" DROP COLUMN "referer",
ADD COLUMN     "referrer" TEXT,
ALTER COLUMN "url" SET NOT NULL,
ALTER COLUMN "path" SET NOT NULL;

-- AlterTable
ALTER TABLE "PerformanceEntry" ALTER COLUMN "fp" DROP NOT NULL,
ALTER COLUMN "fcp" DROP NOT NULL,
ALTER COLUMN "lcp" DROP NOT NULL,
ALTER COLUMN "inp" DROP NOT NULL,
ALTER COLUMN "cls" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Visitor_anonymousId_key" ON "Visitor"("anonymousId");

-- CreateIndex
CREATE INDEX "Visitor_userId_idx" ON "Visitor"("userId");

-- CreateIndex
CREATE INDEX "Visitor_anonymousId_idx" ON "Visitor"("anonymousId");
