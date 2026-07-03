"use client";

import { useOrganisationContext } from "@/components/app-shell/organisation-provider";
import { Badge, getStatusTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  archiveContract,
  deleteContract,
  finalizeContract,
  getContract,
  listContractEvents,
  updateContract
} from "@/lib/api";
import { formatRelativeLabel } from "@/lib/formatters";
import { queryKeys } from "@/lib/query-keys";
import { contractPayloadSchema, type ContractEvent } from "@contract-console/shared";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, CheckCircle2, FilePenLine, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

function describeEvent(event: ContractEvent) {
  if (event.previousStatus && event.nextStatus && event.previousStatus !== event.nextStatus) {
    return `${event.previousStatus} -> ${event.nextStatus}`;
  }

  return event.summary;
}

export function ContractDetail({ contractId }: { contractId: string }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { selectedOrganisationId } = useOrganisationContext();
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);

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
        throw new Error(
          validationResult.error.issues[0]?.message ?? "Contract JSON failed validation."
        );
      }

      return updateContract(selectedOrganisationId, contractId, validationResult.data);
    },
    onSuccess: async () => {
      setError(null);
      await refreshContractState();
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Save failed.");
    }
  });

  const finalizeMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOrganisationId) {
        throw new Error("No organisation selected");
      }

      return finalizeContract(selectedOrganisationId, contractId);
    },
    onSuccess: refreshContractState
  });

  const archiveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOrganisationId) {
        throw new Error("No organisation selected");
      }

      return archiveContract(selectedOrganisationId, contractId);
    },
    onSuccess: refreshContractState
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOrganisationId) {
        throw new Error("No organisation selected");
      }

      return deleteContract(selectedOrganisationId, contractId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["contracts", selectedOrganisationId]
      });
      router.push("/");
    }
  });

  if (!selectedOrganisationId) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Loading organisation context
        </CardContent>
      </Card>
    );
  }

  if (contractQuery.isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Loading contract
        </CardContent>
      </Card>
    );
  }

  if (!contract) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Contract was not found for the selected organisation.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-3 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-normal">
              Contract {contract.contractNumber}
            </h1>
            <Badge tone={getStatusTone(contract.status)}>{contract.status}</Badge>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {contract.clientName} · {contract.poRefNo} · Last updated{" "}
            {formatRelativeLabel(contract.updatedAt)}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isDraft ? (
            <>
              <Button
                variant="secondary"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
              >
                <Save className="size-4" />
                {saveMutation.isPending ? "Saving" : "Save draft"}
              </Button>
              <Button onClick={() => finalizeMutation.mutate()} disabled={finalizeMutation.isPending}>
                <CheckCircle2 className="size-4" />
                {finalizeMutation.isPending ? "Finalizing" : "Finalize"}
              </Button>
              <Button
                variant="destructive"
                onClick={() => deleteMutation.mutate()}
                disabled={deleteMutation.isPending}
              >
                <Trash2 className="size-4" />
                Delete
              </Button>
            </>
          ) : null}

          {isFinalized ? (
            <Button onClick={() => archiveMutation.mutate()} disabled={archiveMutation.isPending}>
              <Archive className="size-4" />
              {archiveMutation.isPending ? "Archiving" : "Archive"}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Contract payload</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <textarea
              value={jsonText}
              onChange={(event) => setJsonText(event.target.value)}
              readOnly={!isDraft}
              className="min-h-[460px] w-full resize-y rounded-md border border-border bg-muted/40 p-4 font-mono text-sm leading-6 text-foreground outline-none focus:ring-2 focus:ring-ring read-only:cursor-default read-only:bg-muted/60"
            />
            {error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}
            {!isDraft ? (
              <p className="text-sm text-muted-foreground">
                Finalized and archived contracts are read-only.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Audit trail</CardTitle>
          </CardHeader>
          <CardContent>
            {eventsQuery.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading audit trail</p>
            ) : null}
            <ol className="space-y-4">
              {(eventsQuery.data ?? []).map((event) => (
                <li key={event.id} className="flex gap-3">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                    <FilePenLine className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{event.summary}</p>
                    <p className="text-sm text-muted-foreground">{describeEvent(event)}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatRelativeLabel(event.createdAt)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
