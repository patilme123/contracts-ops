import { HttpError } from "../errors/http-error";

export function getRouteParameter(
  params: Record<string, string | string[] | undefined>,
  name: "organisationId" | "contractId"
) {
  const value = params[name];

  if (!value) {
    throw new HttpError(400, `Missing ${name} route parameter`, "MISSING_ROUTE_PARAM");
  }

  return Array.isArray(value) ? value[0] : value;
}
