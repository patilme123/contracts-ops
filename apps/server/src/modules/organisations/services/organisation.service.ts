import { organisationRepository } from "../repositories/organisation.repository";

export const organisationService = {
  list() {
    return organisationRepository.findAll();
  }
};
