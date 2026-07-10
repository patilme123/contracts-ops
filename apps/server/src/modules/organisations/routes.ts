import { Router } from "express";
import { organisationController } from "./controller";

export const organisationRoutes = Router();

organisationRoutes.get("/", organisationController.list);
