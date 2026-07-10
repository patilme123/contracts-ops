import { Router } from "express";
import { organisationController } from "../controllers/organisation.controller";

export const organisationRoutes = Router();

organisationRoutes.get("/", organisationController.list);
