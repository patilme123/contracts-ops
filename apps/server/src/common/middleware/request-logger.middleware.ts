import type { RequestHandler } from "express";

export const requestLogger: RequestHandler = (request, _response, next) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`${request.method} ${request.originalUrl}`);
  }

  next();
};
