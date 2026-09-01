import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { OperatorGate, useOperatorProfile } from "@/components/operator-gate";
import { Page, PageHeader, Stat, TopBar } from "@/components/shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { createDraftFestival, getOccHome } from "@/lib/server/erp";
import { toast } from "sonner";

export const Route = createFileRoute("/hub")({ component: HubPage });

function HubPage() {
  return (
    <OperatorGate>
      <Hub />
    </OperatorGate>
  );
}

function Hub() {
  const profile = useOperatorProfile();
  const nav = useNavigate();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["occ"], queryFn: () => getOccHome() });
  const ssp = Boolean(data?.ssp || profile?.kind === "ssp");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    city: "",
    province: "",
    starts_on: "2026-11-01",
    ends_on: "2026-11-08",
    tagline: "",
  });
  const create = useMutation({
    mutationFn: () =>
      createDraftFestival({
        data: { ...form, organizer: profile?.display_name ?? "", email: "" },
      }),
    onSuccess: (res) => {
      toast.success("Draft festival created");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["occ"] });
      void nav({ to: "/admin/$festivalId", params: { festivalId: res.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const items = ssp
    ? [
        { to: "/hub", label: "Desk" },
        { to: "/ssp", label: "HQ" },
      ]
    : [{ to: "/hub", label: "Desk" }];

  return (
    <div className="min-h-screen">
      <TopBar kicker="Organizer Command Center" items={items} />
      <Page>
        <PageHeader
          eyebrow="Desk"
          title={ssp ? "All tenants" : "Your command center"}
          description={
            ssp
              ? "View every festival tenant. Open Headquarters to control the platform, or open a command center as co-partner."
              : "Create, draft, organize, and publish your festivals. You only see desks you own."
          }
          actions={
            <Button onClick={() => setOpen(true)}>New festival draft</Button>
          }
        />

        <div className="grid gap-3 sm:grid-cols-3">
          <Stat label="Tenants" value={data?.festivals.length ?? "—"} />
          <Stat label="Applications" value={data?.apps.length ?? "—"} />
          <Stat
            label="Drafts"
            value={
              data?.festivals.filter((f) => f.status === "DRAFT" || f.status === "PLANNING").length ??
              "—"
            }
          />
        </div>

        <h2 className="mt-10 font-display text-2xl">Festivals</h2>
        <div className="mt-4 grid gap-3">
          {(data?.festivals ?? []).map((f) => {
            const pct = f.plan_total ? Math.round((f.plan_done / f.plan_total) * 100) : 0;
            return (
              <div key={f.id} className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-2xl">{f.name}</p>
                    <p className="text-sm text-muted">
                      {f.city} · {f.package_name ?? "Unlicensed draft"} ·{" "}
                      {f.copartner ? "Co-partner 30%" : "Self-serve"}
                    </p>
                  </div>
                  <StatusBadge status={f.status} />
                </div>
                <p className="mt-4 text-xs tracking-wide text-muted uppercase">Planning completeness</p>
                <div className="mt-2 flex items-center gap-3">
                  <Progress value={pct} className="flex-1" />
                  <span className="text-sm tabular-nums text-muted">{pct}%</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link to="/admin/$festivalId" params={{ festivalId: f.id }}>
                    <Button size="sm">Command</Button>
                  </Link>
                  <Link to="/admin/$festivalId/events" params={{ festivalId: f.id }}>
                    <Button size="sm" variant="outline">
                      Events
                    </Button>
                  </Link>
                  <Link to="/admin/$festivalId/staff" params={{ festivalId: f.id }}>
                    <Button size="sm" variant="outline">
                      Staff
                    </Button>
                  </Link>
                  <Link to="/admin/$festivalId/gates" params={{ festivalId: f.id }}>
                    <Button size="sm" variant="outline">
                      Gate
                    </Button>
                  </Link>
                  <Link to="/admin/$festivalId/publish" params={{ festivalId: f.id }}>
                    <Button size="sm" variant="outline">
                      Publish
                    </Button>
                  </Link>
                  <Link to="/festivals/$slug" params={{ slug: f.slug }}>
                    <Button size="sm" variant="ghost">
                      Preview
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </Page>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Create festival draft</DialogTitle>
          <DialogDescription>
            Saved as a draft until you organize the season and confirm publish at payment.
          </DialogDescription>
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              create.mutate();
            }}
          >
            {(
              [
                ["name", "Festival name"],
                ["city", "City"],
                ["province", "Province"],
                ["tagline", "Tagline"],
                ["starts_on", "Starts"],
                ["ends_on", "Ends"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="grid gap-1">
                <Label>{label}</Label>
                <Input
                  required={key !== "tagline"}
                  type={key.includes("on") ? "date" : "text"}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Creating…" : "Save draft"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
