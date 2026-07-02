import type { ContractStatus } from "@contract-console/shared";
import { cn } from "@/lib/utils";

type BadgeTone = "neutral" | "draft" | "finalized" | "archived" | "success" | "warning";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-border bg-muted text-muted-foreground",
  draft: "border-amber-200 bg-amber-50 text-amber-700",
  finalized: "border-emerald-200 bg-emerald-50 text-emerald-700",
  archived: "border-slate-200 bg-slate-100 text-slate-600",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700"
};

export function getStatusTone(status: ContractStatus): BadgeTone {
  if (status === "DRAFT") {
    return "draft";
  }

  if (status === "FINALIZED") {
    return "finalized";
  }

  return "archived";
}

export function Badge({
  className,
  tone = "neutral",
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-semibold uppercase tracking-normal",
        toneClasses[tone],
        className
      )}
      {...props}
    />
  );
}
