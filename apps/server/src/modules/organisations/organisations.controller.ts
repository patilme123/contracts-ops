import type { RequestHandler } from "express";
import { organisationsService } from "./organisations.service";

export const listOrganisations: RequestHandler = async (_request, response, next) => {
  try {
    const organisations = await organisationsService.listOrganisations();

    response.status(200).json({
      data: organisations
    });
  } catch (error) {
    next(error);
  }
};
