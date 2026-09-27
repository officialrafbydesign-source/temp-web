/*
  Warnings:

  - You are about to drop the column `coverUrl` on the `MusicProduct` table. All the data in the column will be lost.
  - You are about to drop the column `songId` on the `MusicProduct` table. All the data in the column will be lost.
  - You are about to drop the column `genre` on the `Song` table. All the data in the column will be lost.
  - You are about to drop the `Variant` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[releaseId]` on the table `MusicProduct` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `itemType` to the `MusicProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `releaseId` to the `MusicProduct` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `productType` on the `Order` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `releaseId` to the `Song` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('beat', 'music', 'service', 'design');

-- CreateEnum
CREATE TYPE "MusicType" AS ENUM ('album', 'ep', 'single');

-- AlterEnum
ALTER TYPE "OrderStatus" ADD VALUE 'pending';

-- DropForeignKey
ALTER TABLE "MusicProduct" DROP CONSTRAINT "MusicProduct_songId_fkey";

-- DropForeignKey
ALTER TABLE "Variant" DROP CONSTRAINT "Variant_musicProductId_fkey";

-- DropIndex
DROP INDEX "MusicProduct_songId_key";

-- AlterTable
ALTER TABLE "MusicProduct" DROP COLUMN "coverUrl",
DROP COLUMN "songId",
ADD COLUMN     "fileUrl" TEXT,
ADD COLUMN     "itemType" TEXT NOT NULL,
ADD COLUMN     "releaseId" TEXT NOT NULL,
ADD COLUMN     "stock" INTEGER;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "userId" TEXT,
ALTER COLUMN "stripeSessionId" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "currency" SET DEFAULT 'gbp',
DROP COLUMN "productType",
ADD COLUMN     "productType" "ProductType" NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- AlterTable
ALTER TABLE "Song" DROP COLUMN "genre",
ADD COLUMN     "audioUrl" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isrc" TEXT,
ADD COLUMN     "price" INTEGER,
ADD COLUMN     "releaseId" TEXT NOT NULL,
ADD COLUMN     "sellIndividually" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "trackNo" INTEGER;

-- DropTable
DROP TABLE "Variant";

-- CreateTable
CREATE TABLE "Release" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "MusicType" NOT NULL,
    "coverUrl" TEXT,
    "description" TEXT,
    "upc" TEXT,
    "artistId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Release_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MusicProduct_releaseId_key" ON "MusicProduct"("releaseId");

-- AddForeignKey
ALTER TABLE "Release" ADD CONSTRAINT "Release_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicProduct" ADD CONSTRAINT "MusicProduct_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
