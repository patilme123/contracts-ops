"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useOrganisationContext } from "./provider";

export function OrganisationSwitcher() {
  const {
    organisations,
    selectedOrganisationId,
    setSelectedOrganisationId,
    isLoadingOrganisations
  } = useOrganisationContext();

  return (
    <div className="flex items-center rounded-md border border-border bg-background/70 px-1">
      <Select
        value={selectedOrganisationId ?? ""}
        disabled={isLoadingOrganisations || organisations.length === 0}
        onValueChange={setSelectedOrganisationId}
      >
        <SelectTrigger
          aria-label="Organisation"
          className="h-9 min-w-36 border-0 bg-transparent px-2 text-xs font-medium shadow-none focus:ring-0 sm:min-w-44 sm:text-sm"
        >
          <SelectValue
            placeholder={isLoadingOrganisations ? "Loading" : "No organisation"}
          />
        </SelectTrigger>
        <SelectContent>
          {organisations.map((organisation) => (
            <SelectItem key={organisation.id} value={organisation.id}>
              {organisation.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
