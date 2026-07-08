import type { RequestHandler } from "express";
import { HttpError } from "../../utils/http-error";
import { contractEventsService } from "../contract-events/contract-events.service";
import { contractsService } from "./contracts.service";

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: "organisationId" | "contractId"
) {
  const value = params[key];

  if (!value) {
    throw new HttpError(400, `Missing ${key} route parameter`, "MISSING_ROUTE_PARAM");
  }

  return Array.isArray(value) ? value[0] : value;
}

export const listContracts: RequestHandler = async (request, response, next) => {
  try {
    const organisationId = readParam(request.params, "organisationId");
    const result = await contractsService.listContracts(organisationId, request.query);
    response.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getContractStats: RequestHandler = async (request, response, next) => {
  try {
    const organisationId = readParam(request.params, "organisationId");
    const stats = await contractsService.getStats(organisationId);
    response.status(200).json({ data: stats });
  } catch (error) {
    next(error);
  }
};

export const createContract: RequestHandler = async (request, response, next) => {
  try {
    const organisationId = readParam(request.params, "organisationId");
    const contract = await contractsService.createContract(organisationId, request.body);
    response.status(201).json({ data: contract });
  } catch (error) {
    next(error);
  }
};

export const getContract: RequestHandler = async (request, response, next) => {
  try {
    const organisationId = readParam(request.params, "organisationId");
    const contractId = readParam(request.params, "contractId");
    const contract = await contractsService.getContract(organisationId, contractId);

    response.status(200).json({ data: contract });
  } catch (error) {
    next(error);
  }
};

export const updateContract: RequestHandler = async (request, response, next) => {
  try {
    const organisationId = readParam(request.params, "organisationId");
    const contractId = readParam(request.params, "contractId");
    const contract = await contractsService.updateContract(organisationId, contractId, request.body);

    response.status(200).json({ data: contract });
  } catch (error) {
    next(error);
  }
};

export const finalizeContract: RequestHandler = async (request, response, next) => {
  try {
    const organisationId = readParam(request.params, "organisationId");
    const contractId = readParam(request.params, "contractId");
    const contract = await contractsService.finalizeContract(organisationId, contractId);

    response.status(200).json({ data: contract });
  } catch (error) {
    next(error);
  }
};

export const archiveContract: RequestHandler = async (request, response, next) => {
  try {
    const organisationId = readParam(request.params, "organisationId");
    const contractId = readParam(request.params, "contractId");
    const contract = await contractsService.archiveContract(organisationId, contractId);

    response.status(200).json({ data: contract });
  } catch (error) {
    next(error);
  }
};

export const deleteContract: RequestHandler = async (request, response, next) => {
  try {
    const organisationId = readParam(request.params, "organisationId");
    const contractId = readParam(request.params, "contractId");
    await contractsService.deleteContract(organisationId, contractId);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const listContractEvents: RequestHandler = async (request, response, next) => {
  try {
    const organisationId = readParam(request.params, "organisationId");
    const contractId = readParam(request.params, "contractId");
    const events = await contractEventsService.listForContract(organisationId, contractId);

    response.status(200).json({ data: events });
  } catch (error) {
    next(error);
  }
};
