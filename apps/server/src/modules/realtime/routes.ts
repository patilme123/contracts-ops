import { Router } from "express";
import { validateRequest } from "../../common/middleware/validation";
import { organisationRouteParamsSchema } from "../organisations/schema";
import { contractStatusStreamController } from "./controller";

export const contractStatusStreamRoutes = Router({ mergeParams: true });

contractStatusStreamRoutes.get(
  "/",
  validateRequest({ params: organisationRouteParamsSchema }),
  contractStatusStreamController.connect
);
