"use client";

import { Button } from "@/components/ui/button";
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
import { createContract } from "@/lib/api";
import { queryKeys } from "@/lib/queries";
import { formatValidationError } from "@/lib/validation";
import { contractPayloadSchema } from "@contract-console/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload } from "lucide-react";
import { useState } from "react";
import { useOrganisationContext } from "../layout/provider";

const defaultContractJson = JSON.stringify(
  {
    client_name: "Apex Manufacturing",
    po_ref_no: "PO-2026-1001",
    po_date: "2026-01-15",
    payment_terms: "Net 30",
    delivery_terms: "FOB Mumbai",
    items: [
      {
        description: "Industrial packing materials",
        quantity: 120,
        quantity_unit: "units",
        unit_price: 45,
        pricing_unit: "unit",
        total: 5400
      }
    ]
  },
  null,
  2
);

export function UploadJsonButton() {
  const queryClient = useQueryClient();
  const { selectedOrganisationId } = useOrganisationContext();
  const [isOpen, setIsOpen] = useState(false);
  const [jsonText, setJsonText] = useState(defaultContractJson);
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
        throw new Error(formatValidationError(validationResult.error));
      }

      return createContract(selectedOrganisationId, validationResult.data);
    },
    onSuccess: async () => {
      setJsonText(defaultContractJson);
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
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);

        if (open && jsonText.trim().length === 0) {
          setJsonText(defaultContractJson);
        }

        if (!open) {
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" disabled={!selectedOrganisationId}>
          <Upload />
          Upload contract JSON
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload contract JSON</DialogTitle>
          <DialogDescription>
            Edit this JSON payload, then create a validated draft contract.
          </DialogDescription>
        </DialogHeader>

        <Textarea
          value={jsonText}
          onChange={(event) => setJsonText(event.target.value)}
          className="min-h-[360px] resize-y p-4 font-mono leading-6"
          aria-label="Contract JSON"
        />

        {error ? (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700"
          >
            {error}
          </p>
        ) : null}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={createMutation.isPending}>
              Cancel
            </Button>
          </DialogClose>
          <Button
            type="button"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending || jsonText.trim().length === 0}
          >
            <Upload />
            {createMutation.isPending ? "Uploading" : "Create draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
