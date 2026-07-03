import { Router } from "express";
import { validateRequest } from "../../middleware/validate-request";
import {
  archiveContract,
  createContract,
  deleteContract,
  finalizeContract,
  getContract,
  listContractEvents,
  listContracts,
  updateContract
} from "./contracts.controller";
import {
  contractParamsSchema,
  createContractSchema,
  listContractsQuerySchema,
  organisationParamsSchema,
  updateContractSchema
} from "./contracts.schemas";

export const contractsRouter = Router({ mergeParams: true });

contractsRouter.get(
  "/",
  validateRequest({ params: organisationParamsSchema, query: listContractsQuerySchema }),
  listContracts
);
contractsRouter.post(
  "/",
  validateRequest({ params: organisationParamsSchema, body: createContractSchema }),
  createContract
);
contractsRouter.get("/:contractId", validateRequest({ params: contractParamsSchema }), getContract);
contractsRouter.patch(
  "/:contractId",
  validateRequest({ params: contractParamsSchema, body: updateContractSchema }),
  updateContract
);
contractsRouter.post(
  "/:contractId/finalize",
  validateRequest({ params: contractParamsSchema }),
  finalizeContract
);
contractsRouter.post(
  "/:contractId/archive",
  validateRequest({ params: contractParamsSchema }),
  archiveContract
);
contractsRouter.delete("/:contractId", validateRequest({ params: contractParamsSchema }), deleteContract);
contractsRouter.get("/:contractId/events", validateRequest({ params: contractParamsSchema }), listContractEvents);
