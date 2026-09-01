import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Page, PageHeader, Stat } from "@/components/shell";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { compact, php } from "@/lib/format";
import { getSspIntelligence } from "@/lib/server/ssp";

export const Route = createFileRoute("/ssp/analytics")({ component: IntelligencePage });

const TOOLTIP = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-fg)",
  borderRadius: 8,
  fontSize: 12,
};

function IntelligencePage() {
  const { data, isLoading } = useQuery({ queryKey: ["ssp-intel"], queryFn: () => getSspIntelligence() });
  const t = data?.totals;
  const chart = (data?.byFestival ?? []).map((f: any) => ({
    name: f.name.replace(/ 20\d\d/, ""),
    physical: f.physical,
    digital: f.digital,
    commission: f.commission ?? (f.copartner ? Math.round(f.digital * 0.25) : 0),
  }));
  const mix = [
    { name: "Physical", value: t?.physical ?? 0, fill: "var(--color-muted)" },
    { name: "Digital", value: t?.digital ?? 0, fill: "var(--color-accent)" },
  ];
  const ranked = [...(data?.byFestival ?? [])].sort(
    (a: any, b: any) => b.turnout + b.checkins - (a.turnout + a.checkins),
  );

  if (isLoading) {
    return (
      <Page>
        <Skeleton className="h-8 w-72" />
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="mt-8 h-64 rounded-xl" />
      </Page>
    );
  }

  return (
    <Page>
      <PageHeader
        eyebrow="Business intelligence"
        title="Festival intelligence"
        description="Network analytics for TukodPH Headquarters: turnout, conversion, sponsor mix, income ledger, and co-partner commission (30% of digital only)."
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Turnout" value={t ? compact(t.turnout) : "—"} hint="Registered participants" />
        <Stat label="Check-ins" value={t ? compact(t.checkins) : "—"} />
        <Stat label="Physical income" value={t ? php(t.physical) : "—"} />
        <Stat label="Digital income" value={t ? php(t.digital) : "—"} />
        <Stat
          label="Co-partner 30%"
          value={data ? php(data.commission) : "—"}
          hint="Digital only"
        />
      </div>

      <div className="mt-8 grid gap-3 lg:grid-cols-3">
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] lg:col-span-2">
          <p className="mb-4 text-xs tracking-wide text-muted uppercase">Sponsor income by tenant</p>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chart}>
              <CartesianGrid stroke="color-mix(in oklab, var(--color-fg) 8%, transparent)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "var(--color-muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--color-muted)", fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP} />
              <Bar dataKey="physical" fill="var(--color-muted)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="digital" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="commission" fill="var(--color-magenta)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="mb-4 text-xs tracking-wide text-muted uppercase">Income mix</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={mix} dataKey="value" nameKey="name" innerRadius={48} outerRadius={72} paddingAngle={3}>
                {mix.map((d) => (
                  <Cell key={d.name} fill={d.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={TOOLTIP} formatter={(v: number) => php(v)} />
            </PieChart>
          </ResponsiveContainer>
          <ul className="mt-2 space-y-1 text-sm">
            {mix.map((d) => (
              <li key={d.name} className="flex justify-between">
                <span className="text-muted">{d.name}</span>
                <span className="tabular-nums">{php(d.value)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="text-xs tracking-wide text-muted uppercase">Season status</p>
          <ul className="mt-3 space-y-2 text-sm">
            {(data?.statusMix ?? []).map((r: { status: string; n: number }) => (
              <li key={r.status} className="flex items-center justify-between">
                <StatusBadge status={r.status} />
                <span className="tabular-nums text-muted">{r.n} tenants</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="text-xs tracking-wide text-muted uppercase">Event types</p>
          <ul className="mt-3 space-y-2 text-sm">
            {(data?.eventMix ?? []).map((r: { event_type: string; n: number }) => (
              <li key={r.event_type} className="flex justify-between capitalize">
                <span>{r.event_type}</span>
                <span className="tabular-nums text-muted">{r.n}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-3 lg:grid-cols-2">
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="mb-4 text-xs tracking-wide text-muted uppercase">Conversion by tenant</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={ranked.map((f: any) => ({
                name: String(f.name).replace(/ 20\d\d/, ""),
                conversion: f.turnout ? Math.round((f.checkins / f.turnout) * 100) : 0,
              }))}
            >
              <CartesianGrid stroke="color-mix(in oklab, var(--color-fg) 8%, transparent)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "var(--color-muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--color-muted)", fontSize: 11 }} unit="%" />
              <Tooltip contentStyle={TOOLTIP} />
              <Bar dataKey="conversion" fill="var(--color-ok)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="text-xs tracking-wide text-muted uppercase">Participant cities</p>
          <ul className="mt-3 space-y-2 text-sm">
            {(data?.cityMix ?? []).length === 0 ? (
              <li className="text-muted">No city data yet.</li>
            ) : (
              (data?.cityMix ?? []).map((r: { city: string; n: number }) => (
                <li key={r.city} className="flex justify-between">
                  <span>{r.city}</span>
                  <span className="tabular-nums text-muted">{compact(r.n)}</span>
                </li>
              ))
            )}
          </ul>
          <p className="mt-4 text-xs tracking-wide text-muted uppercase">Co-partner commission</p>
          <ul className="mt-3 space-y-2 text-sm">
            {(data?.byFestival ?? [])
              .filter((f: { copartner: boolean }) => f.copartner)
              .map((f: any) => (
                <li key={f.id} className="flex justify-between">
                  <span>{f.name}</span>
                  <span className="tabular-nums">{php(Math.round(f.digital * 0.3))}</span>
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="text-xs tracking-wide text-muted uppercase">
            <tr className="border-b border-border">
              <th className="px-4 py-3">Festival</th>
              <th className="px-4 py-3">Turnout</th>
              <th className="px-4 py-3">In</th>
              <th className="px-4 py-3">Conversion</th>
              <th className="px-4 py-3">Physical</th>
              <th className="px-4 py-3">Digital</th>
              <th className="px-4 py-3">Model</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((f: any) => {
              const conv = f.turnout ? Math.round((f.checkins / f.turnout) * 100) : 0;
              return (
                <tr key={f.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <Link
                      to="/ssp/festivals/$festivalId"
                      params={{ festivalId: f.id }}
                      className="font-medium hover:underline"
                    >
                      {f.name}
                    </Link>
                    <div className="mt-1">
                      <StatusBadge status={f.status} />
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{compact(f.turnout)}</td>
                  <td className="px-4 py-3 tabular-nums">{compact(f.checkins)}</td>
                  <td className="px-4 py-3 tabular-nums">{conv}%</td>
                  <td className="px-4 py-3 tabular-nums">{php(f.physical)}</td>
                  <td className="px-4 py-3 tabular-nums">{php(f.digital)}</td>
                  <td className="px-4 py-3 text-muted">
                    {f.copartner ? "Co-partner 30%" : "Self-serve"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 font-display text-2xl tracking-tight">Income ledger</h2>
      <p className="mt-1 text-sm text-muted">
        Physical stays with the organizer. Digital on co-partner tenants is 30% TukodPH.
      </p>
      <div className="mt-3 overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs tracking-wide text-muted uppercase">
            <tr className="border-b border-border">
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Festival</th>
              <th className="px-4 py-3">Sponsor</th>
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3">Amount</th>
            </tr>
          </thead>
          <tbody>
            {(data?.income ?? []).length === 0 ? (
              <tr>
                <td className="px-4 py-6 text-muted" colSpan={5}>
                  No income recognized yet.
                </td>
              </tr>
            ) : (
              (data?.income ?? []).map((i: any) => (
                <tr key={i.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 tabular-nums text-muted">{i.recognized_on}</td>
                  <td className="px-4 py-3">{i.festival_name}</td>
                  <td className="px-4 py-3">{i.sponsor_name ?? "—"}</td>
                  <td className="px-4 py-3 capitalize">{i.channel}</td>
                  <td className="px-4 py-3 tabular-nums">{php(i.amount_php)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Page>
  );
}
