import { ContractEventType, ContractStatus, prisma } from "@contract-console/database";
import { contractPayloadSchema, type ContractPayload } from "@contract-console/shared";
import { parsePagination } from "../../common/utils/pagination";
import { contractEventRepository } from "../contract-events/repository";
import { organisationRepository } from "../organisations/repository";
import { requireOrganisation } from "../organisations/policy";
import { contractStatusStreamService } from "../realtime/service";
import {
  assertContractStatus,
  assertDraftContract,
  requireContract
} from "./policy";
import { contractRepository } from "./repository";
import type { ContractListQuery } from "./types";

export const contractService = {
  list(organisationId: string, query: ContractListQuery) {
    return contractRepository.listByOrganisation({
      organisationId,
      filters: {
        status: query.status,
        search: query.search,
        clientName: query.clientName,
        contractId: query.contractId,
        poDateFrom: query.poDateFrom,
        poDateTo: query.poDateTo
      },
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
      pagination: parsePagination(query)
    });
  },

  getStatistics(organisationId: string) {
    return contractRepository.countByStatus(organisationId);
  },

  async createDraft(organisationId: string, input: unknown) {
    const payload = contractPayloadSchema.parse(input);

    const contract = await prisma.$transaction(async (transaction) => {
      requireOrganisation(await organisationRepository.findById(organisationId, transaction));

      const contractNumber = await contractRepository.getNextNumber(
        organisationId,
        transaction
      );
      const contract = await contractRepository.create(
        organisationId,
        contractNumber,
        payload,
        transaction
      );

      await contractEventRepository.create(
        {
          organisationId,
          contractId: contract.id,
          eventType: ContractEventType.CREATED,
          nextStatus: ContractStatus.DRAFT,
          summary: "Contract created",
          metadata: { contractNumber }
        },
        transaction
      );

      return contract;
    });

    contractStatusStreamService.publish({
      type: "CONTRACT_CREATED",
      organisationId,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      status: ContractStatus.DRAFT,
      updatedAt: contract.updatedAt
    });

    return contract;
  },

  async getByReference(organisationId: string, contractReference: string) {
    return requireContract(
      await contractRepository.findDetailByReference(organisationId, contractReference)
    );
  },

  async updateDraft(organisationId: string, contractReference: string, input: unknown) {
    const payload: ContractPayload = contractPayloadSchema.parse(input);

    const contract = await prisma.$transaction(async (transaction) => {
      const existingContract = requireContract(
        await contractRepository.findRecordByReference(
          organisationId,
          contractReference,
          transaction
        )
      );

      assertDraftContract(existingContract.status);

      const contract = await contractRepository.updatePayload(
        existingContract.id,
        payload,
        transaction
      );

      await contractEventRepository.create(
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
        transaction
      );

      return contract;
    });

    contractStatusStreamService.publish({
      type: "CONTRACT_UPDATED",
      organisationId,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      status: ContractStatus.DRAFT,
      updatedAt: contract.updatedAt
    });

    return contract;
  },

  async finalize(organisationId: string, contractReference: string) {
    const contract = await prisma.$transaction(async (transaction) => {
      const existingContract = requireContract(
        await contractRepository.findRecordByReference(
          organisationId,
          contractReference,
          transaction
        )
      );

      assertContractStatus(
        existingContract.status,
        ContractStatus.DRAFT,
        "Only draft contracts can be finalized"
      );

      const finalizedContract = await contractRepository.updateStatus(
        existingContract.id,
        ContractStatus.FINALIZED,
        transaction
      );

      await contractEventRepository.create(
        {
          organisationId,
          contractId: existingContract.id,
          eventType: ContractEventType.FINALIZED,
          previousStatus: ContractStatus.DRAFT,
          nextStatus: ContractStatus.FINALIZED,
          summary: "Contract finalized"
        },
        transaction
      );

      return finalizedContract;
    });

    contractStatusStreamService.publish({
      type: "CONTRACT_STATUS_CHANGED",
      organisationId,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      status: ContractStatus.FINALIZED,
      updatedAt: contract.updatedAt
    });

    return contract;
  },

  async archive(organisationId: string, contractReference: string) {
    const contract = await prisma.$transaction(async (transaction) => {
      const existingContract = requireContract(
        await contractRepository.findRecordByReference(
          organisationId,
          contractReference,
          transaction
        )
      );

      assertContractStatus(
        existingContract.status,
        ContractStatus.FINALIZED,
        "Only finalized contracts can be archived"
      );

      const archivedContract = await contractRepository.updateStatus(
        existingContract.id,
        ContractStatus.ARCHIVED,
        transaction
      );

      await contractEventRepository.create(
        {
          organisationId,
          contractId: existingContract.id,
          eventType: ContractEventType.ARCHIVED,
          previousStatus: ContractStatus.FINALIZED,
          nextStatus: ContractStatus.ARCHIVED,
          summary: "Contract archived"
        },
        transaction
      );

      return archivedContract;
    });

    contractStatusStreamService.publish({
      type: "CONTRACT_STATUS_CHANGED",
      organisationId,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      status: ContractStatus.ARCHIVED,
      updatedAt: contract.updatedAt
    });

    return contract;
  },

  async deleteDraft(organisationId: string, contractReference: string) {
    const contract = await prisma.$transaction(async (transaction) => {
      const existingContract = requireContract(
        await contractRepository.findRecordByReference(
          organisationId,
          contractReference,
          transaction
        )
      );

      assertDraftContract(existingContract.status);
      const deletedContract = await contractRepository.softDelete(
        existingContract.id,
        transaction
      );

      await contractEventRepository.create(
        {
          organisationId,
          contractId: existingContract.id,
          eventType: ContractEventType.DELETED,
          previousStatus: existingContract.status,
          summary: "Draft contract deleted",
          metadata: { contractNumber: existingContract.contractNumber }
        },
        transaction
      );

      return deletedContract;
    });

    contractStatusStreamService.publish({
      type: "CONTRACT_DELETED",
      organisationId,
      contractId: contract.id,
      contractNumber: contract.contractNumber,
      status: ContractStatus.DRAFT,
      updatedAt: contract.updatedAt.toISOString()
    });
  }
};
