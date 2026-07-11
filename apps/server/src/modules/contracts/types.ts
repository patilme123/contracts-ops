import type { ContractStatus } from "@contract-console/shared";
import type { Pagination } from "../../common/utils/pagination";

export type ContractListQuery = {
  status?: ContractStatus;
  search?: string;
  clientName?: string;
  contractId?: string;
  poDateFrom?: string;
  poDateTo?: string;
  sortBy?: "updatedAt" | "poDate" | "clientName" | "contractNumber";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
};

export type ContractListFilters = Pick<
  ContractListQuery,
  "status" | "search" | "clientName" | "contractId" | "poDateFrom" | "poDateTo"
>;

export type ListContractsRepositoryInput = {
  organisationId: string;
  filters: ContractListFilters;
  sortBy?: NonNullable<ContractListQuery["sortBy"]>;
  sortOrder?: NonNullable<ContractListQuery["sortOrder"]>;
  pagination: Pagination;
};
