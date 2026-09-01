import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Page, PageHeader } from "@/components/shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { rangeLabel } from "@/lib/format";
import { getAdminEvents } from "@/lib/server/admin";

export const Route = createFileRoute("/admin/$festivalId/events")({ component: EventsPage });

function EventsPage() {
  const { festivalId } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["admin-events", festivalId],
    queryFn: () => getAdminEvents({ data: festivalId }),
  });
  return (
    <Page>
      <PageHeader
        eyebrow="Program"
        title="Event management"
        description="Events are created as a wizard, not a single complicated form."
        actions={
          <Link to="/admin/$festivalId/events/new" params={{ festivalId }}>
            <Button>Create event</Button>
          </Link>
        }
      />
      <div className="overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs tracking-wide text-muted uppercase">
            <tr className="border-b border-border">
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Pax</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data?.events ?? []).map((e) => (
              <tr key={e.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <Link
                    to="/admin/$festivalId/events/$eventId"
                    params={{ festivalId, eventId: e.id }}
                    className="font-medium hover:underline"
                  >
                    {e.name}
                  </Link>
                  <p className="text-xs text-muted">{e.venue_name ?? "TBA"}</p>
                </td>
                <td className="px-4 py-3 text-muted">{rangeLabel(e.starts_at, e.ends_at)}</td>
                <td className="px-4 py-3 capitalize">{e.event_type}</td>
                <td className="px-4 py-3 tabular-nums">
                  {e.checkin_count ?? 0}/{e.registered_count ?? 0}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={e.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Page>
  );
}
