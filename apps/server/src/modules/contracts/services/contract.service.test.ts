import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpError } from "../../../common/errors/http-error";

const mocks = vi.hoisted(() => {
  const transaction = { name: "transaction-client" };

  return {
    transaction,
    prisma: {
      $transaction: vi.fn(
        async (callback: (client: typeof transaction) => unknown) => callback(transaction)
      )
    },
    organisationRepository: {
      findById: vi.fn()
    },
    contractRepository: {
      listByOrganisation: vi.fn(),
      getNextNumber: vi.fn(),
      create: vi.fn(),
      findDetailByReference: vi.fn(),
      findRecordByReference: vi.fn(),
      updatePayload: vi.fn(),
      updateStatus: vi.fn(),
      softDelete: vi.fn()
    },
    contractEventRepository: {
      create: vi.fn()
    },
    contractStatusStreamService: {
      publish: vi.fn()
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

vi.mock("../../organisations/repositories/organisation.repository", () => ({
  organisationRepository: mocks.organisationRepository
}));

vi.mock("../repositories/contract.repository", () => ({
  contractRepository: mocks.contractRepository
}));

vi.mock("../../contract-events/repositories/contract-event.repository", () => ({
  contractEventRepository: mocks.contractEventRepository
}));

vi.mock("../../realtime/services/contract-status-stream.service", () => ({
  contractStatusStreamService: mocks.contractStatusStreamService
}));

import { contractService } from "./contract.service";

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

describe("contractService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.prisma.$transaction.mockImplementation(async (callback) =>
      callback(mocks.transaction)
    );
  });

  it("creates a draft contract and records an audit event", async () => {
    mocks.organisationRepository.findById.mockResolvedValue({ id: organisationId });
    mocks.contractRepository.getNextNumber.mockResolvedValue("CON-0001");
    mocks.contractRepository.create.mockResolvedValue(detailContract("DRAFT"));

    const contract = await contractService.createDraft(organisationId, payload);

    expect(contract.status).toBe("DRAFT");
    expect(mocks.contractRepository.create).toHaveBeenCalledWith(
      organisationId,
      "CON-0001",
      payload,
      mocks.transaction
    );
    expect(mocks.contractEventRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        organisationId,
        contractId,
        eventType: "CREATED",
        nextStatus: "DRAFT"
      }),
      mocks.transaction
    );
  });

  it("rejects updates for non-draft contracts", async () => {
    mocks.contractRepository.findRecordByReference.mockResolvedValue(
      rawContract("FINALIZED")
    );

    await expect(
      contractService.updateDraft(organisationId, contractId, payload)
    ).rejects.toMatchObject({
      code: "CONTRACT_NOT_DRAFT",
      statusCode: 409
    } satisfies Partial<HttpError>);

    expect(mocks.contractRepository.updatePayload).not.toHaveBeenCalled();
  });

  it("finalizes draft contracts and publishes status updates", async () => {
    mocks.contractRepository.findRecordByReference.mockResolvedValue(rawContract("DRAFT"));
    mocks.contractRepository.updateStatus.mockResolvedValue(detailContract("FINALIZED"));

    const contract = await contractService.finalize(organisationId, contractId);

    expect(contract.status).toBe("FINALIZED");
    expect(mocks.contractRepository.updateStatus).toHaveBeenCalledWith(
      contractId,
      "FINALIZED",
      mocks.transaction
    );
    expect(mocks.contractEventRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "FINALIZED",
        previousStatus: "DRAFT",
        nextStatus: "FINALIZED"
      }),
      mocks.transaction
    );
    expect(mocks.contractStatusStreamService.publish).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "CONTRACT_STATUS_CHANGED",
        organisationId,
        contractId,
        status: "FINALIZED"
      })
    );
  });

  it("rejects invalid finalize transitions", async () => {
    mocks.contractRepository.findRecordByReference.mockResolvedValue(
      rawContract("FINALIZED")
    );

    await expect(contractService.finalize(organisationId, contractId)).rejects.toMatchObject({
      code: "INVALID_STATUS_TRANSITION",
      statusCode: 409
    } satisfies Partial<HttpError>);

    expect(mocks.contractRepository.updateStatus).not.toHaveBeenCalled();
    expect(mocks.contractStatusStreamService.publish).not.toHaveBeenCalled();
  });

  it("archives finalized contracts", async () => {
    mocks.contractRepository.findRecordByReference.mockResolvedValue(
      rawContract("FINALIZED")
    );
    mocks.contractRepository.updateStatus.mockResolvedValue(detailContract("ARCHIVED"));

    const contract = await contractService.archive(organisationId, contractId);

    expect(contract.status).toBe("ARCHIVED");
    expect(mocks.contractRepository.updateStatus).toHaveBeenCalledWith(
      contractId,
      "ARCHIVED",
      mocks.transaction
    );
    expect(mocks.contractEventRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "ARCHIVED",
        previousStatus: "FINALIZED",
        nextStatus: "ARCHIVED"
      }),
      mocks.transaction
    );
  });

  it("soft deletes draft contracts and records audit events", async () => {
    mocks.contractRepository.findRecordByReference.mockResolvedValue(rawContract("DRAFT"));

    await contractService.deleteDraft(organisationId, contractId);

    expect(mocks.contractRepository.softDelete).toHaveBeenCalledWith(
      contractId,
      mocks.transaction
    );
    expect(mocks.contractEventRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        eventType: "DELETED",
        previousStatus: "DRAFT"
      }),
      mocks.transaction
    );
  });
});
