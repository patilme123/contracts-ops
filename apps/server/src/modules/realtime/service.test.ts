import type { Response } from "express";
import { afterEach, describe, expect, it, vi } from "vitest";
import { contractStatusStreamService } from "./service";

function createResponse() {
  return {
    setHeader: vi.fn(),
    flushHeaders: vi.fn(),
    write: vi.fn(),
    end: vi.fn()
  } as unknown as Response;
}

describe("contractStatusStreamService", () => {
  let unsubscribe: (() => void) | undefined;

  afterEach(() => {
    unsubscribe?.();
    unsubscribe = undefined;
  });

  it("broadcasts contract activity to organisation subscribers", () => {
    const response = createResponse();
    unsubscribe = contractStatusStreamService.subscribe("organisation-1", response);

    contractStatusStreamService.publish({
      type: "CONTRACT_CREATED",
      organisationId: "organisation-1",
      contractId: "contract-1",
      contractNumber: "CON-0001",
      status: "DRAFT",
      updatedAt: "2026-07-11T00:00:00.000Z"
    });

    expect(response.write).toHaveBeenCalledWith("event: contract-changed\n");
    expect(response.write).toHaveBeenCalledWith(
      expect.stringContaining('"type":"CONTRACT_CREATED"')
    );
  });
});
