-- Replay file for the cloudinary migration (was applied to the shared DB before the file was committed)

ALTER TABLE "PublicCv" DROP COLUMN IF EXISTS "pdfData";
ALTER TABLE "PublicCv" ADD COLUMN IF NOT EXISTS "pdfUrl" TEXT NOT NULL;

ALTER TABLE "PublicInterview" DROP COLUMN IF EXISTS "pdfData";
ALTER TABLE "PublicInterview" ADD COLUMN IF NOT EXISTS "pdfUrl" TEXT;

CREATE TABLE IF NOT EXISTS "PublicCoverLetter" (
    "id" TEXT NOT NULL,
    "sessionKey" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicCoverLetter_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "PublicCoverLetter_sessionKey_idx" ON "PublicCoverLetter"("sessionKey");
CREATE INDEX IF NOT EXISTS "PublicCoverLetter_createdAt_idx" ON "PublicCoverLetter"("createdAt");
