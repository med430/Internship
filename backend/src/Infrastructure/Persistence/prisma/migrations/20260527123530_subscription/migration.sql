-- CreateEnum
CREATE TYPE "SubscriptionType" AS ENUM ('FREE', 'PAID');

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "type" "SubscriptionType" NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_studentId_key" ON "Subscription"("studentId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "StudentProfile"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
