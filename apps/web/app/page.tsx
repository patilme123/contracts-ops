import { ContractsOverview } from "@/components/contracts/overview";
import { AppShell } from "@/components/layout/shell";

export default function DashboardPage() {
  return (
    <AppShell>
      <ContractsOverview />
    </AppShell>
  );
}
