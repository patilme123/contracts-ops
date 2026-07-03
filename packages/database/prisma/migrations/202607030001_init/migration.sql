-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('DRAFT', 'FINALIZED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ContractEventType" AS ENUM ('CREATED', 'UPDATED', 'FINALIZED', 'ARCHIVED', 'DELETED');

-- CreateTable
CREATE TABLE "organisations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contracts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organisation_id" UUID NOT NULL,
    "contract_number" TEXT NOT NULL,
    "status" "ContractStatus" NOT NULL DEFAULT 'DRAFT',
    "client_name" TEXT NOT NULL,
    "po_ref_no" TEXT NOT NULL,
    "po_date" TIMESTAMP(3) NOT NULL,
    "field_data" JSONB NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contracts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contract_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "organisation_id" UUID NOT NULL,
    "contract_id" UUID NOT NULL,
    "event_type" "ContractEventType" NOT NULL,
    "previous_status" "ContractStatus",
    "next_status" "ContractStatus",
    "summary" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contract_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organisations_slug_key" ON "organisations"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "contracts_organisation_id_contract_number_key" ON "contracts"("organisation_id", "contract_number");

-- CreateIndex
CREATE INDEX "contracts_organisation_id_status_idx" ON "contracts"("organisation_id", "status");

-- CreateIndex
CREATE INDEX "contracts_organisation_id_client_name_idx" ON "contracts"("organisation_id", "client_name");

-- CreateIndex
CREATE INDEX "contracts_organisation_id_id_idx" ON "contracts"("organisation_id", "id");

-- CreateIndex
CREATE INDEX "contracts_organisation_id_po_ref_no_idx" ON "contracts"("organisation_id", "po_ref_no");

-- CreateIndex
CREATE INDEX "contract_events_organisation_id_contract_id_created_at_idx" ON "contract_events"("organisation_id", "contract_id", "created_at");

-- AddForeignKey
ALTER TABLE "contracts" ADD CONSTRAINT "contracts_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_events" ADD CONSTRAINT "contract_events_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_events" ADD CONSTRAINT "contract_events_contract_id_fkey" FOREIGN KEY ("contract_id") REFERENCES "contracts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
