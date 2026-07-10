import { Router } from "express";
import { validateRequest } from "../../common/middleware/validation";
import { organisationRouteParamsSchema } from "../organisations/schema";
import { contractController } from "./controller";
import {
  contractListQuerySchema,
  contractRouteParamsSchema,
  createContractRequestSchema,
  updateContractRequestSchema
} from "./schema";

export const contractRoutes = Router({ mergeParams: true });

contractRoutes.get(
  "/",
  validateRequest({
    params: organisationRouteParamsSchema,
    query: contractListQuerySchema
  }),
  contractController.list
);
contractRoutes.post(
  "/",
  validateRequest({
    params: organisationRouteParamsSchema,
    body: createContractRequestSchema
  }),
  contractController.createDraft
);
contractRoutes.get(
  "/stats",
  validateRequest({ params: organisationRouteParamsSchema }),
  contractController.getStatistics
);
contractRoutes.get(
  "/:contractId",
  validateRequest({ params: contractRouteParamsSchema }),
  contractController.getByReference
);
contractRoutes.patch(
  "/:contractId",
  validateRequest({
    params: contractRouteParamsSchema,
    body: updateContractRequestSchema
  }),
  contractController.updateDraft
);
contractRoutes.post(
  "/:contractId/finalize",
  validateRequest({ params: contractRouteParamsSchema }),
  contractController.finalize
);
contractRoutes.post(
  "/:contractId/archive",
  validateRequest({ params: contractRouteParamsSchema }),
  contractController.archive
);
contractRoutes.delete(
  "/:contractId",
  validateRequest({ params: contractRouteParamsSchema }),
  contractController.deleteDraft
);
