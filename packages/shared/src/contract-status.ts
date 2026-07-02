export const contractStatuses = ["DRAFT", "FINALIZED", "ARCHIVED"] as const;

export type ContractStatus = (typeof contractStatuses)[number];

export const contractEventTypes = [
  "CREATED",
  "UPDATED",
  "FINALIZED",
  "ARCHIVED",
  "DELETED"
] as const;

export type ContractEventType = (typeof contractEventTypes)[number];

export function canEditContract(status: ContractStatus) {
  return status === "DRAFT";
}

export function canDeleteContract(status: ContractStatus) {
  return status === "DRAFT";
}

export function getNextAllowedStatus(status: ContractStatus) {
  if (status === "DRAFT") {
    return "FINALIZED";
  }

  if (status === "FINALIZED") {
    return "ARCHIVED";
  }

  return null;
}
