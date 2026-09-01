import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Page, PageHeader } from "@/components/shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getAdminDashboard } from "@/lib/server/admin";
import { getPlanning } from "@/lib/server/erp";

export const Route = createFileRoute("/admin/$festivalId/publish")({
  component: PublishPage,
});

function PublishPage() {
  const { festivalId } = Route.useParams();
  const nav = useNavigate();
  const dash = useQuery({
    queryKey: ["admin", festivalId],
    queryFn: () => getAdminDashboard({ data: festivalId }),
  });
  const plan = useQuery({
    queryKey: ["plan", festivalId],
    queryFn: () => getPlanning({ data: festivalId }),
  });
  const f = dash.data?.festival;
  const items = plan.data?.items ?? [];
  const done = items.filter((i) => i.done).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;
  return (
    <Page>
      <PageHeader
        eyebrow="Go live"
        title="Preview & publish"
        description="Review the public festival, then confirm. Confirming opens the payment portal to select a package."
        actions={
          f ? (
            <Link to="/festivals/$slug" params={{ slug: f.slug }}>
              <Button variant="outline">Open public preview</Button>
            </Link>
          ) : null
        }
      />
      <div className="rounded-xl bg-surface p-6 shadow-[var(--shadow-border)]">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-display text-3xl">{f?.name ?? "Festival"}</p>
            <p className="mt-1 text-sm text-muted">
              {f?.city} · {f?.starts_on} – {f?.ends_on}
            </p>
          </div>
          {f ? <StatusBadge status={f.status} /> : null}
        </div>
        <p className="mt-6 text-xs tracking-wide text-muted uppercase">Planning completeness</p>
        <div className="mt-2 flex items-center gap-3">
          <Progress value={pct} className="flex-1" />
          <span className="tabular-nums text-sm text-muted">{pct}%</span>
        </div>
        <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
          {items.map((i) => (
            <li key={i.id} className={i.done ? "text-ok" : "text-muted"}>
              {i.done ? "Ready — " : "Open — "}
              {i.label}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-2">
          <Button
            onClick={() =>
              void nav({ to: "/pay", search: { festivalId } })
            }
          >
            Confirm publish — continue to payment
          </Button>
          <Link to="/admin/$festivalId/planning" params={{ festivalId }}>
            <Button variant="outline">Back to plan</Button>
          </Link>
        </div>
      </div>
    </Page>
  );
}
