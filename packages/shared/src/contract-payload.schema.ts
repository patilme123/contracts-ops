import { z } from "zod";

const isoDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD format");

export const contractItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  quantity_unit: z.string().optional(),
  unit_price: z.number().min(0, "Unit price must be greater than or equal to 0"),
  pricing_unit: z.string().optional(),
  total: z.number().optional()
});

export const contractPayloadSchema = z.object({
  client_name: z.string().min(1, "Client name is required"),
  po_ref_no: z.string().min(1, "PO reference number is required"),
  po_date: isoDateSchema,
  payment_terms: z.string().optional(),
  delivery_terms: z.string().optional(),
  items: z.array(contractItemSchema).min(1, "At least one item is required")
});

export type ContractItemPayload = z.infer<typeof contractItemSchema>;
export type ContractPayload = z.infer<typeof contractPayloadSchema>;
