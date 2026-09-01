import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AuthGate } from "@/components/auth-gate";
import { Page, PageHeader, Stat, TopBar } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { compact } from "@/lib/format";
import { bumpCampaignScan, getSponsorDesk } from "@/lib/server/engage";

export const Route = createFileRoute("/sponsor")({ component: SponsorPage });

function SponsorPage() {
  return (
    <AuthGate>
      <Desk />
    </AuthGate>
  );
}

function Desk() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["sponsor"], queryFn: () => getSponsorDesk() });
  const bump = useMutation({
    mutationFn: (id: string) => bumpCampaignScan({ data: id }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["sponsor"] }),
  });
  const scans = data?.campaigns.reduce((a, c) => a + c.scans, 0) ?? 0;
  const pax = data?.campaigns.reduce((a, c) => a + c.participants_count, 0) ?? 0;
  return (
    <div className="min-h-screen">
      <TopBar kicker="Sponsor activation" />
      <Page>
        <PageHeader
          eyebrow="Campaigns"
          title="Sponsor environment"
          description="Missions, digital ads, coupons, QR/NFC activations, and campaign performance — subject to the agreed privacy model."
        />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Sponsors" value={data?.sponsors.length ?? "—"} />
          <Stat label="Campaigns" value={data?.campaigns.length ?? "—"} />
          <Stat label="Scans" value={compact(scans)} />
          <Stat label="Engaged" value={compact(pax)} />
        </div>
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {(data?.campaigns ?? []).map((c) => (
            <article key={c.id} className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
              <p className="text-xs tracking-wide text-muted uppercase">{c.sponsor_name}</p>
              <h3 className="mt-1 font-display text-2xl">{c.name}</h3>
              <p className="mt-2 text-sm text-muted">{c.description}</p>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-muted">Scans</dt>
                  <dd className="tabular-nums">{compact(c.scans)}</dd>
                </div>
                <div>
                  <dt className="text-muted">Participants</dt>
                  <dd className="tabular-nums">{compact(c.participants_count)}</dd>
                </div>
              </dl>
              <Button className="mt-4" size="sm" variant="outline" onClick={() => bump.mutate(c.id)}>
                Simulate activation scan
              </Button>
            </article>
          ))}
        </div>
      </Page>
    </div>
  );
}
