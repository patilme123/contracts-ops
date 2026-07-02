import { Router } from "express";
import { realtimeService } from "./realtime.service";

export const realtimeRouter = Router({ mergeParams: true });

realtimeRouter.get("/contracts", (request, response) => {
  const organisationId = String(
    (request.params as Record<string, string | undefined>).organisationId ?? ""
  );
  const closeConnection = realtimeService.connect(organisationId, response);

  request.on("close", closeConnection);
});
