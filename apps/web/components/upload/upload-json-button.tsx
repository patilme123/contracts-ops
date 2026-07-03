"use client";

import { createContract } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { Button } from "@/components/ui/button";
import { contractPayloadSchema } from "@contract-console/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, X } from "lucide-react";
import { useState } from "react";
import { useOrganisationContext } from "../app-shell/organisation-provider";

export function UploadJsonButton() {
  const queryClient = useQueryClient();
  const { selectedOrganisationId } = useOrganisationContext();
  const [isOpen, setIsOpen] = useState(false);
  const [jsonText, setJsonText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOrganisationId) {
        throw new Error("Select an organisation before uploading.");
      }

      let parsedJson: unknown;

      try {
        parsedJson = JSON.parse(jsonText);
      } catch {
        throw new Error("JSON is not valid.");
      }

      const validationResult = contractPayloadSchema.safeParse(parsedJson);

      if (!validationResult.success) {
        const firstError = validationResult.error.issues[0];
        throw new Error(firstError?.message ?? "Contract JSON failed validation.");
      }

      return createContract(selectedOrganisationId, validationResult.data);
    },
    onSuccess: async () => {
      setJsonText("");
      setError(null);
      setIsOpen(false);

      if (selectedOrganisationId) {
        await queryClient.invalidateQueries({
          queryKey: ["contracts", selectedOrganisationId]
        });
        await queryClient.invalidateQueries({
          queryKey: queryKeys.contractStats(selectedOrganisationId)
        });
      }
    },
    onError: (mutationError) => {
      setError(mutationError instanceof Error ? mutationError.message : "Upload failed.");
    }
  });

  return (
    <>
      <Button type="button" onClick={() => setIsOpen(true)} disabled={!selectedOrganisationId}>
        <Upload className="size-4" />
        Upload JSON
      </Button>

      {isOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-2xl rounded-lg border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div>
                <h2 className="text-base font-semibold">Upload contract JSON</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Valid payloads are created as draft contracts.
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} aria-label="Close">
                <X className="size-4" />
              </Button>
            </div>

            <div className="space-y-4 p-5">
              <textarea
                value={jsonText}
                onChange={(event) => setJsonText(event.target.value)}
                className="min-h-[360px] w-full resize-y rounded-md border border-input bg-background p-4 font-mono text-sm leading-6 outline-none focus:ring-2 focus:ring-ring"
                placeholder='{"client_name":"Apex Manufacturing","po_ref_no":"PO-2026-1001","po_date":"2026-01-15","items":[{"description":"Service","quantity":1,"unit_price":100}]}'
              />

              {error ? (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
                  {error}
                </div>
              ) : null}

              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setIsOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || jsonText.trim().length === 0}
                >
                  <Upload className="size-4" />
                  {createMutation.isPending ? "Uploading" : "Create draft"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
