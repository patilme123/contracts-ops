"use client";

import { useOrganisationContext } from "@/components/app-shell/organisation-provider";
import { Badge, getStatusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { UploadJsonButton } from "@/components/upload/upload-json-button";
import { listContracts, type ContractListParams } from "@/lib/api";
import { formatDate, formatRelativeLabel } from "@/lib/formatters";
import { queryKeys } from "@/lib/query-keys";
import type { ContractStatus, ContractSummary } from "@contract-console/shared";
import { useQuery } from "@tanstack/react-query";
import { Archive, CheckCircle2, FileText, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

const statusFilters: Array<"ALL" | ContractStatus> = ["ALL", "DRAFT", "FINALIZED", "ARCHIVED"];

function buildStats(contracts: ContractSummary[]) {
  return [
    {
      label: "Draft",
      value: String(contracts.filter((contract) => contract.status === "DRAFT").length),
      icon: FileText
    },
    {
      label: "Finalized",
      value: String(contracts.filter((contract) => contract.status === "FINALIZED").length),
      icon: CheckCircle2
    },
    {
      label: "Archived",
      value: String(contracts.filter((contract) => contract.status === "ARCHIVED").length),
      icon: Archive
    }
  ];
}

export function ContractsOverview() {
  const { selectedOrganisationId, selectedOrganisation, isLoadingOrganisations } =
    useOrganisationContext();
  const [status, setStatus] = useState<"ALL" | ContractStatus>("ALL");
  const [clientName, setClientName] = useState("");
  const [contractId, setContractId] = useState("");
  const [page, setPage] = useState(1);

  const filters = useMemo<ContractListParams>(
    () => ({
      status: status === "ALL" ? undefined : status,
      clientName: clientName.trim() || undefined,
      contractId: contractId.trim() || undefined,
      page,
      pageSize: 10
    }),
    [clientName, contractId, page, status]
  );

  const contractsQuery = useQuery({
    queryKey: selectedOrganisationId
      ? queryKeys.contracts(selectedOrganisationId, filters)
      : ["contracts", "empty"],
    queryFn: async () => {
      if (!selectedOrganisationId) {
        throw new Error("No organisation selected");
      }

      return listContracts(selectedOrganisationId, filters);
    },
    enabled: Boolean(selectedOrganisationId)
  });

  const statsQuery = useQuery({
    queryKey: selectedOrganisationId
      ? queryKeys.contractStats(selectedOrganisationId)
      : ["contract-stats", "empty"],
    queryFn: async () => {
      if (!selectedOrganisationId) {
        throw new Error("No organisation selected");
      }

      return listContracts(selectedOrganisationId, {
        page: 1,
        pageSize: 50
      });
    },
    enabled: Boolean(selectedOrganisationId)
  });

  const contracts = contractsQuery.data?.data ?? [];
  const pagination = contractsQuery.data?.pagination;
  const totals = buildStats(statsQuery.data?.data ?? []);
  const isLoading = isLoadingOrganisations || contractsQuery.isLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal">Contracts</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {selectedOrganisation
              ? `Manage contract intake, workflow status, and audit history for ${selectedOrganisation.name}.`
              : "Select an organisation to manage contract intake and workflow status."}
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
                value={clientName}
                onChange={(event) => {
                  setClientName(event.target.value);
                  setPage(1);
                }}
                placeholder="Search client name"
                className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex min-w-0 items-center gap-2 rounded-md border border-input bg-card px-3 lg:w-56">
              <FileText className="size-4 shrink-0 text-muted-foreground" />
              <input
                value={contractId}
                onChange={(event) => {
                  setContractId(event.target.value);
                  setPage(1);
                }}
                placeholder="Contract ID"
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
                    data-active={filter === status}
                    type="button"
                    onClick={() => {
                      setStatus(filter);
                      setPage(1);
                    }}
                  >
                    {filter === "ALL" ? "All" : filter}
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
                {isLoading ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={6}>
                      Loading contracts
                    </td>
                  </tr>
                ) : null}
                {!isLoading && contracts.length === 0 ? (
                  <tr>
                    <td className="px-4 py-8 text-center text-muted-foreground" colSpan={6}>
                      No contracts match the current filters.
                    </td>
                  </tr>
                ) : null}
                {!isLoading && contracts.map((contract) => (
                  <tr key={contract.id} className="transition hover:bg-muted/50">
                    <td className="px-4 py-4 font-semibold">
                      <Link href={`/contracts/${contract.id}`} className="text-primary hover:underline">
                        {contract.contractNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-4">{contract.clientName}</td>
                    <td className="px-4 py-4 text-muted-foreground">{contract.poRefNo}</td>
                    <td className="px-4 py-4 text-muted-foreground">{formatDate(contract.poDate)}</td>
                    <td className="px-4 py-4">
                      <Badge tone={getStatusTone(contract.status)}>{contract.status}</Badge>
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">{formatRelativeLabel(contract.updatedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {pagination
                ? `Showing ${contracts.length} of ${pagination.total} contracts`
                : "No contract data loaded"}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={!pagination || pagination.page <= 1}
                onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={!pagination || pagination.page >= pagination.totalPages}
                onClick={() => setPage((currentPage) => currentPage + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
