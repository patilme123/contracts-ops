"use client";

import { listOrganisations } from "@/lib/api";
import { queryKeys } from "@/lib/queries";
import { subscribeToContractEvents } from "@/lib/realtime";
import type { OrganisationSummary } from "@contract-console/shared";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

type RealtimeState = "connecting" | "connected" | "disconnected";

type OrganisationContextValue = {
  organisations: OrganisationSummary[];
  selectedOrganisationId: string | null;
  selectedOrganisation: OrganisationSummary | null;
  setSelectedOrganisationId: (organisationId: string) => void;
  isLoadingOrganisations: boolean;
  realtimeState: RealtimeState;
};

const OrganisationContext = createContext<OrganisationContextValue | null>(null);

export function OrganisationProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [selectedOrganisationId, setSelectedOrganisationIdState] = useState<string | null>(null);
  const [realtimeState, setRealtimeState] = useState<RealtimeState>("disconnected");

  const organisationsQuery = useQuery({
    queryKey: queryKeys.organisations,
    queryFn: async () => (await listOrganisations()).data
  });

  const organisations = organisationsQuery.data ?? [];

  useEffect(() => {
    if (selectedOrganisationId || organisations.length === 0) {
      return;
    }

    const storedOrganisationId = window.localStorage.getItem("selectedOrganisationId");
    const nextOrganisationId =
      organisations.find((organisation) => organisation.id === storedOrganisationId)?.id ??
      organisations[0]?.id ??
      null;

    setSelectedOrganisationIdState(nextOrganisationId);
  }, [organisations, selectedOrganisationId]);

  useEffect(() => {
    if (!selectedOrganisationId) {
      setRealtimeState("disconnected");
      return;
    }

    setRealtimeState("connecting");

    return subscribeToContractEvents(selectedOrganisationId, {
      onOpen: () => setRealtimeState("connected"),
      onError: () => setRealtimeState("disconnected"),
      onStatusChanged: (event) => {
        queryClient.invalidateQueries({
          queryKey: ["contracts", selectedOrganisationId]
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.contractStats(selectedOrganisationId)
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.contract(selectedOrganisationId, event.contractId)
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.contractEvents(selectedOrganisationId, event.contractId)
        });
      }
    });
  }, [queryClient, selectedOrganisationId]);

  const selectedOrganisation =
    organisations.find((organisation) => organisation.id === selectedOrganisationId) ?? null;

  const value = useMemo(
    () => ({
      organisations,
      selectedOrganisationId,
      selectedOrganisation,
      setSelectedOrganisationId(organisationId: string) {
        window.localStorage.setItem("selectedOrganisationId", organisationId);
        setSelectedOrganisationIdState(organisationId);
      },
      isLoadingOrganisations: organisationsQuery.isLoading,
      realtimeState
    }),
    [
      organisations,
      organisationsQuery.isLoading,
      realtimeState,
      selectedOrganisation,
      selectedOrganisationId
    ]
  );

  return <OrganisationContext.Provider value={value}>{children}</OrganisationContext.Provider>;
}

export function useOrganisationContext() {
  const value = useContext(OrganisationContext);

  if (!value) {
    throw new Error("useOrganisationContext must be used inside OrganisationProvider");
  }

  return value;
}
