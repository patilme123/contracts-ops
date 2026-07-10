"use client";

import { cn } from "@/lib/utils";
import { useOrganisationContext } from "./provider";

export function ConnectionIndicator() {
  const { realtimeState } = useOrganisationContext();
  const isConnected = realtimeState === "connected";

  return (
    <div
      className={cn(
        "hidden items-center gap-2 text-xs font-medium lg:flex",
        isConnected ? "text-foreground" : "text-muted-foreground"
      )}
    >
      <span
        className={cn(
          "size-2 rounded-full",
          isConnected ? "bg-primary" : "bg-slate-300"
        )}
      />
      {isConnected ? "Live" : "Connecting"}
    </div>
  );
}
