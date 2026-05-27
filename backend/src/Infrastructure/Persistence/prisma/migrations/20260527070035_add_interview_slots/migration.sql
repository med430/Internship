-- CreateEnum
CREATE TYPE "InterviewSlotStatus" AS ENUM ('PROPOSED', 'ACCEPTED', 'DECLINED', 'CONFIRMED');

-- CreateTable
CREATE TABLE "InterviewSlot" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "proposedByUserId" TEXT NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "status" "InterviewSlotStatus" NOT NULL DEFAULT 'PROPOSED',
    "notes" TEXT,
    "parentSlotId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewSlot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InterviewSlot_applicationId_idx" ON "InterviewSlot"("applicationId");

-- CreateIndex
CREATE INDEX "InterviewSlot_proposedByUserId_idx" ON "InterviewSlot"("proposedByUserId");

-- AddForeignKey
ALTER TABLE "InterviewSlot" ADD CONSTRAINT "InterviewSlot_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "Application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewSlot" ADD CONSTRAINT "InterviewSlot_parentSlotId_fkey" FOREIGN KEY ("parentSlotId") REFERENCES "InterviewSlot"("id") ON DELETE SET NULL ON UPDATE CASCADE;
