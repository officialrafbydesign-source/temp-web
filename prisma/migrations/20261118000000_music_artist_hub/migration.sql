-- CreateEnum
CREATE TYPE "MusicExtraAccess" AS ENUM ('public', 'members', 'purchase');

-- CreateEnum
CREATE TYPE "ArtistSubmissionStatus" AS ENUM ('draft', 'submitted', 'approved', 'rejected');

-- AlterTable
ALTER TABLE "Artist" ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "biography" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isProfilePublished" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "links" JSONB,
ADD COLUMN     "slug" TEXT;

-- AlterTable
ALTER TABLE "Release" ADD COLUMN     "packageNote" TEXT,
ADD COLUMN     "standardLinks" JSONB;

-- CreateTable
CREATE TABLE "MusicExtra" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "releaseId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "kind" TEXT NOT NULL,
    "access" "MusicExtraAccess" NOT NULL DEFAULT 'public',
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "rafOnly" BOOLEAN NOT NULL DEFAULT false,
    "url" TEXT,
    "fileKey" TEXT,
    "previewImageUrl" TEXT,
    "seriesTitle" TEXT,
    "episodeNo" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MusicExtra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtistAccess" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "agreementUrl" TEXT NOT NULL,
    "agreementVersion" TEXT NOT NULL,
    "agreementAcceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArtistAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtistSubmission" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "accessId" TEXT NOT NULL,
    "targetReleaseId" TEXT,
    "status" "ArtistSubmissionStatus" NOT NULL DEFAULT 'draft',
    "data" JSONB NOT NULL,
    "reviewNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArtistSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArtistUpload" (
    "id" TEXT NOT NULL,
    "accessId" TEXT NOT NULL,
    "fileKey" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "byteSize" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArtistUpload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MusicExtra_artistId_isPublished_sortOrder_idx" ON "MusicExtra"("artistId", "isPublished", "sortOrder");

-- CreateIndex
CREATE INDEX "MusicExtra_releaseId_isPublished_sortOrder_idx" ON "MusicExtra"("releaseId", "isPublished", "sortOrder");

-- CreateIndex
CREATE INDEX "ArtistAccess_userId_isActive_idx" ON "ArtistAccess"("userId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "ArtistAccess_artistId_userId_key" ON "ArtistAccess"("artistId", "userId");

-- CreateIndex
CREATE INDEX "ArtistSubmission_artistId_status_idx" ON "ArtistSubmission"("artistId", "status");

-- CreateIndex
CREATE INDEX "ArtistSubmission_accessId_createdAt_idx" ON "ArtistSubmission"("accessId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ArtistUpload_fileKey_key" ON "ArtistUpload"("fileKey");

-- CreateIndex
CREATE INDEX "ArtistUpload_accessId_createdAt_idx" ON "ArtistUpload"("accessId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_slug_key" ON "Artist"("slug");

-- AddForeignKey
ALTER TABLE "MusicExtra" ADD CONSTRAINT "MusicExtra_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MusicExtra" ADD CONSTRAINT "MusicExtra_releaseId_fkey" FOREIGN KEY ("releaseId") REFERENCES "Release"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistAccess" ADD CONSTRAINT "ArtistAccess_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistAccess" ADD CONSTRAINT "ArtistAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistSubmission" ADD CONSTRAINT "ArtistSubmission_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistSubmission" ADD CONSTRAINT "ArtistSubmission_accessId_fkey" FOREIGN KEY ("accessId") REFERENCES "ArtistAccess"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistSubmission" ADD CONSTRAINT "ArtistSubmission_targetReleaseId_fkey" FOREIGN KEY ("targetReleaseId") REFERENCES "Release"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArtistUpload" ADD CONSTRAINT "ArtistUpload_accessId_fkey" FOREIGN KEY ("accessId") REFERENCES "ArtistAccess"("id") ON DELETE RESTRICT ON UPDATE CASCADE;


-- Enable the existing Trexx artist page without changing release ownership.
-- Other artists stay unpublished until RAF configures their pages.
UPDATE "Artist" SET "slug" = 'trexx', "isProfilePublished" = true
WHERE "id" = (SELECT "id" FROM "Artist" WHERE lower("name") = 'trexx' ORDER BY "id" LIMIT 1);
INSERT INTO "Artist" ("id", "name", "slug", "isProfilePublished")
SELECT 'raf_artist_trexx', 'Trexx', 'trexx', true
WHERE NOT EXISTS (SELECT 1 FROM "Artist" WHERE lower("name") = 'trexx');
