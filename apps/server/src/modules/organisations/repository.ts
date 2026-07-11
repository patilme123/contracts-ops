import { prisma } from "@contract-console/database";
import type { DatabaseClient } from "../../common/types/database";

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
  },

  findProfileById(organisationId: string) {
    return prisma.organisation.findUnique({
      where: {
        id: organisationId
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        timezone: true,
        createdAt: true,
        _count: {
          select: {
            members: true
          }
        }
      }
    });
  },

  findMembersByOrganisation(organisationId: string) {
    return prisma.organisationMember.findMany({
      where: {
        organisationId
      },
      orderBy: [
        {
          role: "asc"
        },
        {
          name: "asc"
        }
      ],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        title: true
      }
    });
  }
};
