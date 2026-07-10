import type { ContractStatus } from "@contract-console/shared";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusStyles: Record<ContractStatus, string> = {
  DRAFT: "border-slate-200 bg-slate-50 text-slate-700",
  FINALIZED: "border-blue-200 bg-blue-50 text-blue-700",
  ARCHIVED: "border-slate-200 bg-slate-100 text-slate-500"
};

export function ContractStatusBadge({
  status,
  className
}: {
  status: ContractStatus;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn("h-6 px-2 uppercase", statusStyles[status], className)}
    >
      {status}
    </Badge>
  );
}
