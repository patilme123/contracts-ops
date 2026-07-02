import { contractEventsRepository } from "./contract-events.repository";

export const contractEventsService = {
  async listForContract(organisationId: string, contractId: string) {
    const events = await contractEventsRepository.listForContract(organisationId, contractId);

    return events.map((event) => ({
      ...event,
      createdAt: event.createdAt.toISOString()
    }));
  }
};
