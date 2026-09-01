import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { OperatorGate } from "@/components/operator-gate";
import { Page, PageHeader, TopBar } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { php } from "@/lib/format";
import { listPackages, payAndPublish } from "@/lib/server/erp";
import { toast } from "sonner";

type Search = { festivalId?: string };

export const Route = createFileRoute("/pay")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    festivalId: typeof s.festivalId === "string" ? s.festivalId : undefined,
  }),
  component: PayPage,
});

function PayPage() {
  return (
    <OperatorGate>
      <PayInner />
    </OperatorGate>
  );
}

function PayInner() {
  const { festivalId } = Route.useSearch();
  const nav = useNavigate();
  const pkgs = useQuery({ queryKey: ["packages"], queryFn: () => listPackages() });
  const [packageId, setPackageId] = useState("");
  const selected = (pkgs.data ?? []).find((p) => p.id === (packageId || pkgs.data?.[1]?.id));
  const pay = useMutation({
    mutationFn: () =>
      payAndPublish({
        data: { festivalId: festivalId ?? "", packageId: selected?.id ?? "" },
      }),
    onSuccess: (res) => {
      toast.success("Payment recorded. Festival is in SETUP.");
      if (res.slug) void nav({ to: "/festivals/$slug", params: { slug: res.slug } });
      else void nav({ to: "/hub" });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="min-h-screen">
      <TopBar kicker="Payment" items={[{ to: "/hub", label: "Desk" }]} />
      <Page className="max-w-3xl">
        <PageHeader
          eyebrow="Checkout"
          title="Select a package"
          description="Publishing a tenant requires a season license — or a digital co-partner agreement at 30% of digital sponsor income."
        />
        {!festivalId ? (
          <p className="text-sm text-muted">
            No festival selected.{" "}
            <Link to="/hub" className="underline-offset-4 hover:underline">
              Return to desk
            </Link>
          </p>
        ) : (
          <>
            <div className="grid gap-3">
              {(pkgs.data ?? []).map((p) => {
                const active = (selected?.id ?? "") === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setPackageId(p.id)}
                    className={`rounded-xl bg-surface p-5 text-left shadow-[var(--shadow-border)] ${
                      active ? "shadow-[var(--shadow-border-hover)] ring-1 ring-accent" : ""
                    }`}
                  >
                    <p className="text-xs tracking-wide text-muted uppercase">
                      {p.kind === "copartner" ? "Co-partner" : "License"}
                    </p>
                    <p className="mt-1 font-display text-2xl">{p.name}</p>
                    <p className="mt-1 font-display text-lg tabular-nums">
                      {p.price_php > 0 ? php(p.price_php) : `${p.commission_pct || 25}% RevShare`}
                    </p>
                    <p className="mt-2 text-sm text-muted">{p.description}</p>
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <Button
                disabled={pay.isPending || !selected || !festivalId}
                onClick={() => pay.mutate()}
              >
                {pay.isPending
                  ? "Processing…"
                  : selected?.kind === "copartner"
                    ? `Request co-partner (${selected.commission_pct || 25}% RevShare) & publish`
                    : `Pay ${selected ? php(selected.price_php) : ""} (demo)`}
              </Button>
              <Link to="/packages">
                <Button variant="outline">Compare packages</Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-subtle">
              Demo checkout — no real charge. GCash and card rails can be wired in a later layer.
            </p>
          </>
        )}
      </Page>
    </div>
  );
}
