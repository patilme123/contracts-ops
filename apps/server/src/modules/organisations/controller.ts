import type { RequestHandler } from "express";
import { organisationService } from "./service";

export const organisationController = {
  list: (async (_request, response, next) => {
    try {
      const organisations = await organisationService.list();

      response.status(200).json({
        data: organisations
      });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler
};
