import { prisma, type Prisma } from "@contract-console/database";

type DbClient = typeof prisma | Prisma.TransactionClient;

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function buildContractEventLookup(contractId: string): Prisma.ContractWhereInput {
  const lookup: Prisma.ContractWhereInput = {
    OR: [
      {
        contractNumber: contractId
      }
    ]
  };

  if (isUuid(contractId)) {
    lookup.OR?.unshift({
      id: contractId
    });
  }

  return lookup;
}

export const contractEventsRepository = {
  create(data: Prisma.ContractEventUncheckedCreateInput, db: DbClient = prisma) {
    return db.contractEvent.create({
      data
    });
  },

  listForContract(organisationId: string, contractId: string) {
    return prisma.contractEvent.findMany({
      where: {
        organisationId,
        contract: buildContractEventLookup(contractId)
      },
      orderBy: {
        createdAt: "desc"
      },
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
