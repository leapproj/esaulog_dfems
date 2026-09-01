import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { CreateCopartnerDialog } from "@/components/hq-create-festival";
import { Page, PageHeader } from "@/components/shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getSspOverview } from "@/lib/server/ssp";

export const Route = createFileRoute("/ssp/festivals/")({ component: FestivalsPage });

function FestivalsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["ssp"], queryFn: () => getSspOverview() });
  const [open, setOpen] = useState(false);
  return (
    <Page>
      <PageHeader
        eyebrow="Tenants"
        title="Festival tenants"
        description="Super Admin HQ provisions public site, command center, participant portal, gate, vendor, sponsor, analytics, and AI organizer. Co-partner tenants are operated by TukodPH at 30% of digital sponsor income."
        actions={<Button onClick={() => setOpen(true)}>Create as co-partner</Button>}
      />
      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {(data?.festivals ?? []).map((f: any) => (
            <Link
              key={f.id}
              to="/ssp/festivals/$festivalId"
              params={{ festivalId: f.id }}
              className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
            >
              <div className="flex items-start justify-between">
                <span className="grid size-10 place-items-center rounded-md bg-surface-2 font-display">
                  {f.logo_text}
                </span>
                <div className="flex items-center gap-2">
                  {f.copartner ? (
                    <span className="text-xs tracking-wide text-accent uppercase">Co-partner</span>
                  ) : null}
                  <StatusBadge status={f.status} />
                </div>
              </div>
              <h3 className="mt-4 font-display text-2xl">{f.name}</h3>
              <p className="mt-1 text-sm text-muted">
                {f.city}, {f.province}
              </p>
              <p className="mt-3 text-xs text-subtle tabular-nums">
                {f.participants} pax · {f.events} events · {f.package_name ?? "Unlicensed"}
              </p>
            </Link>
          ))}
        </div>
      )}
      <CreateCopartnerDialog open={open} onOpenChange={setOpen} />
    </Page>
  );
}
