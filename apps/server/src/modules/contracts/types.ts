import type { ContractStatus } from "@contract-console/shared";
import type { Pagination } from "../../common/utils/pagination";

export type ContractListQuery = {
  status?: ContractStatus;
  clientName?: string;
  contractId?: string;
  page?: number;
  pageSize?: number;
};

export type ContractListFilters = Pick<
  ContractListQuery,
  "status" | "clientName" | "contractId"
>;

export type ListContractsRepositoryInput = {
  organisationId: string;
  filters: ContractListFilters;
  pagination: Pagination;
};
