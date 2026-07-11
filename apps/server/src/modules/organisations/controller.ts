import type { RequestHandler } from "express";
import { getRouteParameter } from "../../common/utils/params";
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
  }) satisfies RequestHandler,

  getProfile: (async (request, response, next) => {
    try {
      const organisation = await organisationService.getProfile(
        getRouteParameter(request.params, "organisationId")
      );

      response.status(200).json({ data: organisation });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler,

  listMembers: (async (request, response, next) => {
    try {
      const members = await organisationService.listMembers(
        getRouteParameter(request.params, "organisationId")
      );

      response.status(200).json({ data: members });
    } catch (error) {
      next(error);
    }
  }) satisfies RequestHandler
};
