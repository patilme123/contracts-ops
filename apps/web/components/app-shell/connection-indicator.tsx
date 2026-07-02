import { Wifi } from "lucide-react";

export function ConnectionIndicator() {
  return (
    <div className="hidden items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 md:flex">
      <Wifi className="size-4" />
      Live
    </div>
  );
}
