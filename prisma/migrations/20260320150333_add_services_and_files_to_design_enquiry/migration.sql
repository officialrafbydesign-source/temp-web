/*
  Warnings:

  - You are about to drop the column `fileUrl` on the `DesignEnquiry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "DesignEnquiry" DROP COLUMN "fileUrl",
ADD COLUMN     "fileUrls" TEXT[],
ADD COLUMN     "services" TEXT[];
