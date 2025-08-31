-- CreateEnum
CREATE TYPE "public"."Source" AS ENUM ('facebook', 'tiktok');

-- CreateEnum
CREATE TYPE "public"."FunnelStage" AS ENUM ('top', 'bottom');

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "source" "public"."Source" NOT NULL,
    "funnelStage" "public"."FunnelStage" NOT NULL,
    "eventType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "source" "public"."Source" NOT NULL,
    "sourceUserId" TEXT NOT NULL,
    "name" TEXT,
    "age" INTEGER,
    "gender" TEXT,
    "country" TEXT,
    "city" TEXT,
    "followers" INTEGER,
    "extra" JSONB NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Engagement" (
    "id" TEXT NOT NULL,
    "engagementType" TEXT NOT NULL,
    "adId" TEXT,
    "campaignId" TEXT,
    "videoId" TEXT,
    "purchaseAmount" DECIMAL(65,30),
    "details" JSONB NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "Engagement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Event_eventId_key" ON "public"."Event"("eventId");

-- CreateIndex
CREATE INDEX "Event_timestamp_source_funnelStage_eventType_idx" ON "public"."Event"("timestamp", "source", "funnelStage", "eventType");

-- CreateIndex
CREATE INDEX "Event_userId_timestamp_idx" ON "public"."Event"("userId", "timestamp");

-- CreateIndex
CREATE INDEX "User_country_idx" ON "public"."User"("country");

-- CreateIndex
CREATE INDEX "User_followers_idx" ON "public"."User"("followers");

-- CreateIndex
CREATE UNIQUE INDEX "User_source_sourceUserId_key" ON "public"."User"("source", "sourceUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Engagement_eventId_key" ON "public"."Engagement"("eventId");

-- CreateIndex
CREATE INDEX "Engagement_campaignId_idx" ON "public"."Engagement"("campaignId");

-- CreateIndex
CREATE INDEX "Engagement_adId_idx" ON "public"."Engagement"("adId");

-- CreateIndex
CREATE INDEX "Engagement_videoId_idx" ON "public"."Engagement"("videoId");

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Engagement" ADD CONSTRAINT "Engagement_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
