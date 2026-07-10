import { Router } from "express";
import { validateRequest } from "../../../common/middleware/validate-request.middleware";
import { organisationRouteParamsSchema } from "../../organisations/schemas/organisation.schema";
import { contractStatusStreamController } from "../controllers/contract-status-stream.controller";

export const contractStatusStreamRoutes = Router({ mergeParams: true });

contractStatusStreamRoutes.get(
  "/",
  validateRequest({ params: organisationRouteParamsSchema }),
  contractStatusStreamController.connect
);
