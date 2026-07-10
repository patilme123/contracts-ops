import { EventEmitter } from "node:events";
import httpMocks from "node-mocks-http";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpError } from "../../src/common/errors/http";

process.env.DATABASE_URL ??= "postgresql://test:test@localhost:5432/test";
process.env.CORS_ORIGIN ??= "http://localhost:3000";

const mocks = vi.hoisted(() => ({
  organisationService: {
    list: vi.fn()
  },
  contractService: {
    list: vi.fn(),
    getStatistics: vi.fn(),
    createDraft: vi.fn(),
    getByReference: vi.fn(),
    updateDraft: vi.fn(),
    finalize: vi.fn(),
    archive: vi.fn(),
    deleteDraft: vi.fn()
  },
  contractEventService: {
    listByContract: vi.fn()
  }
}));

vi.mock("../../src/modules/organisations/service", () => ({
  organisationService: mocks.organisationService
}));

vi.mock("../../src/modules/contracts/service", () => ({
  contractService: mocks.contractService
}));

vi.mock("../../src/modules/contract-events/service", () => ({
  contractEventService: mocks.contractEventService
}));

import { createApp } from "../../src/app";

const app = createApp();
const organisationId = "11111111-1111-4111-8111-111111111111";
const contractId = "CON-0001";

const contractPayload = {
  client_name: "Apex Manufacturing",
  po_ref_no: "PO-2026-1001",
  po_date: "2026-01-15",
  items: [
    {
      description: "Industrial packing materials",
      quantity: 10,
      unit_price: 20
    }
  ]
};

const contractDetail = {
  id: "22222222-2222-4222-8222-222222222222",
  organisationId,
  contractNumber: contractId,
  status: "DRAFT",
  clientName: contractPayload.client_name,
  poRefNo: contractPayload.po_ref_no,
  poDate: contractPayload.po_date,
  fieldData: contractPayload,
  createdAt: "2026-01-15T00:00:00.000Z",
  updatedAt: "2026-01-16T00:00:00.000Z"
};

function parseResponseBody(rawBody: string) {
  if (!rawBody) {
    return undefined;
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    return rawBody;
  }
}

function invokeApp(input: {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  url: string;
  body?: unknown;
}) {
  const request = httpMocks.createRequest({
    method: input.method,
    url: input.url,
    originalUrl: input.url,
    headers: {
      "content-type": "application/json",
      origin: "http://localhost:3000"
    },
    body: input.body
  });
  const response = httpMocks.createResponse({
    eventEmitter: EventEmitter
  });

  return new Promise<{
    status: number;
    body: unknown;
  }>((resolve) => {
    response.on("end", () => {
      resolve({
        status: response.statusCode,
        body: parseResponseBody(response._getData())
      });
    });

    app.handle(request, response);
  });
}

describe("HTTP API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("serves health checks", async () => {
    const response = await invokeApp({
      method: "GET",
      url: "/health"
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      data: {
        status: "ok"
      }
    });
  });

  it("lists organisations", async () => {
    mocks.organisationService.list.mockResolvedValue([
      {
        id: organisationId,
        name: "Northstar Logistics",
        slug: "northstar-logistics"
      }
    ]);

    const response = await invokeApp({
      method: "GET",
      url: "/api/organisations"
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      data: [
        {
          slug: "northstar-logistics"
        }
      ]
    });
  });

  it("rejects invalid contract upload JSON", async () => {
    const response = await invokeApp({
      method: "POST",
      url: `/api/organisations/${organisationId}/contracts`,
      body: { client_name: "" }
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      code: "VALIDATION_ERROR"
    });
    expect(mocks.contractService.createDraft).not.toHaveBeenCalled();
  });

  it("creates contracts with valid payloads", async () => {
    mocks.contractService.createDraft.mockResolvedValue(contractDetail);

    const response = await invokeApp({
      method: "POST",
      url: `/api/organisations/${organisationId}/contracts`,
      body: contractPayload
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      data: {
        contractNumber: contractId
      }
    });
    expect(mocks.contractService.createDraft).toHaveBeenCalledWith(
      organisationId,
      contractPayload
    );
  });

  it("returns contract stats", async () => {
    mocks.contractService.getStatistics.mockResolvedValue({
      total: 5,
      draft: 2,
      finalized: 2,
      archived: 1
    });

    const response = await invokeApp({
      method: "GET",
      url: `/api/organisations/${organisationId}/contracts/stats`
    });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      data: {
        total: 5
      }
    });
  });

  it("maps invalid workflow transitions to conflict responses", async () => {
    mocks.contractService.finalize.mockRejectedValue(
      new HttpError(
        409,
        "Only draft contracts can be finalized",
        "INVALID_STATUS_TRANSITION"
      )
    );

    const response = await invokeApp({
      method: "POST",
      url: `/api/organisations/${organisationId}/contracts/${contractId}/finalize`
    });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({
      code: "INVALID_STATUS_TRANSITION"
    });
  });
});
