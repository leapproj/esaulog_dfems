import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Page, PageHeader } from "@/components/shell";
import { StatusBadge } from "@/components/status-badge";
import { Progress } from "@/components/ui/progress";
import { rangeLabel } from "@/lib/format";
import { getAdminEvent } from "@/lib/server/admin";

export const Route = createFileRoute("/admin/$festivalId/events/$eventId")({
  component: EventDetail,
});

function EventDetail() {
  const { festivalId, eventId } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["admin-event", eventId],
    queryFn: () => getAdminEvent({ data: { festivalId, eventId } }),
  });
  const e = data?.event;
  const r = data?.readiness;
  if (!e) return <Page>Loading event…</Page>;
  return (
    <Page>
      <PageHeader
        eyebrow={e.event_type}
        title={e.name}
        description={`${e.venue_name ?? "Venue TBA"} · ${rangeLabel(e.starts_at, e.ends_at)}`}
      />
      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] md:col-span-1">
          <p className="text-xs tracking-wide text-muted uppercase">Readiness score</p>
          <p className="mt-2 font-display text-5xl tabular-nums">{r?.score ?? 0}%</p>
          <Progress className="mt-3" value={r?.score ?? 0} />
          <ul className="mt-5 space-y-2 text-sm">
            {(r?.items ?? []).map((i) => (
              <li key={i.key} className="flex justify-between">
                <span>{i.label}</span>
                <span className={i.ok ? "text-ok" : i.warn ? "text-warn" : "text-danger"}>
                  {i.ok ? "Ready" : i.warn ? "Watch" : "Missing"}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] md:col-span-2">
          <div className="flex items-center justify-between">
            <p className="text-xs tracking-wide text-muted uppercase">Record</p>
            <StatusBadge status={e.status} />
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted">{e.description}</p>
          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Organizer</dt>
              <dd>{e.organizer || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Capacity</dt>
              <dd className="tabular-nums">{e.capacity}</dd>
            </div>
            <div>
              <dt className="text-muted">Registration</dt>
              <dd>{e.registration_mode}</dd>
            </div>
            <div>
              <dt className="text-muted">Access</dt>
              <dd>{e.access_mode}</dd>
            </div>
            <div>
              <dt className="text-muted">Emergency</dt>
              <dd>{e.emergency_contact || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Registered / in</dt>
              <dd className="tabular-nums">
                {e.registered_count ?? 0} / {e.checkin_count ?? 0}
              </dd>
            </div>
          </dl>
          <h3 className="mt-8 text-xs tracking-wide text-muted uppercase">Gate access keys</h3>
          <ul className="mt-2 space-y-2">
            {(data?.keys ?? []).length === 0 ? (
              <li className="text-sm text-muted">None issued — AI Organizer will flag this.</li>
            ) : (
              data!.keys.map((k) => (
                <li key={k.id} className="flex justify-between font-mono text-sm">
                  <span>{k.code}</span>
                  <span className="text-muted">{k.staff_role}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </Page>
  );
}
