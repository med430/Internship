/*
  Warnings:

  - You are about to drop the column `studentId` on the `SkillAssignment` table. All the data in the column will be lost.
  - Added the required column `company` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `domain` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Offer` table without a default value. This is not possible if the table is not empty.
  - Made the column `level` on table `SkillAssignment` required. This step will fail if there are existing NULL values in that column.
  - Made the column `offerId` on table `SkillAssignment` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Offer" DROP CONSTRAINT "Offer_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "SkillAssignment" DROP CONSTRAINT "SkillAssignment_offerId_fkey";

-- DropForeignKey
ALTER TABLE "SkillAssignment" DROP CONSTRAINT "SkillAssignment_studentId_fkey";

-- AlterTable
ALTER TABLE "Offer" ADD COLUMN     "company" TEXT NOT NULL,
ADD COLUMN     "domain" TEXT NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "recruiterProfileId" TEXT,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SkillAssignment" DROP COLUMN "studentId",
ADD COLUMN     "studentProfileId" TEXT,
ALTER COLUMN "level" SET NOT NULL,
ALTER COLUMN "offerId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offer" ADD CONSTRAINT "Offer_recruiterProfileId_fkey" FOREIGN KEY ("recruiterProfileId") REFERENCES "RecruiterProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillAssignment" ADD CONSTRAINT "SkillAssignment_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "Offer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SkillAssignment" ADD CONSTRAINT "SkillAssignment_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "StudentProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
