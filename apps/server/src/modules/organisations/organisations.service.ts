import { prisma } from "@contract-console/database";

export const organisationsService = {
  listOrganisations() {
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
  }
};
