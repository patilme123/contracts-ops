import { organisationRepository } from "./repository";
import { requireOrganisation } from "./policy";

export const organisationService = {
  list() {
    return organisationRepository.findAll();
  },

  async getProfile(organisationId: string) {
    const organisation = requireOrganisation(
      await organisationRepository.findProfileById(organisationId)
    );

    return {
      id: organisation.id,
      name: organisation.name,
      slug: organisation.slug,
      description: organisation.description,
      timezone: organisation.timezone,
      createdAt: organisation.createdAt.toISOString(),
      memberCount: organisation._count.members
    };
  },

  async listMembers(organisationId: string) {
    await this.getProfile(organisationId);

    return organisationRepository.findMembersByOrganisation(organisationId);
  }
};
