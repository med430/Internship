-- PublicCv: replace pdfData (bytes) with pdfUrl (string)
ALTER TABLE "PublicCv" ADD COLUMN "pdfUrl" TEXT NOT NULL DEFAULT '';
ALTER TABLE "PublicCv" DROP COLUMN "pdfData";
ALTER TABLE "PublicCv" ALTER COLUMN "pdfUrl" DROP DEFAULT;

-- PublicInterview: replace pdfData (bytes) with pdfUrl (string, nullable)
ALTER TABLE "PublicInterview" ADD COLUMN "pdfUrl" TEXT;
ALTER TABLE "PublicInterview" DROP COLUMN "pdfData";