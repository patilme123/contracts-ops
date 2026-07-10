import { organisationRepository } from "./repository";

export const organisationService = {
  list() {
    return organisationRepository.findAll();
  }
};
