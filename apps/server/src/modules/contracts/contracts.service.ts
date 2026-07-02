import type { ContractPayload } from "@contract-console/shared";
import { contractPayloadSchema } from "@contract-console/shared";
import { HttpError } from "../../utils/http-error";
import { parsePagination } from "../../utils/pagination";
import { contractsRepository } from "./contracts.repository";

export const contractsService = {
  async listContracts(organisationId: string, query: Record<string, unknown>) {
    const pagination = parsePagination(query);

    return contractsRepository.listByOrganisation({
      organisationId,
      query,
      pagination
    });
  },

  async createContract(_organisationId: string, body: unknown) {
    contractPayloadSchema.parse(body);
    throw new HttpError(501, "Contract creation will be implemented in the CRUD milestone", "NOT_IMPLEMENTED");
  },

  async getContract(organisationId: string, contractId: string) {
    const contract = await contractsRepository.findById(organisationId, contractId);

    if (!contract) {
      throw new HttpError(404, "Contract was not found", "CONTRACT_NOT_FOUND");
    }

    return contract;
  },

  async updateContract(_organisationId: string, _contractId: string, body: unknown) {
    const payload: ContractPayload = contractPayloadSchema.parse(body);
    void payload;

    throw new HttpError(501, "Contract updates will be implemented in the CRUD milestone", "NOT_IMPLEMENTED");
  },

  async finalizeContract(_organisationId: string, _contractId: string) {
    throw new HttpError(501, "Contract finalization will be implemented in the workflow milestone", "NOT_IMPLEMENTED");
  },

  async archiveContract(_organisationId: string, _contractId: string) {
    throw new HttpError(501, "Contract archival will be implemented in the workflow milestone", "NOT_IMPLEMENTED");
  },

  async deleteContract(_organisationId: string, _contractId: string) {
    throw new HttpError(501, "Draft-only deletion will be implemented in the CRUD milestone", "NOT_IMPLEMENTED");
  }
};
