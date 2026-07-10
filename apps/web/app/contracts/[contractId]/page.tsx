import { ContractDetail } from "@/components/contracts/detail";
import { AppShell } from "@/components/layout/shell";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

type ContractDetailPageProps = {
  params: Promise<{
    contractId: string;
  }>;
};

export default async function ContractDetailPage({ params }: ContractDetailPageProps) {
  const { contractId } = await params;

  return (
    <AppShell>
      <div className="space-y-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Contracts
        </Link>

        <ContractDetail contractId={contractId} />
      </div>
    </AppShell>
  );
}
