import cors from "cors";
import express from "express";
import { apiRouter } from "./api/router";
import { errorHandler } from "./common/middleware/error";
import { notFoundHandler } from "./common/middleware/fallback";
import { requestLogger } from "./common/middleware/logger";
import { corsConfig } from "./config/cors";

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.use(cors(corsConfig));
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

  app.use("/api", apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
