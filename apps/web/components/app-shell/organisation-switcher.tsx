import { Building2 } from "lucide-react";

const organisations = [
  {
    id: "northstar-logistics",
    name: "Northstar Logistics"
  },
  {
    id: "atlas-procurement",
    name: "Atlas Procurement"
  }
];

export function OrganisationSwitcher() {
  return (
    <label className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 shadow-sm">
      <Building2 className="size-4 text-muted-foreground" />
      <select
        aria-label="Organisation"
        defaultValue={organisations[0]?.id}
        className="bg-transparent text-sm font-medium outline-none"
      >
        {organisations.map((organisation) => (
          <option key={organisation.id} value={organisation.id}>
            {organisation.name}
          </option>
        ))}
      </select>
    </label>
  );
}
