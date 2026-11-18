-- CreateEnum
CREATE TYPE "SiteColour" AS ENUM ('GREEN', 'YELLOW', 'RED', 'GREY');

-- CreateEnum
CREATE TYPE "SignLevel" AS ENUM ('RED', 'YELLOW');

-- CreateTable
CREATE TABLE "Site" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "chain" INTEGER NOT NULL,
    "name" TEXT,
    "category" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "colour" "SiteColour" NOT NULL DEFAULT 'GREY',
    "lastChecked" TIMESTAMP(3),
    "lastChanged" TIMESTAMP(3),
    "overrideNote" TEXT,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "File" (
    "id" SERIAL NOT NULL,
    "siteId" INTEGER NOT NULL,
    "path" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "File_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sign" (
    "id" SERIAL NOT NULL,
    "siteId" INTEGER NOT NULL,
    "fileId" INTEGER NOT NULL,
    "checkId" TEXT NOT NULL,
    "level" "SignLevel" NOT NULL,
    "shortEvidence" TEXT NOT NULL,

    CONSTRAINT "Sign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scan" (
    "id" SERIAL NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "sitesChecked" INTEGER NOT NULL DEFAULT 0,
    "sitesChanged" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,

    CONSTRAINT "Scan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MistakeReport" (
    "id" SERIAL NOT NULL,
    "siteId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "contact" TEXT,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "MistakeReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Site_chain_idx" ON "Site"("chain");

-- CreateIndex
CREATE INDEX "Site_colour_idx" ON "Site"("colour");

-- CreateIndex
CREATE UNIQUE INDEX "Site_chain_address_key" ON "Site"("chain", "address");

-- CreateIndex
CREATE INDEX "File_fingerprint_idx" ON "File"("fingerprint");

-- CreateIndex
CREATE UNIQUE INDEX "File_siteId_path_key" ON "File"("siteId", "path");

-- CreateIndex
CREATE INDEX "Sign_siteId_level_idx" ON "Sign"("siteId", "level");

-- CreateIndex
CREATE INDEX "Scan_startedAt_idx" ON "Scan"("startedAt");

-- CreateIndex
CREATE INDEX "MistakeReport_status_date_idx" ON "MistakeReport"("status", "date");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sign" ADD CONSTRAINT "Sign_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Sign" ADD CONSTRAINT "Sign_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "File"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MistakeReport" ADD CONSTRAINT "MistakeReport_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE CASCADE ON UPDATE CASCADE;
