import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpError } from "../../utils/http-error";

const mocks = vi.hoisted(() => {
  const tx = { name: "transaction-client" };

  return {
    tx,
    prisma: {
      $transaction: vi.fn(async (callback: (client: typeof tx) => unknown) => callback(tx))
    },
    contractsRepository: {
      listByOrganisation: vi.fn(),
      organisationExists: vi.fn(),
      getNextContractNumber: vi.fn(),
      createContract: vi.fn(),
      findById: vi.fn(),
      findRawById: vi.fn(),
      updatePayload: vi.fn(),
      updateStatus: vi.fn(),
      softDelete: vi.fn()
    },
    contractEventsRepository: {
      create: vi.fn()
    },
    realtimeService: {
      broadcastStatusChanged: vi.fn()
    }
  };
});

vi.mock("@contract-console/database", () => ({
  ContractEventType: {
    CREATED: "CREATED",
    UPDATED: "UPDATED",
    FINALIZED: "FINALIZED",
    ARCHIVED: "ARCHIVED",
    DELETED: "DELETED"
  },
  ContractStatus: {
    DRAFT: "DRAFT",
    FINALIZED: "FINALIZED",
    ARCHIVED: "ARCHIVED"
  },
  prisma: mocks.prisma
}));

vi.mock("./contracts.repository", () => ({
  contractsRepository: mocks.contractsRepository
}));

vi.mock("../contract-events/contract-events.repository", () => ({
  contractEventsRepository: mocks.contractEventsRepository
}));

vi.mock("../realtime/realtime.service", () => ({
  realtimeService: mocks.realtimeService
}));

import { contractsService } from "./contracts.service";

const organisationId = "org-1";
const contractId = "contract-1";

const payload = {
  client_name: "Apex Manufacturing",
  po_ref_no: "PO-2026-1001",
  po_date: "2026-01-15",
  payment_terms: "Net 30",
  items: [
    {
      description: "Industrial packing materials",
      quantity: 10,
      unit_price: 20,
      total: 200
    }
  ]
};

function rawContract(status: "DRAFT" | "FINALIZED" | "ARCHIVED") {
  return {
    id: contractId,
    organisationId,
    contractNumber: "CON-0001",
    status
  };
}

function detailContract(status: "DRAFT" | "FINALIZED" | "ARCHIVED") {
  return {
    id: contractId,
    organisationId,
    contractNumber: "CON-0001",
    status,
    clientName: payload.client_name,
    poRefNo: payload.po_ref_no,
    poDate: payload.po_date,
    fieldData: payload,
    createdAt: "2026-01-15T00:00:00.000Z",
    updatedAt: "2026-01-16T00:00:00.000Z"
  };
}

describe("contractsService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.prisma.$transaction.mockImplementation(async (callback) => callback(mocks.tx));
  });

  it("creates a draft contract and records an audit event", async () => {
    mocks.contractsRepository.organisationExists.mockResolvedValue({ id: organisationId });
    mocks.contractsRepository.getNextContractNumber.mockResolvedValue("CON-0001");
    mocks.contractsRepository.createContract.mockResolvedValue(detailContract("DRAFT"));

    const contract = await contractsService.createContract(organisationId, payload);

    expect(contract.status).toBe("DRAFT");
    expect(mocks.contractsRepository.createContract).toHaveBeenCalledWith(
      organisationId,
      "CON-0001",
      payload,
      mocks.tx
    );
    expect(mocks.contractEventsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        organisationId,
        contractId,
        eventType: "CREATED",
        nextStatus: "DRAFT"
      }),
      mocks.tx
    );
  });

  it("rejects updates for non-draft contracts", async () => {
    mocks.contractsRepository.findRawById.mockResolvedValue(rawContract("FINALIZED"));

    await expect(contractsService.updateContract(organisationId, contractId, payload)).rejects.toMatchObject({
      code: "CONTRACT_NOT_DRAFT",
      statusCode: 409
    } satisfies Partial<HttpError>);

    expect(mocks.contractsRepository.updatePayload).not.toHaveBeenCalled();
  });

  it("finalizes draft contracts and broadcasts status updates", async () => {
    mocks.contractsRepository.findRawById.mockResolvedValue(rawContract("DRAFT"));
    mocks.contractsRepository.updateStatus.mockResolvedValue(detailContract("FINALIZED"));

    const contract = await contractsService.finalizeContract(organisationId, contractId);

    expect(contract.status).toBe("FINALIZED");
    expect(mocks.contractsRepository.updateStatus).toHaveBeenCalledWith(
      contractId,
      "FINALIZED",
      mocks.tx
    );
    expect(mocks.contractEventsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "FINALIZED",
        previousStatus: "DRAFT",
        nextStatus: "FINALIZED"
      }),
      mocks.tx
    );
    expect(mocks.realtimeService.broadcastStatusChanged).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "CONTRACT_STATUS_CHANGED",
        organisationId,
        contractId,
        status: "FINALIZED"
      })
    );
  });

  it("rejects invalid finalize transitions", async () => {
    mocks.contractsRepository.findRawById.mockResolvedValue(rawContract("FINALIZED"));

    await expect(contractsService.finalizeContract(organisationId, contractId)).rejects.toMatchObject({
      code: "INVALID_STATUS_TRANSITION",
      statusCode: 409
    } satisfies Partial<HttpError>);

    expect(mocks.contractsRepository.updateStatus).not.toHaveBeenCalled();
    expect(mocks.realtimeService.broadcastStatusChanged).not.toHaveBeenCalled();
  });

  it("archives finalized contracts", async () => {
    mocks.contractsRepository.findRawById.mockResolvedValue(rawContract("FINALIZED"));
    mocks.contractsRepository.updateStatus.mockResolvedValue(detailContract("ARCHIVED"));

    const contract = await contractsService.archiveContract(organisationId, contractId);

    expect(contract.status).toBe("ARCHIVED");
    expect(mocks.contractsRepository.updateStatus).toHaveBeenCalledWith(
      contractId,
      "ARCHIVED",
      mocks.tx
    );
    expect(mocks.contractEventsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "ARCHIVED",
        previousStatus: "FINALIZED",
        nextStatus: "ARCHIVED"
      }),
      mocks.tx
    );
  });

  it("soft deletes draft contracts and records audit events", async () => {
    mocks.contractsRepository.findRawById.mockResolvedValue(rawContract("DRAFT"));

    await contractsService.deleteContract(organisationId, contractId);

    expect(mocks.contractsRepository.softDelete).toHaveBeenCalledWith(contractId, mocks.tx);
    expect(mocks.contractEventsRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "DELETED",
        previousStatus: "DRAFT"
      }),
      mocks.tx
    );
  });
});
