import { ContractStatus, prisma, type Prisma } from "@contract-console/database";
import type { ContractPayload } from "@contract-console/shared";
import type { DatabaseClient } from "../../common/types/database";
import { isUuid } from "../../common/utils/uuid";
import { mapContractDetail, mapContractSummary } from "./mapper";
import type {
  ContractListFilters,
  ListContractsRepositoryInput
} from "./types";

function buildContractListFilter(
  organisationId: string,
  filters: ContractListFilters
): Prisma.ContractWhereInput {
  const where: Prisma.ContractWhereInput = {
    organisationId,
    deletedAt: null
  };

  if (filters.status) {
    where.status = filters.status as Prisma.EnumContractStatusFilter["equals"];
  }

  if (filters.clientName) {
    where.clientName = {
      contains: filters.clientName,
      mode: "insensitive"
    };
  }

  if (filters.contractId) {
    const contractSearch: Prisma.ContractWhereInput[] = [
      {
        contractNumber: {
          contains: filters.contractId,
          mode: "insensitive"
        }
      }
    ];

    if (isUuid(filters.contractId)) {
      contractSearch.unshift({ id: filters.contractId });
    }

    where.OR = contractSearch;
  }

  return where;
}

function buildContractReferenceFilter(
  organisationId: string,
  contractReference: string
): Prisma.ContractWhereInput {
  const referenceFilter: Prisma.ContractWhereInput = {
    organisationId,
    deletedAt: null,
    OR: [{ contractNumber: contractReference }]
  };

  if (isUuid(contractReference)) {
    referenceFilter.OR?.unshift({ id: contractReference });
  }

  return referenceFilter;
}

export const contractRepository = {
  async getNextNumber(organisationId: string, database: DatabaseClient = prisma) {
    const contractCount = await database.contract.count({
      where: { organisationId }
    });

    return `CON-${String(contractCount + 1).padStart(4, "0")}`;
  },

  async listByOrganisation(input: ListContractsRepositoryInput) {
    const where = buildContractListFilter(input.organisationId, input.filters);

    const [contracts, total] = await prisma.$transaction([
      prisma.contract.findMany({
        where,
        orderBy: { updatedAt: "desc" },
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
      data: contracts.map(mapContractSummary),
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
      _count: { status: true }
    });

    return counts.reduce(
      (statistics, row) => {
        const count = row._count.status;
        statistics.total += count;

        if (row.status === ContractStatus.DRAFT) {
          statistics.draft = count;
        }

        if (row.status === ContractStatus.FINALIZED) {
          statistics.finalized = count;
        }

        if (row.status === ContractStatus.ARCHIVED) {
          statistics.archived = count;
        }

        return statistics;
      },
      { total: 0, draft: 0, finalized: 0, archived: 0 }
    );
  },

  async findDetailByReference(organisationId: string, contractReference: string) {
    const contract = await prisma.contract.findFirst({
      where: buildContractReferenceFilter(organisationId, contractReference)
    });

    return contract ? mapContractDetail(contract) : null;
  },

  findRecordByReference(
    organisationId: string,
    contractReference: string,
    database: DatabaseClient = prisma
  ) {
    return database.contract.findFirst({
      where: buildContractReferenceFilter(organisationId, contractReference)
    });
  },

  async create(
    organisationId: string,
    contractNumber: string,
    payload: ContractPayload,
    database: DatabaseClient = prisma
  ) {
    const contract = await database.contract.create({
      data: {
        organisationId,
        contractNumber,
        clientName: payload.client_name,
        poRefNo: payload.po_ref_no,
        poDate: new Date(`${payload.po_date}T00:00:00.000Z`),
        fieldData: payload
      }
    });

    return mapContractDetail(contract);
  },

  async updatePayload(
    contractId: string,
    payload: ContractPayload,
    database: DatabaseClient = prisma
  ) {
    const contract = await database.contract.update({
      where: { id: contractId },
      data: {
        clientName: payload.client_name,
        poRefNo: payload.po_ref_no,
        poDate: new Date(`${payload.po_date}T00:00:00.000Z`),
        fieldData: payload
      }
    });

    return mapContractDetail(contract);
  },

  async updateStatus(
    contractId: string,
    status: ContractStatus,
    database: DatabaseClient = prisma
  ) {
    const contract = await database.contract.update({
      where: { id: contractId },
      data: { status }
    });

    return mapContractDetail(contract);
  },

  softDelete(contractId: string, database: DatabaseClient = prisma) {
    return database.contract.update({
      where: { id: contractId },
      data: { deletedAt: new Date() }
    });
  }
};
