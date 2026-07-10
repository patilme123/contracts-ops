import { Router } from "express";
import { validateRequest } from "../../../common/middleware/validate-request.middleware";
import { contractRouteParamsSchema } from "../../contracts/schemas/contract.schema";
import { contractEventController } from "../controllers/contract-event.controller";

export const contractEventRoutes = Router({ mergeParams: true });

contractEventRoutes.get(
  "/",
  validateRequest({ params: contractRouteParamsSchema }),
  contractEventController.listByContract
);
