-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "applicationDeadline" TIMESTAMP(3),
ADD COLUMN     "languagesRequired" TEXT[],
ADD COLUMN     "positionsCount" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "stipendMax" DOUBLE PRECISION,
ADD COLUMN     "stipendMin" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "SkillRequirement" ADD COLUMN     "mandatory" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "StudentProfile" ADD COLUMN     "availableFrom" TIMESTAMP(3),
ADD COLUMN     "availableTo" TIMESTAMP(3),
ADD COLUMN     "currentProgram" TEXT,
ADD COLUMN     "currentYear" INTEGER,
ADD COLUMN     "languages" TEXT[],
ADD COLUMN     "maxCommuteCities" TEXT[],
ADD COLUMN     "paidOnly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "preferredCities" TEXT[],
ADD COLUMN     "preferredDomains" TEXT[],
ADD COLUMN     "preferredOfferTypes" "OfferType"[],
ADD COLUMN     "preferredWorkMode" "WorkMode",
ADD COLUMN     "schoolId" INTEGER;

-- CreateTable
CREATE TABLE "School" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "type" TEXT,
    "website" TEXT,

    CONSTRAINT "School_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferView" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "durationMs" INTEGER,
    "source" TEXT,

    CONSTRAINT "OfferView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferBookmark" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removedAt" TIMESTAMP(3),

    CONSTRAINT "OfferBookmark_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OfferImpression" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "shownAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "position" INTEGER,

    CONSTRAINT "OfferImpression_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProfileView" (
    "id" TEXT NOT NULL,
    "recruiterUserId" TEXT NOT NULL,
    "studentProfileId" TEXT NOT NULL,
    "offerId" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProfileView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchQuery" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "filters" JSONB,
    "resultsCount" INTEGER,
    "searchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecommendationScore" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "contentScore" DOUBLE PRECISION NOT NULL,
    "semanticScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cfScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "breakdown" JSONB,
    "modelVersion" TEXT NOT NULL DEFAULT 'v0',
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecommendationScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "School_name_key" ON "School"("name");

-- CreateIndex
CREATE INDEX "OfferView_studentId_idx" ON "OfferView"("studentId");

-- CreateIndex
CREATE INDEX "OfferView_offerId_idx" ON "OfferView"("offerId");

-- CreateIndex
CREATE INDEX "OfferView_viewedAt_idx" ON "OfferView"("viewedAt");

-- CreateIndex
CREATE INDEX "OfferBookmark_studentId_idx" ON "OfferBookmark"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "OfferBookmark_studentId_offerId_key" ON "OfferBookmark"("studentId", "offerId");

-- CreateIndex
CREATE INDEX "OfferImpression_studentId_shownAt_idx" ON "OfferImpression"("studentId", "shownAt");

-- CreateIndex
CREATE INDEX "OfferImpression_offerId_idx" ON "OfferImpression"("offerId");

-- CreateIndex
CREATE INDEX "ProfileView_recruiterUserId_idx" ON "ProfileView"("recruiterUserId");

-- CreateIndex
CREATE INDEX "ProfileView_studentProfileId_idx" ON "ProfileView"("studentProfileId");

-- CreateIndex
CREATE INDEX "SearchQuery_studentId_idx" ON "SearchQuery"("studentId");

-- CreateIndex
CREATE INDEX "SearchQuery_searchedAt_idx" ON "SearchQuery"("searchedAt");

-- CreateIndex
CREATE INDEX "RecommendationScore_studentId_finalScore_idx" ON "RecommendationScore"("studentId", "finalScore" DESC);

-- CreateIndex
CREATE INDEX "RecommendationScore_offerId_finalScore_idx" ON "RecommendationScore"("offerId", "finalScore" DESC);

-- CreateIndex
CREATE INDEX "RecommendationScore_computedAt_idx" ON "RecommendationScore"("computedAt");

-- CreateIndex
CREATE UNIQUE INDEX "RecommendationScore_studentId_offerId_key" ON "RecommendationScore"("studentId", "offerId");

-- AddForeignKey
ALTER TABLE "StudentProfile" ADD CONSTRAINT "StudentProfile_schoolId_fkey" FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferView" ADD CONSTRAINT "OfferView_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferView" ADD CONSTRAINT "OfferView_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferBookmark" ADD CONSTRAINT "OfferBookmark_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferBookmark" ADD CONSTRAINT "OfferBookmark_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferImpression" ADD CONSTRAINT "OfferImpression_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfferImpression" ADD CONSTRAINT "OfferImpression_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileView" ADD CONSTRAINT "ProfileView_recruiterUserId_fkey" FOREIGN KEY ("recruiterUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileView" ADD CONSTRAINT "ProfileView_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProfileView" ADD CONSTRAINT "ProfileView_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SearchQuery" ADD CONSTRAINT "SearchQuery_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationScore" ADD CONSTRAINT "RecommendationScore_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecommendationScore" ADD CONSTRAINT "RecommendationScore_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
