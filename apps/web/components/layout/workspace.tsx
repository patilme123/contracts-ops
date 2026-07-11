"use client";

import { Building2 } from "lucide-react";
import { useOrganisationContext } from "./provider";

export function WorkspaceName() {
  const { selectedOrganisation, isLoadingOrganisations } = useOrganisationContext();

  return (
    <div className="hidden items-center gap-2 border-l border-border pl-3 sm:flex">
      <Building2 className="size-4 text-muted-foreground" />
      <span className="max-w-48 truncate text-sm font-medium text-foreground">
        {isLoadingOrganisations ? "Loading workspace" : selectedOrganisation?.name ?? "Workspace"}
      </span>
    </div>
  );
}
