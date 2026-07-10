import type {
  ApiResponse,
  ContractDetail,
  ContractEvent,
  ContractPayload,
  ContractStats,
  ContractStatus,
  ContractSummary,
  OrganisationSummary,
  PaginatedResponse
} from "@contract-console/shared";
import { apiClient } from "./client";

export type ContractListParams = {
  status?: ContractStatus;
  clientName?: string;
  contractId?: string;
  page?: number;
  pageSize?: number;
};

export function listOrganisations() {
  return apiClient<ApiResponse<OrganisationSummary[]>>("/organisations");
}

export function listContracts(organisationId: string, params: ContractListParams) {
  return apiClient<PaginatedResponse<ContractSummary>>(
    `/organisations/${organisationId}/contracts`,
    {
      query: params
    }
  );
}

export function getContractStats(organisationId: string) {
  return apiClient<ApiResponse<ContractStats>>(`/organisations/${organisationId}/contracts/stats`);
}

export function createContract(organisationId: string, payload: ContractPayload) {
  return apiClient<ApiResponse<ContractDetail>>(`/organisations/${organisationId}/contracts`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getContract(organisationId: string, contractId: string) {
  return apiClient<ApiResponse<ContractDetail>>(
    `/organisations/${organisationId}/contracts/${contractId}`
  );
}

export function updateContract(
  organisationId: string,
  contractId: string,
  payload: ContractPayload
) {
  return apiClient<ApiResponse<ContractDetail>>(
    `/organisations/${organisationId}/contracts/${contractId}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload)
    }
  );
}

export function finalizeContract(organisationId: string, contractId: string) {
  return apiClient<ApiResponse<ContractDetail>>(
    `/organisations/${organisationId}/contracts/${contractId}/finalize`,
    {
      method: "POST"
    }
  );
}

export function archiveContract(organisationId: string, contractId: string) {
  return apiClient<ApiResponse<ContractDetail>>(
    `/organisations/${organisationId}/contracts/${contractId}/archive`,
    {
      method: "POST"
    }
  );
}

export function deleteContract(organisationId: string, contractId: string) {
  return apiClient<void>(`/organisations/${organisationId}/contracts/${contractId}`, {
    method: "DELETE"
  });
}

export function listContractEvents(organisationId: string, contractId: string) {
  return apiClient<ApiResponse<ContractEvent[]>>(
    `/organisations/${organisationId}/contracts/${contractId}/events`
  );
}
