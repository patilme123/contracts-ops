import type { Response } from "express";
import type { ContractStatusChangedEvent } from "@contract-console/shared";

const HEARTBEAT_INTERVAL_MS = 25_000;

type Client = {
  response: Response;
  heartbeat: NodeJS.Timeout;
};

const clientsByOrganisation = new Map<string, Set<Client>>();

function writeEvent(response: Response, eventName: string, payload: unknown) {
  response.write(`event: ${eventName}\n`);
  response.write(`data: ${JSON.stringify(payload)}\n\n`);
}

export const realtimeService = {
  connect(organisationId: string, response: Response) {
    response.setHeader("Content-Type", "text/event-stream");
    response.setHeader("Cache-Control", "no-cache, no-transform");
    response.setHeader("Connection", "keep-alive");
    response.flushHeaders();

    const client: Client = {
      response,
      heartbeat: setInterval(() => {
        response.write(": heartbeat\n\n");
      }, HEARTBEAT_INTERVAL_MS)
    };

    const organisationClients = clientsByOrganisation.get(organisationId) ?? new Set<Client>();
    organisationClients.add(client);
    clientsByOrganisation.set(organisationId, organisationClients);

    writeEvent(response, "connected", {
      type: "CONNECTED",
      organisationId
    });

    return () => {
      clearInterval(client.heartbeat);
      organisationClients.delete(client);

      if (organisationClients.size === 0) {
        clientsByOrganisation.delete(organisationId);
      }

      response.end();
    };
  },

  broadcastStatusChanged(event: ContractStatusChangedEvent) {
    const organisationClients = clientsByOrganisation.get(event.organisationId);

    if (!organisationClients) {
      return;
    }

    for (const client of organisationClients) {
      writeEvent(client.response, "contract-status-changed", event);
    }
  }
};
