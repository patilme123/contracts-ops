import type { ContractPayload, ContractStatus } from "@contract-console/shared";

export type ContractListFilters = {
  status?: ContractStatus;
  clientName?: string;
  contractId?: string;
  page?: number;
  pageSize?: number;
};

export type CreateContractInput = {
  organisationId: string;
  payload: ContractPayload;
};
