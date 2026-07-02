import { Badge, getStatusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UploadJsonButton } from "@/components/upload/upload-json-button";
import type { ContractStatus } from "@contract-console/shared";
import { Archive, CheckCircle2, FileText, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";

const statusFilters = ["All", "Draft", "Finalized", "Archived"];

const contracts: Array<{
  id: string;
  contractNumber: string;
  clientName: string;
  poRefNo: string;
  poDate: string;
  status: ContractStatus;
  updatedAt: string;
}> = [
  {
    id: "CON-0001",
    contractNumber: "CON-0001",
    clientName: "Apex Manufacturing",
    poRefNo: "PO-2026-1001",
    poDate: "Jan 15, 2026",
    status: "DRAFT",
    updatedAt: "Today, 10:15 AM"
  },
  {
    id: "CON-0002",
    contractNumber: "CON-0002",
    clientName: "Vertex Retail Group",
    poRefNo: "PO-2026-1018",
    poDate: "Feb 2, 2026",
    status: "FINALIZED",
    updatedAt: "Yesterday, 4:30 PM"
  },
  {
    id: "CON-0003",
    contractNumber: "CON-0003",
    clientName: "Blue Harbor Imports",
    poRefNo: "PO-2025-0884",
    poDate: "Nov 21, 2025",
    status: "ARCHIVED",
    updatedAt: "May 12, 2026"
  }
];

const totals = [
  {
    label: "Draft",
    value: "2",
    icon: FileText
  },
  {
    label: "Finalized",
    value: "2",
    icon: CheckCircle2
  },
  {
    label: "Archived",
    value: "1",
    icon: Archive
  }
];

export function ContractsOverview() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal">Contracts</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Manage organisation-scoped contract intake, workflow status, and audit history.
          </p>
        </div>
        <UploadJsonButton />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {totals.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label}>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold tracking-normal">{item.value}</p>
                </div>
                <div className="flex size-11 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Icon className="size-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="space-y-5 p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md border border-input bg-card px-3">
              <Search className="size-4 shrink-0 text-muted-foreground" />
              <input
                placeholder="Search by client or contract ID"
                className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button variant="secondary" size="sm">
                <SlidersHorizontal className="size-4" />
                Filters
              </Button>
              <div className="flex rounded-md border border-border bg-muted p-1">
                {statusFilters.map((filter) => (
                  <button
                    key={filter}
                    className="h-8 rounded px-3 text-sm font-medium text-muted-foreground transition hover:bg-card hover:text-foreground data-[active=true]:bg-card data-[active=true]:text-foreground data-[active=true]:shadow-sm"
                    data-active={filter === "All"}
                    type="button"
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted text-xs font-semibold uppercase tracking-normal text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Contract</th>
                  <th className="px-4 py-3">Client</th>
                  <th className="px-4 py-3">PO reference</th>
                  <th className="px-4 py-3">PO date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {contracts.map((contract) => (
                  <tr key={contract.id} className="transition hover:bg-muted/50">
                    <td className="px-4 py-4 font-semibold">
                      <Link href={`/contracts/${contract.id}`} className="text-primary hover:underline">
                        {contract.contractNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-4">{contract.clientName}</td>
                    <td className="px-4 py-4 text-muted-foreground">{contract.poRefNo}</td>
                    <td className="px-4 py-4 text-muted-foreground">{contract.poDate}</td>
                    <td className="px-4 py-4">
                      <Badge tone={getStatusTone(contract.status)}>{contract.status}</Badge>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{contract.updatedAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing 1-3 of 5 contracts</span>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm">
                Previous
              </Button>
              <Button variant="secondary" size="sm">
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
