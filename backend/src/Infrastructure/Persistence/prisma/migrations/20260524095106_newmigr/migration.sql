-- CreateTable
CREATE TABLE "PublicSessionProfile" (
    "id" TEXT NOT NULL,
    "sessionKey" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "email" TEXT,
    "location" TEXT,
    "birthDate" TIMESTAMP(3),
    "targetedRole" TEXT,
    "organization" TEXT,
    "skills" TEXT[],
    "education" TEXT[],
    "experiences" TEXT[],
    "achievements" TEXT[],
    "githubUrl" TEXT,
    "linkedinUrl" TEXT,
    "twitterUrl" TEXT,
    "avatarUrl" TEXT,
    "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
    "isDeactivated" BOOLEAN NOT NULL DEFAULT false,
    "deactivatedAt" TIMESTAMP(3),
    "subscription" TEXT NOT NULL DEFAULT 'Starter',
    "subscriptionEndDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicSessionProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicCvQuestionSession" (
    "id" TEXT NOT NULL,
    "sessionKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "questionsJson" JSONB NOT NULL,
    "metadata" JSONB NOT NULL,
    "cvText" TEXT NOT NULL,
    "jobsText" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicCvQuestionSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicCv" (
    "id" TEXT NOT NULL,
    "sessionKey" TEXT NOT NULL,
    "questionSessionId" TEXT,
    "pdfData" BYTEA NOT NULL,
    "originalScore" DOUBLE PRECISION NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "jobsSummary" TEXT NOT NULL,
    "reviewImprovements" TEXT[],
    "anonymizedCvText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicCv_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicCareerGuide" (
    "id" TEXT NOT NULL,
    "sessionKey" TEXT NOT NULL,
    "currentStrengths" TEXT[],
    "readinessScore" INTEGER NOT NULL,
    "skillsToLearn" TEXT[],
    "projectsToWorkOn" TEXT[],
    "softSkillsToDevelop" TEXT[],
    "careerRoadmap" TEXT[],
    "domain" TEXT NOT NULL,
    "currentJob" TEXT NOT NULL,
    "targetJob" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicCareerGuide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicPortfolioGeneration" (
    "id" TEXT NOT NULL,
    "sessionKey" TEXT NOT NULL,
    "wireframe" TEXT NOT NULL,
    "theme" TEXT NOT NULL,
    "html" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicPortfolioGeneration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PublicInterview" (
    "id" TEXT NOT NULL,
    "sessionKey" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "personaKey" TEXT NOT NULL,
    "interviewerName" TEXT NOT NULL,
    "interviewerRole" TEXT NOT NULL,
    "interviewStyle" TEXT NOT NULL,
    "difficultyLevel" TEXT NOT NULL,
    "company" TEXT,
    "jobTitle" TEXT,
    "jobDescription" TEXT,
    "recruiterMode" TEXT NOT NULL DEFAULT 'TECHNICAL',
    "totalExchanges" INTEGER NOT NULL DEFAULT 0,
    "overallScore" INTEGER NOT NULL DEFAULT 0,
    "technicalCompetency" INTEGER NOT NULL DEFAULT 0,
    "communicationSkills" INTEGER NOT NULL DEFAULT 0,
    "problemSolving" INTEGER NOT NULL DEFAULT 0,
    "culturalFit" INTEGER NOT NULL DEFAULT 0,
    "acceptanceProbability" INTEGER NOT NULL DEFAULT 0,
    "keyStrengths" TEXT[],
    "areasForImprovement" TEXT[],
    "recommendations" TEXT[],
    "nextSteps" TEXT[],
    "summary" TEXT NOT NULL DEFAULT '',
    "transcript" JSONB,
    "data" JSONB,
    "pdfData" BYTEA,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PublicInterview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PublicSessionProfile_sessionKey_key" ON "PublicSessionProfile"("sessionKey");

-- CreateIndex
CREATE INDEX "PublicCvQuestionSession_sessionKey_idx" ON "PublicCvQuestionSession"("sessionKey");

-- CreateIndex
CREATE INDEX "PublicCvQuestionSession_createdAt_idx" ON "PublicCvQuestionSession"("createdAt");

-- CreateIndex
CREATE INDEX "PublicCv_sessionKey_idx" ON "PublicCv"("sessionKey");

-- CreateIndex
CREATE INDEX "PublicCv_createdAt_idx" ON "PublicCv"("createdAt");

-- CreateIndex
CREATE INDEX "PublicCareerGuide_sessionKey_idx" ON "PublicCareerGuide"("sessionKey");

-- CreateIndex
CREATE INDEX "PublicCareerGuide_createdAt_idx" ON "PublicCareerGuide"("createdAt");

-- CreateIndex
CREATE INDEX "PublicPortfolioGeneration_sessionKey_idx" ON "PublicPortfolioGeneration"("sessionKey");

-- CreateIndex
CREATE INDEX "PublicPortfolioGeneration_createdAt_idx" ON "PublicPortfolioGeneration"("createdAt");

-- CreateIndex
CREATE INDEX "PublicInterview_sessionKey_idx" ON "PublicInterview"("sessionKey");

-- CreateIndex
CREATE INDEX "PublicInterview_createdAt_idx" ON "PublicInterview"("createdAt");
