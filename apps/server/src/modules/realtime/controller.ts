import type { RequestHandler } from "express";
import { getRouteParameter } from "../../common/utils/params";
import { contractStatusStreamService } from "./service";

export const contractStatusStreamController = {
  connect: ((request, response) => {
    const organisationId = getRouteParameter(request.params, "organisationId");
    const closeConnection = contractStatusStreamService.subscribe(
      organisationId,
      response
    );

    request.on("close", closeConnection);
  }) satisfies RequestHandler
};
