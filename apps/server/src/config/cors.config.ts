import type { CorsOptions } from "cors";
import { environment } from "./environment.config";

const allowedOrigins = environment.CORS_ORIGIN.split(",").map((origin) => origin.trim());

export const corsConfig: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("Origin is not allowed by CORS"));
  },
  credentials: true
};
