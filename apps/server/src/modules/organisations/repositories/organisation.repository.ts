import { prisma } from "@contract-console/database";
import type { DatabaseClient } from "../../../common/types/database-client.type";

export const organisationRepository = {
  findAll() {
    return prisma.organisation.findMany({
      orderBy: {
        name: "asc"
      },
      select: {
        id: true,
        name: true,
        slug: true
      }
    });
  },

  findById(organisationId: string, database: DatabaseClient = prisma) {
    return database.organisation.findUnique({
      where: {
        id: organisationId
      },
      select: {
        id: true
      }
    });
  }
};
