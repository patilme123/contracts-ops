import { z } from "zod";

export const organisationRouteParamsSchema = z.object({
  organisationId: z.string().uuid()
});
