import { AppShell } from "@/components/app-shell/app-shell";
import { AuditTrailPreview } from "@/components/audit-trail/audit-trail-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Archive, CheckCircle2, Save } from "lucide-react";
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
      <div className="space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Contracts
        </Link>

        <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-normal">Contract {contractId}</h1>
              <Badge tone="draft">Draft</Badge>
            </div>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
              Review contract payload, manage draft changes, move the agreement through workflow,
              and inspect the audit history.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary">
              <Save className="size-4" />
              Save draft
            </Button>
            <Button>
              <CheckCircle2 className="size-4" />
              Finalize
            </Button>
            <Button variant="secondary">
              <Archive className="size-4" />
              Archive
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader>
              <CardTitle>Contract payload</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="min-h-[420px] overflow-auto rounded-md border border-border bg-muted/60 p-4 text-sm leading-6 text-foreground">
{`{
  "client_name": "Apex Manufacturing",
  "po_ref_no": "PO-2026-1001",
  "po_date": "2026-01-15",
  "payment_terms": "Net 30",
  "items": []
}`}
              </pre>
            </CardContent>
          </Card>

          <AuditTrailPreview />
        </div>
      </div>
    </AppShell>
  );
}
