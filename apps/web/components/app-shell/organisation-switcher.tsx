"use client";

import { Building2 } from "lucide-react";
import { useOrganisationContext } from "./organisation-provider";

export function OrganisationSwitcher() {
  const {
    organisations,
    selectedOrganisationId,
    setSelectedOrganisationId,
    isLoadingOrganisations
  } = useOrganisationContext();

  return (
    <label className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 shadow-sm">
      <Building2 className="size-4 text-muted-foreground" />
      <select
        aria-label="Organisation"
        value={selectedOrganisationId ?? ""}
        disabled={isLoadingOrganisations || organisations.length === 0}
        onChange={(event) => setSelectedOrganisationId(event.target.value)}
        className="bg-transparent text-sm font-medium outline-none"
      >
        {organisations.length === 0 ? <option value="">No organisations</option> : null}
        {organisations.map((organisation) => (
          <option key={organisation.id} value={organisation.id}>
            {organisation.name}
          </option>
        ))}
      </select>
    </label>
  );
}
