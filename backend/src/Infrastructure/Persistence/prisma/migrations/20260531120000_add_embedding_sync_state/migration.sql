-- CreateTable
CREATE TABLE "EmbeddingSyncState" (
    "collection" TEXT NOT NULL,
    "lastSyncedAt" TIMESTAMP(3) NOT NULL,
    "lastRunAt" TIMESTAMP(3),

    CONSTRAINT "EmbeddingSyncState_pkey" PRIMARY KEY ("collection")
);
