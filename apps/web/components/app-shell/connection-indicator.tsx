"use client";

import { cn } from "@/lib/utils";
import { Wifi } from "lucide-react";
import { useOrganisationContext } from "./organisation-provider";

export function ConnectionIndicator() {
  const { realtimeState } = useOrganisationContext();
  const isConnected = realtimeState === "connected";

  return (
    <div
      className={cn(
        "hidden items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium md:flex",
        isConnected
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-border bg-card text-muted-foreground"
      )}
    >
      <Wifi className="size-4" />
      {isConnected ? "Live" : "Connecting"}
    </div>
  );
}
