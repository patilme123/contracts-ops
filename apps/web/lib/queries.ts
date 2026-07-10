import type { ContractListParams } from "./api";

export const queryKeys = {
  organisations: ["organisations"] as const,
  contracts: (organisationId: string, params: ContractListParams) =>
    ["contracts", organisationId, params] as const,
  contractStats: (organisationId: string) => ["contract-stats", organisationId] as const,
  contract: (organisationId: string, contractId: string) =>
    ["contract", organisationId, contractId] as const,
  contractEvents: (organisationId: string, contractId: string) =>
    ["contract-events", organisationId, contractId] as const
};
