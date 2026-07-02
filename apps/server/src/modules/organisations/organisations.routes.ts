import { Router } from "express";
import { contractsRouter } from "../contracts/contracts.routes";
import { realtimeRouter } from "../realtime/realtime.routes";
import { listOrganisations } from "./organisations.controller";

export const organisationsRouter = Router();

organisationsRouter.get("/", listOrganisations);
organisationsRouter.use("/:organisationId/contracts", contractsRouter);
organisationsRouter.use("/:organisationId/realtime", realtimeRouter);
