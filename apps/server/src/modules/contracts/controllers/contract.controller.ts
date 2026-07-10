import type { RequestHandler } from "express";
import { getRouteParameter } from "../../../common/utils/route-parameter.util";
import { contractService } from "../services/contract.service";
import type { ContractListQuery } from "../types/contract.types";

export const contractController = {
  list: (async (request, response, next) => {
    try {
      const organisationId = getRouteParameter(request.params, "organisationId");
      const result = await contractService.list(
        organisationId,
        request.query as ContractListQuery
      );

      response.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  getStatistics: (async (request, response, next) => {
    try {
      const organisationId = getRouteParameter(request.params, "organisationId");
      const statistics = await contractService.getStatistics(organisationId);

      response.status(200).json({ data: statistics });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  createDraft: (async (request, response, next) => {
    try {
      const organisationId = getRouteParameter(request.params, "organisationId");
      const contract = await contractService.createDraft(organisationId, request.body);

      response.status(201).json({ data: contract });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  getByReference: (async (request, response, next) => {
    try {
      const organisationId = getRouteParameter(request.params, "organisationId");
      const contractReference = getRouteParameter(request.params, "contractId");
      const contract = await contractService.getByReference(
        organisationId,
        contractReference
      );

      response.status(200).json({ data: contract });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  updateDraft: (async (request, response, next) => {
    try {
      const organisationId = getRouteParameter(request.params, "organisationId");
      const contractReference = getRouteParameter(request.params, "contractId");
      const contract = await contractService.updateDraft(
        organisationId,
        contractReference,
        request.body
      );

      response.status(200).json({ data: contract });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  finalize: (async (request, response, next) => {
    try {
      const organisationId = getRouteParameter(request.params, "organisationId");
      const contractReference = getRouteParameter(request.params, "contractId");
      const contract = await contractService.finalize(organisationId, contractReference);

      response.status(200).json({ data: contract });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  archive: (async (request, response, next) => {
    try {
      const organisationId = getRouteParameter(request.params, "organisationId");
      const contractReference = getRouteParameter(request.params, "contractId");
      const contract = await contractService.archive(organisationId, contractReference);

      response.status(200).json({ data: contract });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  deleteDraft: (async (request, response, next) => {
    try {
      const organisationId = getRouteParameter(request.params, "organisationId");
      const contractReference = getRouteParameter(request.params, "contractId");

      await contractService.deleteDraft(organisationId, contractReference);
      response.status(204).send();
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler
};
