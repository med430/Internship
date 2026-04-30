-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "RecruiterMode" AS ENUM ('EMPATHIC', 'TECHNICAL', 'DIRECT');

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "offerId" TEXT,
    "company" TEXT,
    "jobTitle" TEXT,
    "jobDescription" TEXT,
    "recruiterMode" "RecruiterMode" NOT NULL DEFAULT 'EMPATHIC',
    "status" "InterviewStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "feedback" TEXT NOT NULL DEFAULT '',
    "summary" TEXT,
    "data" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Interview_studentId_idx" ON "Interview"("studentId");

-- CreateIndex
CREATE INDEX "Interview_offerId_idx" ON "Interview"("offerId");

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
