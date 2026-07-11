import type {
  ApiResponse,
  ContractDetail,
  ContractEvent,
  ContractPayload,
  ContractStats,
  ContractStatus,
  ContractSummary,
  OrganisationMember,
  OrganisationProfile,
  OrganisationSummary,
  PaginatedResponse
} from "@contract-console/shared";
import { apiClient } from "./client";

export type ContractListParams = {
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

export function listOrganisations() {
  return apiClient<ApiResponse<OrganisationSummary[]>>("/organisations");
}

export function getOrganisation(organisationId: string) {
  return apiClient<ApiResponse<OrganisationProfile>>(`/organisations/${organisationId}`);
}

export function listOrganisationMembers(organisationId: string) {
  return apiClient<ApiResponse<OrganisationMember[]>>(
    `/organisations/${organisationId}/members`
  );
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
