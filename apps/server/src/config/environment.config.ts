import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { z } from "zod";

const environmentPaths = [resolve(process.cwd(), ".env"), resolve(process.cwd(), "../../.env")];

for (const environmentPath of environmentPaths) {
  if (existsSync(environmentPath)) {
    config({ path: environmentPath, override: false });
  }
}

const environmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().default("http://localhost:3000"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().min(1, "DIRECT_URL is required").optional()
});

const parsedEnvironment = environmentSchema.safeParse(process.env);

if (!parsedEnvironment.success) {
  console.error(
    "Invalid server environment",
    parsedEnvironment.error.flatten().fieldErrors
  );
  throw new Error("Invalid server environment");
}

export const environment = parsedEnvironment.data;
