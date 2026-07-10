import { Router } from "express";
import { contractEventRoutes } from "../modules/contract-events/routes";
import { contractRoutes } from "../modules/contracts/routes";
import { organisationRoutes } from "../modules/organisations/routes";
import { contractStatusStreamRoutes } from "../modules/realtime/routes";

export const apiRouter = Router();

apiRouter.use("/organisations", organisationRoutes);
apiRouter.use("/organisations/:organisationId/contracts", contractRoutes);
apiRouter.use(
  "/organisations/:organisationId/contracts/:contractId/events",
  contractEventRoutes
);
apiRouter.use(
  "/organisations/:organisationId/realtime/contracts",
  contractStatusStreamRoutes
);
