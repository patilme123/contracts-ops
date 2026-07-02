import { prisma } from "../../database/prisma";

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
