import type { RequestHandler } from "express";
import { getRouteParameter } from "../../common/utils/params";
import { contractEventService } from "./service";

export const contractEventController = {
  listByContract: (async (request, response, next) => {
    try {
      const organisationId = getRouteParameter(request.params, "organisationId");
      const contractReference = getRouteParameter(request.params, "contractId");
      const events = await contractEventService.listByContract(
        organisationId,
        contractReference
      );

      response.status(200).json({ data: events });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler
};
