import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Page, PageHeader, Stat } from "@/components/shell";
import { StatusBadge } from "@/components/status-badge";
import { Progress } from "@/components/ui/progress";
import { compact, rangeLabel } from "@/lib/format";
import { getAdminDashboard } from "@/lib/server/admin";

export const Route = createFileRoute("/admin/$festivalId/")({ component: AdminHome });

function AdminHome() {
  const { festivalId } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["admin", festivalId],
    queryFn: () => getAdminDashboard({ data: festivalId }),
  });
  const f = data?.festival;
  const s = data?.stats;
  return (
    <Page>
      <PageHeader
        eyebrow="Festival command center"
        title={f?.name ?? "Festival"}
        description={f ? `${f.city} · ${f.hero_kicker}` : "Loading tenant…"}
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <Stat label="Participants" value={s ? compact(s.participants) : "—"} />
        <Stat label="Events" value={s?.events ?? "—"} />
        <Stat label="Today’s events" value={s?.today_events ?? "—"} />
        <Stat label="Check-ins" value={s ? compact(s.checkins) : "—"} />
        <Stat label="Active keys" value={s?.gate_keys ?? "—"} />
        <Stat label="Vendors" value={s?.vendors ?? "—"} />
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="text-xs tracking-wide text-muted uppercase">Engagement</p>
          <p className="mt-2 font-display text-4xl tabular-nums">{data?.engagement ?? 0}%</p>
          <Progress className="mt-3" value={data?.engagement ?? 0} />
        </div>
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="text-xs tracking-wide text-muted uppercase">Festival readiness</p>
          <p className="mt-2 font-display text-4xl tabular-nums">{data?.readiness ?? 0}%</p>
          <Progress className="mt-3" value={data?.readiness ?? 0} />
        </div>
      </div>
      <h2 className="mt-10 font-display text-2xl">Program</h2>
      <div className="mt-3 divide-y divide-border rounded-xl bg-surface shadow-[var(--shadow-border)]">
        {(data?.events ?? []).map((e) => (
          <Link
            key={e.id}
            to="/admin/$festivalId/events/$eventId"
            params={{ festivalId, eventId: e.id }}
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-surface-2"
          >
            <div>
              <p className="font-medium">{e.name}</p>
              <p className="text-sm text-muted">
                {e.venue_name ?? "Venue TBA"} · {rangeLabel(e.starts_at, e.ends_at)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted tabular-nums">
                {e.checkin_count ?? 0}/{e.registered_count ?? 0}
              </span>
              <StatusBadge status={e.status} />
            </div>
          </Link>
        ))}
      </div>
    </Page>
  );
}
