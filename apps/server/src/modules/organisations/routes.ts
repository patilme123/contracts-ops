import { Router } from "express";
import { validateRequest } from "../../common/middleware/validation";
import { organisationController } from "./controller";
import { organisationRouteParamsSchema } from "./schema";

export const organisationRoutes = Router();

organisationRoutes.get("/", organisationController.list);
organisationRoutes.get(
  "/:organisationId",
  validateRequest({ params: organisationRouteParamsSchema }),
  organisationController.getProfile
);
organisationRoutes.get(
  "/:organisationId/members",
  validateRequest({ params: organisationRouteParamsSchema }),
  organisationController.listMembers
);
