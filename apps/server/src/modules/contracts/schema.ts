import { contractPayloadSchema, contractStatuses } from "@contract-console/shared";
import { z } from "zod";
import { organisationRouteParamsSchema } from "../organisations/schema";

export const contractRouteParamsSchema = organisationRouteParamsSchema.extend({
  contractId: z.string().min(1)
});

export const contractListQuerySchema = z.object({
  status: z.enum(contractStatuses).optional(),
  clientName: z.string().optional(),
  contractId: z.string().optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(50).optional()
});

export const createContractRequestSchema = contractPayloadSchema;
export const updateContractRequestSchema = contractPayloadSchema;
