import { HttpError } from "../../common/errors/http";

export function requireOrganisation<T>(organisation: T | null) {
  if (!organisation) {
    throw new HttpError(404, "Organisation was not found", "ORGANISATION_NOT_FOUND");
  }

  return organisation;
}
