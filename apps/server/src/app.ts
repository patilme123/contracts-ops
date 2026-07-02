import cors from "cors";
import express from "express";
import { corsOptions } from "./config/cors";
import { errorHandler } from "./middleware/error-handler";
import { notFoundHandler } from "./middleware/not-found";
import { requestLogger } from "./middleware/request-logger";
import { organisationsRouter } from "./modules/organisations/organisations.routes";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors(corsOptions));
  app.use(express.json({ limit: "1mb" }));
  app.use(requestLogger);

  app.get("/health", (_request, response) => {
    response.status(200).json({
      data: {
        status: "ok",
        service: "contract-console-server"
      }
    });
  });

  app.use("/api/organisations", organisationsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
