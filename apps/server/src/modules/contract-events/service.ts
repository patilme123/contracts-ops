import { contractEventRepository } from "./repository";

export const contractEventService = {
  async listByContract(organisationId: string, contractReference: string) {
    const events = await contractEventRepository.findByContract(
      organisationId,
      contractReference
    );

    return events.map((event) => ({
      ...event,
      createdAt: event.createdAt.toISOString()
    }));
  }
};
