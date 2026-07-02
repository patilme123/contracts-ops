import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock3, FilePenLine } from "lucide-react";

const events = [
  {
    id: "created",
    icon: FilePenLine,
    title: "Created",
    time: "Jan 15, 2026, 10:15 AM"
  },
  {
    id: "updated",
    icon: Clock3,
    title: "Updated",
    time: "Jan 16, 2026, 2:40 PM"
  },
  {
    id: "finalized",
    icon: CheckCircle2,
    title: "Finalized",
    time: "Pending"
  }
];

export function AuditTrailPreview() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit trail</CardTitle>
      </CardHeader>
      <CardContent>
        <ol className="space-y-4">
          {events.map((event) => {
            const Icon = event.icon;

            return (
              <li key={event.id} className="flex gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted">
                  <Icon className="size-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{event.title}</p>
                  <p className="text-sm text-muted-foreground">{event.time}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
