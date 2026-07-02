import type { RequestHandler } from "express";

export const notFoundHandler: RequestHandler = (request, response) => {
  response.status(404).json({
    message: `Route ${request.method} ${request.path} was not found`,
    code: "NOT_FOUND"
  });
};
