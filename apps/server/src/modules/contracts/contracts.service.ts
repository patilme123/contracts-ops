import type { ContractPayload } from "@contract-console/shared";
import { ContractEventType, ContractStatus, prisma } from "@contract-console/database";
import { contractPayloadSchema } from "@contract-console/shared";
import { HttpError } from "../../utils/http-error";
import { parsePagination } from "../../utils/pagination";
import { contractEventsRepository } from "../contract-events/contract-events.repository";
import { realtimeService } from "../realtime/realtime.service";
import { contractsRepository } from "./contracts.repository";

function assertOrganisationScopedContract<T>(contract: T | null) {
  if (!contract) {
    throw new HttpError(404, "Contract was not found", "CONTRACT_NOT_FOUND");
  }

  return contract;
}

function assertOrganisationExists<T>(organisation: T | null) {
  if (!organisation) {
    throw new HttpError(404, "Organisation was not found", "ORGANISATION_NOT_FOUND");
  }

  return organisation;
}

function assertDraft(status: ContractStatus) {
  if (status !== ContractStatus.DRAFT) {
    throw new HttpError(409, "Only draft contracts can be modified", "CONTRACT_NOT_DRAFT");
  }
}

function assertStatus(status: ContractStatus, expected: ContractStatus, message: string, code: string) {
  if (status !== expected) {
    throw new HttpError(409, message, code);
  }
}

export const contractsService = {
  async listContracts(organisationId: string, query: Record<string, unknown>) {
    const pagination = parsePagination(query);

    return contractsRepository.listByOrganisation({
      organisationId,
      query,
      pagination
    });
  },

  async getStats(organisationId: string) {
    return contractsRepository.countByStatus(organisationId);
  },

  async createContract(organisationId: string, body: unknown) {
    const payload = contractPayloadSchema.parse(body);

    return prisma.$transaction(async (tx) => {
      assertOrganisationExists(await contractsRepository.organisationExists(organisationId, tx));

      const contractNumber = await contractsRepository.getNextContractNumber(organisationId, tx);
      const contract = await contractsRepository.createContract(
        organisationId,
        contractNumber,
        payload,
        tx
      );

      await contractEventsRepository.create(
        {
          organisationId,
          contractId: contract.id,
          eventType: ContractEventType.CREATED,
          nextStatus: ContractStatus.DRAFT,
          summary: "Contract created",
          metadata: {
            contractNumber
          }
        },
        tx
      );

      return contract;
    });
  },

  async getContract(organisationId: string, contractId: string) {
    const contract = await contractsRepository.findById(organisationId, contractId);

    if (!contract) {
      throw new HttpError(404, "Contract was not found", "CONTRACT_NOT_FOUND");
    }

    return contract;
  },

  async updateContract(organisationId: string, contractId: string, body: unknown) {
    const payload: ContractPayload = contractPayloadSchema.parse(body);

    return prisma.$transaction(async (tx) => {
      const existingContract = assertOrganisationScopedContract(
        await contractsRepository.findRawById(organisationId, contractId, tx)
      );

      assertDraft(existingContract.status);

      const contract = await contractsRepository.updatePayload(existingContract.id, payload, tx);

      await contractEventsRepository.create(
        {
          organisationId,
          contractId: existingContract.id,
          eventType: ContractEventType.UPDATED,
          previousStatus: existingContract.status,
          nextStatus: existingContract.status,
          summary: "Draft contract updated",
          metadata: {
            clientName: payload.client_name,
            poRefNo: payload.po_ref_no
          }
        },
        tx
      );

      return contract;
    });
  },

  async finalizeContract(organisationId: string, contractId: string) {
    const contract = await prisma.$transaction(async (tx) => {
      const existingContract = assertOrganisationScopedContract(
        await contractsRepository.findRawById(organisationId, contractId, tx)
      );

      assertStatus(
        existingContract.status,
        ContractStatus.DRAFT,
        "Only draft contracts can be finalized",
        "INVALID_STATUS_TRANSITION"
      );

      const finalizedContract = await contractsRepository.updateStatus(
        existingContract.id,
        ContractStatus.FINALIZED,
        tx
      );

      await contractEventsRepository.create(
        {
          organisationId,
          contractId: existingContract.id,
          eventType: ContractEventType.FINALIZED,
          previousStatus: ContractStatus.DRAFT,
          nextStatus: ContractStatus.FINALIZED,
          summary: "Contract finalized"
        },
        tx
      );

      return finalizedContract;
    });

    realtimeService.broadcastStatusChanged({
      type: "CONTRACT_STATUS_CHANGED",
      organisationId,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      status: ContractStatus.FINALIZED,
      updatedAt: contract.updatedAt
    });

    return contract;
  },

  async archiveContract(organisationId: string, contractId: string) {
    const contract = await prisma.$transaction(async (tx) => {
      const existingContract = assertOrganisationScopedContract(
        await contractsRepository.findRawById(organisationId, contractId, tx)
      );

      assertStatus(
        existingContract.status,
        ContractStatus.FINALIZED,
        "Only finalized contracts can be archived",
        "INVALID_STATUS_TRANSITION"
      );

      const archivedContract = await contractsRepository.updateStatus(
        existingContract.id,
        ContractStatus.ARCHIVED,
        tx
      );

      await contractEventsRepository.create(
        {
          organisationId,
          contractId: existingContract.id,
          eventType: ContractEventType.ARCHIVED,
          previousStatus: ContractStatus.FINALIZED,
          nextStatus: ContractStatus.ARCHIVED,
          summary: "Contract archived"
        },
        tx
      );

      return archivedContract;
    });

    realtimeService.broadcastStatusChanged({
      type: "CONTRACT_STATUS_CHANGED",
      organisationId,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      status: ContractStatus.ARCHIVED,
      updatedAt: contract.updatedAt
    });

    return contract;
  },

  async deleteContract(organisationId: string, contractId: string) {
    await prisma.$transaction(async (tx) => {
      const existingContract = assertOrganisationScopedContract(
        await contractsRepository.findRawById(organisationId, contractId, tx)
      );

      assertDraft(existingContract.status);

      await contractsRepository.softDelete(existingContract.id, tx);

      await contractEventsRepository.create(
        {
          organisationId,
          contractId: existingContract.id,
          eventType: ContractEventType.DELETED,
          previousStatus: existingContract.status,
          summary: "Draft contract deleted",
          metadata: {
            contractNumber: existingContract.contractNumber
          }
        },
        tx
      );
    });
  }
};
