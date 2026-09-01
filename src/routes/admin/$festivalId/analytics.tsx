import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Page, PageHeader } from "@/components/shell";
import { getAdminAnalytics } from "@/lib/server/admin";

export const Route = createFileRoute("/admin/$festivalId/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { festivalId } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["analytics", festivalId],
    queryFn: () => getAdminAnalytics({ data: festivalId }),
  });
  return (
    <Page>
      <PageHeader
        eyebrow="Festival intelligence"
        title="Analytics"
        description="Pre-event interest, during-event traffic, post-event performance — from the same event log."
      />
      <div className="grid gap-3 lg:grid-cols-2">
        <ChartCard title="Activity by day">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.byDay ?? []}>
              <CartesianGrid stroke="rgba(242,239,230,0.08)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "#9a9588", fontSize: 11 }} />
              <YAxis tick={{ fill: "#9a9588", fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: "#141612", border: "1px solid #2a2c26", color: "#f2efe6" }}
              />
              <Bar dataKey="n" fill="#d8ddd4" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Event performance">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.eventPerf ?? []} layout="vertical" margin={{ left: 80 }}>
              <CartesianGrid stroke="rgba(242,239,230,0.08)" horizontal={false} />
              <XAxis type="number" tick={{ fill: "#9a9588", fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={80} tick={{ fill: "#9a9588", fontSize: 10 }} />
              <Tooltip
                contentStyle={{ background: "#141612", border: "1px solid #2a2c26", color: "#f2efe6" }}
              />
              <Bar dataKey="registered" fill="#9a9588" radius={[0, 4, 4, 0]} />
              <Bar dataKey="checkins" fill="#d8ddd4" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="text-xs tracking-wide text-muted uppercase">Event stream</p>
          <ul className="mt-3 space-y-2 text-sm">
            {(data?.byName ?? []).map((r) => (
              <li key={r.name} className="flex justify-between">
                <span className="font-mono text-xs">{r.name}</span>
                <span className="tabular-nums text-muted">{r.n}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="text-xs tracking-wide text-muted uppercase">Origin cities</p>
          <ul className="mt-3 space-y-2 text-sm">
            {(data?.cities ?? []).map((r) => (
              <li key={r.city} className="flex justify-between">
                <span>{r.city || "Unknown"}</span>
                <span className="tabular-nums text-muted">{r.n}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Page>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
      <p className="mb-4 text-xs tracking-wide text-muted uppercase">{title}</p>
      {children}
    </div>
  );
}
