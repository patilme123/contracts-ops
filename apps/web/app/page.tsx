import { AppShell } from "@/components/app-shell/app-shell";
import { ContractsOverview } from "@/components/contracts/contracts-overview";

export default function DashboardPage() {
  return (
    <AppShell>
      <ContractsOverview />
    </AppShell>
  );
}
