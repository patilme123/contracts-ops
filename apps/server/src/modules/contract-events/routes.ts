import { Router } from "express";
import { validateRequest } from "../../common/middleware/validation";
import { contractRouteParamsSchema } from "../contracts/schema";
import { contractEventController } from "./controller";

export const contractEventRoutes = Router({ mergeParams: true });

contractEventRoutes.get(
  "/",
  validateRequest({ params: contractRouteParamsSchema }),
  contractEventController.listByContract
);
