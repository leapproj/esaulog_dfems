import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Page, PageHeader } from "@/components/shell";
import { StatusBadge } from "@/components/status-badge";
import { php } from "@/lib/format";
import { getSspNetwork } from "@/lib/server/ssp";

export const Route = createFileRoute("/ssp/network")({ component: NetworkPage });

function NetworkPage() {
  const { data } = useQuery({ queryKey: ["ssp-network"], queryFn: () => getSspNetwork() });

  return (
    <Page>
      <PageHeader
        eyebrow="Network operations"
        title="Everything on the platform"
        description="Headquarters reads participants, sponsors, vendors, staff, and the income ledger across every festival tenant."
      />

      <Section title="Participants" count={data?.participants.length}>
        {(data?.participants ?? []).map((p: any) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <div>
              <p className="font-medium">{p.full_name}</p>
              <p className="text-sm text-muted">
                {p.city || "—"} · {p.email || "no email"}
              </p>
            </div>
            <div className="text-right text-sm">
              <Link
                to="/ssp/festivals/$festivalId"
                params={{ festivalId: p.festival_id }}
                className="text-muted hover:text-fg"
              >
                {p.festival_name}
              </Link>
              {p.credential_id ? (
                <p className="font-mono text-xs text-subtle">{p.credential_id}</p>
              ) : null}
            </div>
          </div>
        ))}
      </Section>

      <Section title="Sponsors" count={data?.sponsors.length}>
        {(data?.sponsors ?? []).map((s: any) => (
          <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="text-sm text-muted capitalize">{s.tier}</p>
            </div>
            <Link
              to="/ssp/festivals/$festivalId"
              params={{ festivalId: s.festival_id }}
              className="text-sm text-muted hover:text-fg"
            >
              {s.festival_name}
            </Link>
          </div>
        ))}
      </Section>

      <Section title="Vendors" count={data?.vendors.length}>
        {(data?.vendors ?? []).map((v: any) => (
          <div key={v.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <div>
              <p className="font-medium">{v.name}</p>
              <p className="text-sm text-muted capitalize">{v.category}</p>
            </div>
            <span className="text-sm text-muted">{v.festival_name}</span>
          </div>
        ))}
      </Section>

      <Section title="Staff & volunteers" count={data?.staff.length}>
        {(data?.staff ?? []).map((s: any) => (
          <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
            <div>
              <p className="font-medium">{s.full_name}</p>
              <p className="text-sm text-muted capitalize">
                {s.role} · {s.festival_name}
              </p>
            </div>
            <StatusBadge status={s.status} />
          </div>
        ))}
      </Section>

      <h2 className="mt-10 font-display text-2xl tracking-tight">Income ledger</h2>
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
            {(data?.income ?? []).map((i: any) => (
              <tr key={i.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 tabular-nums text-muted">{i.recognized_on}</td>
                <td className="px-4 py-3">{i.festival_name}</td>
                <td className="px-4 py-3">{i.sponsor_name ?? "—"}</td>
                <td className="px-4 py-3 capitalize">
                  {i.channel}
                  {i.copartner && i.channel === "digital" ? (
                    <span className="ml-2 text-xs text-accent">30%</span>
                  ) : null}
                </td>
                <td className="px-4 py-3 tabular-nums">{php(i.amount_php)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Page>
  );
}

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-2xl tracking-tight">
        {title}
        {count != null ? <span className="ml-2 text-base text-muted tabular-nums">{count}</span> : null}
      </h2>
      <div className="mt-3 divide-y divide-border rounded-xl bg-surface shadow-[var(--shadow-border)]">
        {children}
      </div>
    </section>
  );
}
