-- Recommendation tracking columns: click rank on OfferView + StudentProfile timestamps for embedding refresh.
ALTER TABLE "OfferView" ADD COLUMN "position" INTEGER;
ALTER TABLE "StudentProfile" ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "StudentProfile" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
