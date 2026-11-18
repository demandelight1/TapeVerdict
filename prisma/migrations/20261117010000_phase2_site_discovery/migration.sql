ALTER TABLE "Site"
ADD COLUMN "containerAddress" TEXT;

CREATE UNIQUE INDEX "Site_chain_containerAddress_key"
ON "Site"("chain", "containerAddress");

ALTER TABLE "Scan"
ADD COLUMN "sitesFound" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "sitesAdded" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "sitesUpdated" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'COMPLETE';
