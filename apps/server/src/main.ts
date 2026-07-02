import { createApp } from "./app";
import { env } from "./config/env";
import { prisma } from "@contract-console/database";

const app = createApp();

const server = app.listen(env.PORT, () => {
  console.log(`Contract console server listening on port ${env.PORT}`);
});

async function shutdown(signal: string) {
  console.log(`${signal} received, shutting down server`);

  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
