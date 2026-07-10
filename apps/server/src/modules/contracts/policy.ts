import { ContractStatus } from "@contract-console/database";
import { HttpError } from "../../common/errors/http";

export function requireContract<T>(contract: T | null) {
  if (!contract) {
    throw new HttpError(404, "Contract was not found", "CONTRACT_NOT_FOUND");
  }

  return contract;
}

export function assertDraftContract(status: ContractStatus) {
  if (status !== ContractStatus.DRAFT) {
    throw new HttpError(409, "Only draft contracts can be modified", "CONTRACT_NOT_DRAFT");
  }
}

export function assertContractStatus(
  status: ContractStatus,
  expectedStatus: ContractStatus,
  message: string
) {
  if (status !== expectedStatus) {
    throw new HttpError(409, message, "INVALID_STATUS_TRANSITION");
  }
}
