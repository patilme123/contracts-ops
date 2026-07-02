import { prisma, type Prisma } from "@contract-console/database";

type ListContractsInput = {
  organisationId: string;
  query: Record<string, unknown>;
  pagination: {
    page: number;
    pageSize: number;
    skip: number;
    take: number;
  };
};

function buildContractWhere(input: ListContractsInput): Prisma.ContractWhereInput {
  const where: Prisma.ContractWhereInput = {
    organisationId: input.organisationId,
    deletedAt: null
  };

  if (typeof input.query.status === "string" && input.query.status.length > 0) {
    where.status = input.query.status as Prisma.EnumContractStatusFilter["equals"];
  }

  if (typeof input.query.clientName === "string" && input.query.clientName.length > 0) {
    where.clientName = {
      contains: input.query.clientName,
      mode: "insensitive"
    };
  }

  if (typeof input.query.contractId === "string" && input.query.contractId.length > 0) {
    where.OR = [
      {
        id: input.query.contractId
      },
      {
        contractNumber: {
          contains: input.query.contractId,
          mode: "insensitive"
        }
      }
    ];
  }

  return where;
}

export const contractsRepository = {
  async listByOrganisation(input: ListContractsInput) {
    const where = buildContractWhere(input);

    const [contracts, total] = await prisma.$transaction([
      prisma.contract.findMany({
        where,
        orderBy: {
          updatedAt: "desc"
        },
        skip: input.pagination.skip,
        take: input.pagination.take,
        select: {
          id: true,
          organisationId: true,
          contractNumber: true,
          status: true,
          clientName: true,
          poRefNo: true,
          poDate: true,
          updatedAt: true
        }
      }),
      prisma.contract.count({ where })
    ]);

    return {
      data: contracts.map((contract) => ({
        ...contract,
        poDate: contract.poDate.toISOString().slice(0, 10),
        updatedAt: contract.updatedAt.toISOString()
      })),
      pagination: {
        page: input.pagination.page,
        pageSize: input.pagination.pageSize,
        total,
        totalPages: Math.ceil(total / input.pagination.pageSize)
      }
    };
  },

  async findById(organisationId: string, contractId: string) {
    const contract = await prisma.contract.findFirst({
      where: {
        organisationId,
        deletedAt: null,
        OR: [
          {
            id: contractId
          },
          {
            contractNumber: contractId
          }
        ]
      }
    });

    if (!contract) {
      return null;
    }

    return {
      ...contract,
      poDate: contract.poDate.toISOString().slice(0, 10),
      createdAt: contract.createdAt.toISOString(),
      updatedAt: contract.updatedAt.toISOString()
    };
  }
};
