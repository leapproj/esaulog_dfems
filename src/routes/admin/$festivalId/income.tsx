import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Page, PageHeader, Stat } from "@/components/shell";
import { php } from "@/lib/format";
import { getFestivalIncome } from "@/lib/server/erp";

export const Route = createFileRoute("/admin/$festivalId/income")({
  component: IncomePage,
});

function IncomePage() {
  const { festivalId } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["income", festivalId],
    queryFn: () => getFestivalIncome({ data: festivalId }),
  });
  return (
    <Page>
      <PageHeader
        eyebrow="Ledger"
        title="Sponsor income"
        description={
          data?.copartner
            ? "Co-partner: TukodPH takes 30% of digital sponsor income. Physical festival sponsors stay with the organizer."
            : "Physical and digital sponsor income for this tenant."
        }
      />
      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Physical sponsors" value={data ? php(data.physical) : "—"} />
        <Stat label="Digital sponsors" value={data ? php(data.digital) : "—"} />
        <Stat
          label="TukodPH commission"
          value={data ? php(data.commission) : "—"}
          hint={data?.copartner ? "30% of digital only" : "Not a co-partner tenant"}
        />
      </div>
      <div className="mt-8 divide-y divide-border rounded-xl bg-surface shadow-[var(--shadow-border)]">
        {(data?.rows ?? []).map((r) => (
          <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="font-medium">{r.sponsor_name ?? "Unassigned"}</p>
              <p className="text-sm text-muted">
                {r.channel} · {r.recognized_on} · {r.note}
              </p>
            </div>
            <p className="tabular-nums">{php(r.amount_php)}</p>
          </div>
        ))}
      </div>
    </Page>
  );
}
