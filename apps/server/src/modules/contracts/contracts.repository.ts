import { prisma, type Prisma } from "@contract-console/database";
import type { ContractPayload } from "@contract-console/shared";

type DbClient = typeof prisma | Prisma.TransactionClient;

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
    const contractSearch: Prisma.ContractWhereInput[] = [
      {
        contractNumber: {
          contains: input.query.contractId,
          mode: "insensitive"
        }
      }
    ];

    if (isUuid(input.query.contractId)) {
      contractSearch.unshift({
        id: input.query.contractId
      });
    }

    where.OR = contractSearch;
  }

  return where;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}

function toContractSummary(contract: {
  id: string;
  organisationId: string;
  contractNumber: string;
  status: string;
  clientName: string;
  poRefNo: string;
  poDate: Date;
  updatedAt: Date;
}) {
  return {
    ...contract,
    poDate: contract.poDate.toISOString().slice(0, 10),
    updatedAt: contract.updatedAt.toISOString()
  };
}

function toContractDetail(contract: {
  id: string;
  organisationId: string;
  contractNumber: string;
  status: string;
  clientName: string;
  poRefNo: string;
  poDate: Date;
  fieldData: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    ...contract,
    poDate: contract.poDate.toISOString().slice(0, 10),
    createdAt: contract.createdAt.toISOString(),
    updatedAt: contract.updatedAt.toISOString()
  };
}

function buildContractLookup(organisationId: string, contractId: string): Prisma.ContractWhereInput {
  const lookup: Prisma.ContractWhereInput = {
    organisationId,
    deletedAt: null,
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

export const contractsRepository = {
  organisationExists(organisationId: string, db: DbClient = prisma) {
    return db.organisation.findFirst({
      where: {
        id: organisationId
      },
      select: {
        id: true
      }
    });
  },

  async getNextContractNumber(organisationId: string, db: DbClient = prisma) {
    const count = await db.contract.count({
      where: {
        organisationId
      }
    });

    return `CON-${String(count + 1).padStart(4, "0")}`;
  },

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
      data: contracts.map(toContractSummary),
      pagination: {
        page: input.pagination.page,
        pageSize: input.pagination.pageSize,
        total,
        totalPages: Math.ceil(total / input.pagination.pageSize)
      }
    };
  },

  async countByStatus(organisationId: string) {
    const counts = await prisma.contract.groupBy({
      by: ["status"],
      where: {
        organisationId,
        deletedAt: null
      },
      _count: {
        status: true
      }
    });

    return counts.reduce(
      (stats, row) => {
        const count = row._count.status;
        stats.total += count;

        if (row.status === "DRAFT") {
          stats.draft = count;
        }

        if (row.status === "FINALIZED") {
          stats.finalized = count;
        }

        if (row.status === "ARCHIVED") {
          stats.archived = count;
        }

        return stats;
      },
      {
        total: 0,
        draft: 0,
        finalized: 0,
        archived: 0
      }
    );
  },

  async findById(organisationId: string, contractId: string) {
    const contract = await prisma.contract.findFirst({
      where: buildContractLookup(organisationId, contractId)
    });

    if (!contract) {
      return null;
    }

    return toContractDetail(contract);
  },

  findRawById(organisationId: string, contractId: string, db: DbClient = prisma) {
    return db.contract.findFirst({
      where: buildContractLookup(organisationId, contractId)
    });
  },

  async createContract(
    organisationId: string,
    contractNumber: string,
    payload: ContractPayload,
    db: DbClient = prisma
  ) {
    const contract = await db.contract.create({
      data: {
        organisationId,
        contractNumber,
        clientName: payload.client_name,
        poRefNo: payload.po_ref_no,
        poDate: new Date(`${payload.po_date}T00:00:00.000Z`),
        fieldData: payload
      }
    });

    return toContractDetail(contract);
  },

  async updatePayload(contractId: string, payload: ContractPayload, db: DbClient = prisma) {
    const contract = await db.contract.update({
      where: {
        id: contractId
      },
      data: {
        clientName: payload.client_name,
        poRefNo: payload.po_ref_no,
        poDate: new Date(`${payload.po_date}T00:00:00.000Z`),
        fieldData: payload
      }
    });

    return toContractDetail(contract);
  },

  async updateStatus(contractId: string, status: "FINALIZED" | "ARCHIVED", db: DbClient = prisma) {
    const contract = await db.contract.update({
      where: {
        id: contractId
      },
      data: {
        status
      }
    });

    return toContractDetail(contract);
  },

  softDelete(contractId: string, db: DbClient = prisma) {
    return db.contract.update({
      where: {
        id: contractId
      },
      data: {
        deletedAt: new Date()
      }
    });
  }
};
