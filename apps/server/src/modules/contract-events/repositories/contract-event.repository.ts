import { prisma, type Prisma } from "@contract-console/database";
import type { DatabaseClient } from "../../../common/types/database-client.type";
import { isUuid } from "../../../common/utils/uuid.util";

function buildContractReferenceFilter(contractReference: string): Prisma.ContractWhereInput {
  const referenceFilter: Prisma.ContractWhereInput = {
    OR: [{ contractNumber: contractReference }]
  };

  if (isUuid(contractReference)) {
    referenceFilter.OR?.unshift({ id: contractReference });
  }

  return referenceFilter;
}

export const contractEventRepository = {
  create(
    event: Prisma.ContractEventUncheckedCreateInput,
    database: DatabaseClient = prisma
  ) {
    return database.contractEvent.create({ data: event });
  },

  findByContract(organisationId: string, contractReference: string) {
    return prisma.contractEvent.findMany({
      where: {
        organisationId,
        contract: buildContractReferenceFilter(contractReference)
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        contractId: true,
        eventType: true,
        previousStatus: true,
        nextStatus: true,
        summary: true,
        createdAt: true
      }
    });
  }
};
