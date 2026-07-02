import type { ContractEventType, ContractStatus } from "./contract-status";
import type { ContractPayload } from "./contract-payload.schema";

export type ApiError = {
  message: string;
  code?: string;
  fieldErrors?: Record<string, string[]>;
};

export type ApiResponse<T> = {
  data: T;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

export type OrganisationSummary = {
  id: string;
  name: string;
  slug: string;
};

export type ContractSummary = {
  id: string;
  organisationId: string;
  contractNumber: string;
  status: ContractStatus;
  clientName: string;
  poRefNo: string;
  poDate: string;
  updatedAt: string;
};

export type ContractDetail = ContractSummary & {
  fieldData: ContractPayload;
  createdAt: string;
};

export type ContractEvent = {
  id: string;
  contractId: string;
  eventType: ContractEventType;
  previousStatus: ContractStatus | null;
  nextStatus: ContractStatus | null;
  summary: string;
  createdAt: string;
};

export type ContractStatusChangedEvent = {
  type: "CONTRACT_STATUS_CHANGED";
  organisationId: string;
  contractId: string;
  contractNumber: string;
  status: ContractStatus;
  updatedAt: string;
};
