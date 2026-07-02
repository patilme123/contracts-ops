import { prisma } from "../../database/prisma";

export const contractEventsRepository = {
  listForContract(organisationId: string, contractId: string) {
    return prisma.contractEvent.findMany({
      where: {
        organisationId,
        contract: {
          OR: [
            {
              id: contractId
            },
            {
              contractNumber: contractId
            }
          ]
        }
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
