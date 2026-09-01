import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Page, PageHeader } from "@/components/shell";
import { getSspOverview } from "@/lib/server/ssp";

export const Route = createFileRoute("/ssp/organizations")({ component: OrgsPage });

function OrgsPage() {
  const { data } = useQuery({ queryKey: ["ssp"], queryFn: () => getSspOverview() });
  return (
    <Page>
      <PageHeader
        eyebrow="Directory"
        title="Organizations"
        description="Platform, LGU, and organizer records that own festival tenants. TukodPH is the platform HQ."
      />
      <div className="divide-y divide-border rounded-xl bg-surface shadow-[var(--shadow-border)]">
        {(data?.orgs ?? []).map((o: any) => (
          <div key={o.id} className="flex items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="font-medium">{o.name}</p>
              <p className="text-sm text-muted">
                {o.city}
                {o.province ? `, ${o.province}` : ""}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs tracking-wide text-muted uppercase">{o.kind}</span>
              <p className="text-xs text-subtle tabular-nums">{o.festivals ?? 0} tenants</p>
            </div>
          </div>
        ))}
      </div>
    </Page>
  );
}
