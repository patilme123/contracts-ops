import { contractPayloadSchema, contractStatuses } from "@contract-console/shared";
import { z } from "zod";

export const organisationParamsSchema = z.object({
  organisationId: z.string().uuid()
});

export const contractParamsSchema = organisationParamsSchema.extend({
  contractId: z.string().min(1)
});

export const listContractsQuerySchema = z.object({
  status: z.enum(contractStatuses).optional(),
  clientName: z.string().optional(),
  contractId: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(50).optional()
});

export const createContractSchema = contractPayloadSchema;
export const updateContractSchema = contractPayloadSchema;
