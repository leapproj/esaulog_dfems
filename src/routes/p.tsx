import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/auth-gate";
import { EpassCard } from "@/components/epass-card";
import { Page, PageHeader, TopBar } from "@/components/shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { rangeLabel } from "@/lib/format";
import { bootstrapWorkspace } from "@/lib/server/bootstrap";
import {
  castVote,
  claimReward,
  getParticipantHome,
  issueCoupon,
  registerForEvent,
  selfCheckIn,
} from "@/lib/server/participant";
import { toast } from "sonner";

export const Route = createFileRoute("/p")({ component: ParticipantPage });

function ParticipantPage() {
  return (
    <AuthGate>
      <Portal />
    </AuthGate>
  );
}

function Portal() {
  const qc = useQueryClient();
  const boot = useMutation({ mutationFn: () => bootstrapWorkspace() });
  useEffect(() => {
    boot.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const { data } = useQuery({
    queryKey: ["portal"],
    queryFn: () => getParticipantHome(),
    enabled: boot.isSuccess,
  });
  const [print, setPrint] = useState(false);

  const reg = useMutation({
    mutationFn: (id: string) => registerForEvent({ data: id }),
    onSuccess: () => {
      toast.success("Registered");
      void qc.invalidateQueries({ queryKey: ["portal"] });
    },
  });
  const cin = useMutation({
    mutationFn: (id: string) => selfCheckIn({ data: id }),
    onSuccess: (res) => {
      if (!res.ok) toast.error(res.reason);
      else toast.success("Checked in");
      void qc.invalidateQueries({ queryKey: ["portal"] });
    },
  });
  const vote = useMutation({
    mutationFn: (choice: string) =>
      castVote({ data: { eventId: "evt_kahimunan", choice } }),
    onSuccess: () => toast.success("Vote recorded"),
  });
  const coupon = useMutation({
    mutationFn: (id: string) => issueCoupon({ data: id }),
    onSuccess: (res) => toast.success(`Coupon ${res.code}`),
  });
  const reward = useMutation({
    mutationFn: (id: string) => claimReward({ data: id }),
    onSuccess: () => {
      toast.success("Reward claimed");
      void qc.invalidateQueries({ queryKey: ["portal"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="min-h-screen">
      <TopBar kicker="Participant" />
      <Page>
        <PageHeader
          eyebrow="Discover · Join · Participate · Earn · Explore"
          title={data?.festival?.name ?? "Festival experience"}
          description={data?.festival?.tagline}
        />
        <Tabs defaultValue="discover">
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="join">Join</TabsTrigger>
            <TabsTrigger value="participate">Participate</TabsTrigger>
            <TabsTrigger value="earn">Earn</TabsTrigger>
            <TabsTrigger value="explore">Explore</TabsTrigger>
          </TabsList>
          <TabsContent value="discover">
            <div className="grid gap-3">
              {(data?.events ?? []).map((e) => (
                <div key={e.id} className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted uppercase">{e.category_name ?? e.event_type}</p>
                      <h3 className="font-display text-2xl">{e.name}</h3>
                      <p className="mt-1 text-sm text-muted">
                        {e.venue_name} · {rangeLabel(e.starts_at, e.ends_at)}
                      </p>
                    </div>
                    <StatusBadge status={e.status} />
                  </div>
                  <p className="mt-3 text-sm text-muted">{e.description}</p>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="join">
            <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
              <div className="space-y-3">
                {(data?.events ?? []).map((e) => (
                  <div
                    key={e.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]"
                  >
                    <div>
                      <p className="font-medium">{e.name}</p>
                      <p className="text-xs text-muted">{e.access_mode} access</p>
                    </div>
                    {e.registered ? (
                      <span className="text-sm text-ok">Registered</span>
                    ) : (
                      <Button size="sm" onClick={() => reg.mutate(e.id)}>
                        Register
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {data?.epass && data.participant ? (
                <div>
                  <EpassCard
                    festivalName={data.festival?.name ?? "Festival"}
                    participantName={data.participant.full_name}
                    credentialId={data.epass.credential_id}
                    payload={data.epass.qr_payload}
                  />
                  <Button
                    className="mt-3 w-full"
                    variant="outline"
                    onClick={() => {
                      setPrint(true);
                      setTimeout(() => window.print(), 250);
                    }}
                  >
                    Print ePASS
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted">Provisioning your ePASS…</p>
              )}
            </div>
          </TabsContent>
          <TabsContent value="participate">
            <div className="space-y-3">
              {(data?.events ?? [])
                .filter((e) => e.registered)
                .map((e) => (
                  <div
                    key={e.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]"
                  >
                    <div>
                      <p className="font-medium">{e.name}</p>
                      <p className="text-xs text-muted">Self check-in for open venues</p>
                    </div>
                    <Button size="sm" variant="secondary" onClick={() => cin.mutate(e.id)}>
                      Check in
                    </Button>
                  </div>
                ))}
              <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
                <p className="text-xs tracking-wide text-muted uppercase">People’s Choice</p>
                <h3 className="mt-1 font-display text-2xl">Kahimunan Street Dance</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {["Barangay Carmen", "Barangay Lapasan", "Barangay Macasandig"].map((c) => (
                    <Button key={c} size="sm" variant="outline" onClick={() => vote.mutate(c)}>
                      {c}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="earn">
            <p className="mb-4 text-sm text-muted">
              You have <span className="tabular-nums text-fg">{data?.points ?? 0}</span> points
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              {(data?.missions ?? []).map((m) => (
                <div key={m.id} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
                  <p className="font-medium">{m.title}</p>
                  <p className="mt-1 text-sm text-muted">{m.description}</p>
                  <p className="mt-3 text-xs text-subtle">
                    {m.points} pts · {m.badge_name} · {m.progress}/{m.condition_value}
                  </p>
                </div>
              ))}
            </div>
            <h3 className="mt-8 font-display text-2xl">Rewards</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              {(data?.rewards ?? []).map((r) => (
                <div key={r.id} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
                  <p className="font-medium">{r.name}</p>
                  <p className="text-sm text-muted">{r.points_cost} pts</p>
                  <Button className="mt-3" size="sm" onClick={() => reward.mutate(r.id)}>
                    Claim
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="explore">
            <div className="grid gap-3 sm:grid-cols-2">
              {(data?.vendors ?? []).map((v) => (
                <div key={v.id} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
                  <div className="flex justify-between">
                    <p className="font-medium">{v.name}</p>
                    {v.booster === "booster" ? (
                      <span className="text-xs text-ok">Booster</span>
                    ) : (
                      <span className="text-xs text-muted">Listing</span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted">{v.description}</p>
                  <p className="mt-2 text-xs text-subtle">{v.location}</p>
                </div>
              ))}
            </div>
            <h3 className="mt-8 font-display text-2xl">Coupons</h3>
            <div className="mt-3 space-y-3">
              {(data?.offers ?? []).map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between gap-3 rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]"
                >
                  <div>
                    <p className="font-medium">{o.title}</p>
                    <p className="text-sm text-muted">{o.vendor_name}</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => coupon.mutate(o.id)}>
                    Issue
                  </Button>
                </div>
              ))}
            </div>
            <p className="mt-8 text-sm text-muted">
              Dayu will extend this rail into lodging, restaurants, and island itineraries.
            </p>
          </TabsContent>
        </Tabs>
      </Page>
      {print ? <style>{`@media print { body * { visibility: hidden } .epass-print, .epass-print * { visibility: visible } .epass-print { position: absolute; inset: 0; } }`}</style> : null}
    </div>
  );
}
