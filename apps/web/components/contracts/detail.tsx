"use client";

import { ContractStatusBadge } from "@/components/contracts/status";
import { useOrganisationContext } from "@/components/layout/provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  archiveContract,
  deleteContract,
  finalizeContract,
  getContract,
  listContractEvents,
  updateContract
} from "@/lib/api";
import { formatRelativeLabel } from "@/lib/format";
import { queryKeys } from "@/lib/queries";
import { formatValidationError } from "@/lib/validation";
import { contractPayloadSchema, type ContractEvent } from "@contract-console/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, CheckCircle2, LoaderCircle, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function describeEvent(event: ContractEvent) {
  if (event.previousStatus && event.nextStatus && event.previousStatus !== event.nextStatus) {
    return `${event.previousStatus} to ${event.nextStatus}`;
  }

  return event.summary;
}

function LoadingPanel({ message }: { message: string }) {
  return (
    <div className="flex min-h-48 items-center justify-center rounded-lg border border-border bg-card text-sm text-muted-foreground shadow-sm">
      <LoaderCircle className="mr-2 size-4 animate-spin" />
      {message}
    </div>
  );
}

export function ContractDetail({ contractId }: { contractId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedOrganisationId } = useOrganisationContext();
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const contractQuery = useQuery({
    queryKey: selectedOrganisationId
      ? queryKeys.contract(selectedOrganisationId, contractId)
      : ["contract", "empty", contractId],
    queryFn: async () => {
      if (!selectedOrganisationId) {
        throw new Error("No organisation selected");
      }

      return (await getContract(selectedOrganisationId, contractId)).data;
    },
    enabled: Boolean(selectedOrganisationId)
  });

  const eventsQuery = useQuery({
    queryKey: selectedOrganisationId
      ? queryKeys.contractEvents(selectedOrganisationId, contractId)
      : ["contract-events", "empty", contractId],
    queryFn: async () => {
      if (!selectedOrganisationId) {
        throw new Error("No organisation selected");
      }

      return (await listContractEvents(selectedOrganisationId, contractId)).data;
    },
    enabled: Boolean(selectedOrganisationId)
  });

  const contract = contractQuery.data;
  const isDraft = contract?.status === "DRAFT";
  const isFinalized = contract?.status === "FINALIZED";

  useEffect(() => {
    if (contract?.fieldData) {
      setJsonText(JSON.stringify(contract.fieldData, null, 2));
    }
  }, [contract?.fieldData]);

  async function refreshContractState() {
    if (!selectedOrganisationId) {
      return;
    }

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeys.contract(selectedOrganisationId, contractId)
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.contractEvents(selectedOrganisationId, contractId)
      }),
      queryClient.invalidateQueries({
        queryKey: ["contracts", selectedOrganisationId]
      }),
      queryClient.invalidateQueries({
        queryKey: queryKeys.contractStats(selectedOrganisationId)
      })
    ]);
  }

  function setMutationError(mutationError: unknown, fallback: string) {
    setError(mutationError instanceof Error ? mutationError.message : fallback);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOrganisationId) {
        throw new Error("No organisation selected");
      }

      let parsedJson: unknown;

      try {
        parsedJson = JSON.parse(jsonText);
      } catch {
        throw new Error("JSON is not valid.");
      }

      const validationResult = contractPayloadSchema.safeParse(parsedJson);

      if (!validationResult.success) {
        throw new Error(formatValidationError(validationResult.error));
      }

      return updateContract(selectedOrganisationId, contractId, validationResult.data);
    },
    onMutate: () => setError(null),
    onSuccess: refreshContractState,
    onError: (mutationError) => setMutationError(mutationError, "Save failed.")
  });

  const finalizeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOrganisationId) {
        throw new Error("No organisation selected");
      }

      return finalizeContract(selectedOrganisationId, contractId);
    },
    onMutate: () => setError(null),
    onSuccess: refreshContractState,
    onError: (mutationError) => setMutationError(mutationError, "Finalization failed.")
  });

  const archiveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOrganisationId) {
        throw new Error("No organisation selected");
      }

      return archiveContract(selectedOrganisationId, contractId);
    },
    onMutate: () => setError(null),
    onSuccess: refreshContractState,
    onError: (mutationError) => setMutationError(mutationError, "Archiving failed.")
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOrganisationId) {
        throw new Error("No organisation selected");
      }

      return deleteContract(selectedOrganisationId, contractId);
    },
    onMutate: () => setError(null),
    onSuccess: async () => {
      setIsDeleteOpen(false);
      await queryClient.invalidateQueries({
        queryKey: ["contracts", selectedOrganisationId]
      });
      router.push("/");
    },
    onError: (mutationError) => {
      setIsDeleteOpen(false);
      setMutationError(mutationError, "Delete failed.");
    }
  });

  if (!selectedOrganisationId) {
    return <LoadingPanel message="Loading organisation..." />;
  }

  if (contractQuery.isLoading) {
    return <LoadingPanel message="Loading contract..." />;
  }

  if (contractQuery.isError) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
        {contractQuery.error instanceof Error
          ? contractQuery.error.message
          : "Unable to load this contract."}
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
        Contract was not found for the selected organisation.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[28px] font-semibold leading-tight text-foreground">
              {contract.contractNumber}
            </h1>
            <ContractStatusBadge status={contract.status} />
          </div>
          <p className="mt-2 text-sm font-medium text-foreground">{contract.clientName}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {contract.poRefNo} · Updated {formatRelativeLabel(contract.updatedAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isDraft ? (
            <>
              <Button
                variant="outline"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
              >
                <Save />
                {saveMutation.isPending ? "Saving" : "Save draft"}
              </Button>
              <Button
                onClick={() => finalizeMutation.mutate()}
                disabled={finalizeMutation.isPending}
              >
                <CheckCircle2 />
                {finalizeMutation.isPending ? "Finalizing" : "Finalize"}
              </Button>

              <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="text-destructive hover:bg-red-50 hover:text-destructive"
                  >
                    <Trash2 />
                    Delete
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Delete draft contract?</DialogTitle>
                    <DialogDescription>
                      This removes {contract.contractNumber} from active contract lists and records
                      a deletion event in its audit history.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline" disabled={deleteMutation.isPending}>
                        Cancel
                      </Button>
                    </DialogClose>
                    <Button
                      variant="destructive"
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? "Deleting" : "Delete contract"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          ) : null}

          {isFinalized ? (
            <Button
              onClick={() => archiveMutation.mutate()}
              disabled={archiveMutation.isPending}
            >
              <Archive />
              {archiveMutation.isPending ? "Archiving" : "Archive"}
            </Button>
          ) : null}
        </div>
      </div>

      {error ? (
        <p
          role="alert"
          className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {error}
        </p>
      ) : null}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardHeader>
            <CardTitle>Contract payload</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={jsonText}
              onChange={(event) => setJsonText(event.target.value)}
              readOnly={!isDraft}
              className="min-h-[520px] resize-y border-0 bg-muted/60 p-4 font-mono text-[13px] leading-6 shadow-none focus-visible:ring-1 read-only:cursor-default"
              aria-label="Contract JSON"
            />
            {!isDraft ? (
              <p className="mt-3 text-xs text-muted-foreground">
                Finalized and archived contracts are read-only.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="lg:sticky lg:top-24">
          <CardHeader>
            <CardTitle>Audit trail</CardTitle>
          </CardHeader>
          <CardContent>
            {eventsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading history...</p>
            ) : null}

            {eventsQuery.isError ? (
              <p className="text-sm text-destructive">Unable to load audit history.</p>
            ) : null}

            {!eventsQuery.isLoading && !eventsQuery.isError && eventsQuery.data?.length === 0 ? (
              <p className="text-sm text-muted-foreground">No audit events recorded.</p>
            ) : null}

            <ol className="ml-1 border-l border-border">
              {(eventsQuery.data ?? []).map((event) => (
                <li key={event.id} className="relative pb-6 pl-5 last:pb-0">
                  <span className="absolute -left-[5px] top-1.5 size-2 rounded-full bg-primary ring-4 ring-card" />
                  <p className="text-sm font-semibold text-foreground">{event.summary}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{describeEvent(event)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatRelativeLabel(event.createdAt)}
                  </p>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
