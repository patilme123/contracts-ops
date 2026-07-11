import { prisma } from "@contract-console/database";
import { createApp } from "./app";
import { environment } from "./config/environment";

const app = createApp();

const server = app.listen(environment.PORT, "0.0.0.0", () => {
  console.log(`Contract console server listening on 0.0.0.0:${environment.PORT}`);
});

server.on("error", (error) => {
  console.error("Unable to start contract console server", error);
  process.exit(1);
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
