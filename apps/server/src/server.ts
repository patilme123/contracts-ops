import { prisma } from "@contract-console/database";
import { createApp } from "./app";
import { environment } from "./config/environment.config";

const app = createApp();

const server = app.listen(environment.PORT, () => {
  console.log(`Contract console server listening on port ${environment.PORT}`);
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
