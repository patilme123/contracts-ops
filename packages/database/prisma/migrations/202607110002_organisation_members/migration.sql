-- CreateEnum
CREATE TYPE "OrganisationMemberRole" AS ENUM ('ADMIN', 'OPERATIONS_LEAD', 'PROCUREMENT_MANAGER', 'FINANCE_REVIEWER', 'CONTRACT_SPECIALIST');

-- AlterTable
ALTER TABLE "organisations"
  ADD COLUMN "description" TEXT,
  ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata';

-- CreateTable
CREATE TABLE "organisation_members" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "organisation_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" "OrganisationMemberRole" NOT NULL,
  "title" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "organisation_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organisation_members_organisation_id_email_key" ON "organisation_members"("organisation_id", "email");
CREATE INDEX "organisation_members_organisation_id_role_idx" ON "organisation_members"("organisation_id", "role");

-- AddForeignKey
ALTER TABLE "organisation_members" ADD CONSTRAINT "organisation_members_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
