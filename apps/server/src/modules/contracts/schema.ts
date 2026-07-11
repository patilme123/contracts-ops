import { contractPayloadSchema, contractStatuses } from "@contract-console/shared";
import { z } from "zod";
import { organisationRouteParamsSchema } from "../organisations/schema";

export const contractRouteParamsSchema = organisationRouteParamsSchema.extend({
  contractId: z.string().min(1)
});

export const contractListQuerySchema = z.object({
  status: z.enum(contractStatuses).optional(),
  search: z.string().trim().min(1).max(120).optional(),
  clientName: z.string().trim().min(1).max(120).optional(),
  contractId: z.string().trim().min(1).max(120).optional(),
  poDateFrom: z.string().date().optional(),
  poDateTo: z.string().date().optional(),
  sortBy: z.enum(["updatedAt", "poDate", "clientName", "contractNumber"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(50).optional()
}).superRefine((value, context) => {
  if (value.poDateFrom && value.poDateTo && value.poDateFrom > value.poDateTo) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["poDateTo"],
      message: "PO date end must be on or after the start date"
    });
  }
});

export const createContractRequestSchema = contractPayloadSchema;
export const updateContractRequestSchema = contractPayloadSchema;
