"use client";

import { ContractStatusBadge } from "@/components/contracts/status";
import { UploadJsonButton } from "@/components/contracts/upload";
import { useOrganisationContext } from "@/components/layout/provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { getContractStats, listContracts, type ContractListParams } from "@/lib/api";
import { formatDate, formatRelativeLabel } from "@/lib/format";
import { queryKeys } from "@/lib/queries";
import { cn } from "@/lib/utils";
import type { ContractStats, ContractStatus } from "@contract-console/shared";
import { useQuery } from "@tanstack/react-query";
import { Archive, CheckCircle2, FileText, PencilLine, Search } from "lucide-react";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

const statusOptions: Array<{ value: "ALL" | ContractStatus; label: string }> = [
  { value: "ALL", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "FINALIZED", label: "Finalized" },
  { value: "ARCHIVED", label: "Archived" }
];

const poDateOptions = {
  ALL: { label: "All PO dates", from: undefined, to: undefined },
  YEAR_2025: { label: "PO date: 2025", from: "2025-01-01", to: "2025-12-31" },
  YEAR_2026: { label: "PO date: 2026", from: "2026-01-01", to: "2026-12-31" }
} as const;

const sortOptions = {
  UPDATED_DESC: { label: "Recently updated", sortBy: "updatedAt", sortOrder: "desc" },
  UPDATED_ASC: { label: "Least recently updated", sortBy: "updatedAt", sortOrder: "asc" },
  PO_DATE_DESC: { label: "Newest PO date", sortBy: "poDate", sortOrder: "desc" },
  CLIENT_ASC: { label: "Client name A-Z", sortBy: "clientName", sortOrder: "asc" }
} as const;

function buildStatistics(statistics?: ContractStats) {
  return [
    {
      label: "Total contracts",
      value: statistics?.total ?? 0,
      icon: FileText
    },
    {
      label: "Draft",
      value: statistics?.draft ?? 0,
      icon: PencilLine
    },
    {
      label: "Finalized",
      value: statistics?.finalized ?? 0,
      icon: CheckCircle2
    },
    {
      label: "Archived",
      value: statistics?.archived ?? 0,
      icon: Archive
    }
  ];
}

export function ContractsOverview() {
  const { selectedOrganisationId, selectedOrganisation, isLoadingOrganisations } =
    useOrganisationContext();
  const [status, setStatus] = useState<"ALL" | ContractStatus>("ALL");
  const [search, setSearch] = useState("");
  const [poDateFilter, setPoDateFilter] = useState<keyof typeof poDateOptions>("ALL");
  const [sort, setSort] = useState<keyof typeof sortOptions>("UPDATED_DESC");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    setPage(1);
  }, [selectedOrganisationId]);

  useEffect(() => {
    setPage(1);
  }, [deferredSearch, poDateFilter, sort, status, pageSize]);

  const filters = useMemo<ContractListParams>(
    () => {
      const poDate = poDateOptions[poDateFilter];
      const sortSelection = sortOptions[sort];

      return {
        status: status === "ALL" ? undefined : status,
        search: deferredSearch.trim() || undefined,
        poDateFrom: poDate.from,
        poDateTo: poDate.to,
        sortBy: sortSelection.sortBy,
        sortOrder: sortSelection.sortOrder,
        page,
        pageSize
      };
    },
    [deferredSearch, page, pageSize, poDateFilter, sort, status]
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

  const statisticsQuery = useQuery({
    queryKey: selectedOrganisationId
      ? queryKeys.contractStats(selectedOrganisationId)
      : ["contract-stats", "empty"],
    queryFn: async () => {
      if (!selectedOrganisationId) {
        throw new Error("No organisation selected");
      }

      return (await getContractStats(selectedOrganisationId)).data;
    },
    enabled: Boolean(selectedOrganisationId)
  });

  const contracts = contractsQuery.data?.data ?? [];
  const pagination = contractsQuery.data?.pagination;
  const statistics = buildStatistics(statisticsQuery.data);
  const isLoading = isLoadingOrganisations || contractsQuery.isLoading;
  const loadError =
    contractsQuery.error instanceof Error ? contractsQuery.error.message : null;

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[28px] font-semibold leading-tight text-foreground">
            Contracts
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {selectedOrganisation
              ? `Review intake, workflow status, and history for ${selectedOrganisation.name}.`
              : "Select an organisation to review its contract workspace."}
          </p>
        </div>
        <UploadJsonButton />
      </div>

      <section
        aria-label="Contract statistics"
        className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-card shadow-sm md:grid-cols-4"
      >
        {statistics.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className={cn(
                "p-4 sm:p-5",
                index < 2 && "border-b border-border",
                index % 2 === 0 && "border-r border-border",
                "md:border-b-0 md:border-r",
                index === statistics.length - 1 && "md:border-r-0"
              )}
            >
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Icon className="size-4" />
                {item.label}
              </div>
              <p className="mt-3 text-2xl font-semibold tabular-nums text-foreground">
                {item.value}
              </p>
            </div>
          );
        })}
      </section>

      <section>
        <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(280px,1.6fr)_minmax(150px,0.8fr)_minmax(160px,0.9fr)_minmax(175px,1fr)_120px] xl:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
              }}
              placeholder="Search client, contract number, or ID"
              className="pl-9"
            />
          </div>

            <Select
              value={status}
              onValueChange={(value) => setStatus(value as "ALL" | ContractStatus)}
            >
              <SelectTrigger aria-label="Filter by contract status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={poDateFilter}
              onValueChange={(value) => setPoDateFilter(value as keyof typeof poDateOptions)}
            >
              <SelectTrigger aria-label="Filter by PO date">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(poDateOptions).map(([value, option]) => (
                  <SelectItem key={value} value={value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={(value) => setSort(value as keyof typeof sortOptions)}>
              <SelectTrigger aria-label="Sort contracts">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(sortOptions).map(([value, option]) => (
                  <SelectItem key={value} value={value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={String(pageSize)} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger aria-label="Results per page">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="25">25 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
              </SelectContent>
            </Select>
        </div>
      </section>

      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <Table>
          <TableHeader className="bg-muted/70">
            <TableRow className="hover:bg-muted/70">
              <TableHead>
                <span className="border-b-2 border-primary pb-1">Contract</span>
              </TableHead>
              <TableHead>Client</TableHead>
              <TableHead className="hidden md:table-cell">PO reference</TableHead>
              <TableHead className="hidden lg:table-cell">PO date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden xl:table-cell">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell className="h-28 text-center text-muted-foreground" colSpan={6}>
                  Loading contracts...
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading && loadError ? (
              <TableRow>
                <TableCell className="h-28 text-center text-destructive" colSpan={6}>
                  {loadError}
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading && !loadError && contracts.length === 0 ? (
              <TableRow>
                <TableCell className="h-28 text-center text-muted-foreground" colSpan={6}>
                  No contracts match the current filters.
                </TableCell>
              </TableRow>
            ) : null}

            {!isLoading &&
              !loadError &&
              contracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell>
                    <Link
                      href={`/contracts/${contract.id}`}
                      className="font-semibold text-foreground hover:text-primary"
                    >
                      {contract.contractNumber}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground md:hidden">
                      {contract.poRefNo}
                    </p>
                  </TableCell>
                  <TableCell>
                    <p className="max-w-[11rem] truncate font-medium sm:max-w-none">
                      {contract.clientName}
                    </p>
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground md:table-cell">
                    {contract.poRefNo}
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground lg:table-cell">
                    {formatDate(contract.poDate)}
                  </TableCell>
                  <TableCell>
                    <ContractStatusBadge status={contract.status} />
                  </TableCell>
                  <TableCell className="hidden text-muted-foreground xl:table-cell">
                    {formatRelativeLabel(contract.updatedAt)}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>

        <div className="flex flex-col gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <span>
            {pagination
              ? `${contracts.length} of ${pagination.total} contracts`
              : "No contract data loaded"}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination || pagination.page <= 1}
              onClick={() => setPage((currentPage) => Math.max(currentPage - 1, 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!pagination || pagination.page >= pagination.totalPages}
              onClick={() => setPage((currentPage) => currentPage + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
