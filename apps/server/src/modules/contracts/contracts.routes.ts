import { Router } from "express";
import {
  archiveContract,
  createContract,
  deleteContract,
  finalizeContract,
  getContract,
  listContractEvents,
  listContracts,
  updateContract
} from "./contracts.controller";

export const contractsRouter = Router({ mergeParams: true });

contractsRouter.get("/", listContracts);
contractsRouter.post("/", createContract);
contractsRouter.get("/:contractId", getContract);
contractsRouter.patch("/:contractId", updateContract);
contractsRouter.post("/:contractId/finalize", finalizeContract);
contractsRouter.post("/:contractId/archive", archiveContract);
contractsRouter.delete("/:contractId", deleteContract);
contractsRouter.get("/:contractId/events", listContractEvents);
