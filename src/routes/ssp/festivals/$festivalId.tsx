import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { Page, PageHeader, Stat } from "@/components/shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { compact, php } from "@/lib/format";
import {
  getSspOverview,
  hqGoLive,
  setFestivalCopartner,
  updateFestivalIdentity,
  updateFestivalStatus,
} from "@/lib/server/ssp";
import { toast } from "sonner";

export const Route = createFileRoute("/ssp/festivals/$festivalId")({
  component: TenantDetail,
});

const STATUSES = ["DRAFT", "PLANNING", "SETUP", "LIVE", "ENDED"] as const;

function TenantDetail() {
  const { festivalId } = Route.useParams();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["ssp"], queryFn: () => getSspOverview() });
  const f = data?.festivals?.find((x: { id: string }) => x.id === festivalId);
  const events = (data?.events ?? []).filter((e: { festival_id: string }) => e.festival_id === festivalId);
  const [editOpen, setEditOpen] = useState(false);

  const statusMut = useMutation({
    mutationFn: (status: string) => updateFestivalStatus({ data: { id: festivalId, status } }),
    onSuccess: () => {
      toast.success("Status updated");
      void qc.invalidateQueries({ queryKey: ["ssp"] });
    },
  });
  const cpMut = useMutation({
    mutationFn: (copartner: boolean) => setFestivalCopartner({ data: { id: festivalId, copartner } }),
    onSuccess: (res) => {
      toast.success(res.copartner ? "Co-partner activated" : "Co-partner removed");
      void qc.invalidateQueries({ queryKey: ["ssp"] });
    },
  });
  const goLive = useMutation({
    mutationFn: () => hqGoLive({ data: { id: festivalId } }),
    onSuccess: () => {
      toast.success("Festival is live");
      void qc.invalidateQueries({ queryKey: ["ssp"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <Page>
        <Skeleton className="h-8 w-64" />
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </Page>
    );
  }

  if (!f) return <Page>Tenant not found.</Page>;

  return (
    <Page>
      <PageHeader
        eyebrow="HQ tenant"
        title={f.name}
        description={`${f.city}, ${f.province} · ${f.starts_on} – ${f.ends_on} · ${f.timezone}`}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/admin/$festivalId" params={{ festivalId: f.id }}>
                Open command center
              </Link>
            </Button>
            {f.status !== "LIVE" && f.status !== "ENDED" ? (
              <Button disabled={goLive.isPending} onClick={() => goLive.mutate()}>
                Go live
              </Button>
            ) : null}
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              Edit identity
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/$festivalId/events/new" params={{ festivalId: f.id }}>
                Create event
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/admin/$festivalId/cms" params={{ festivalId: f.id }}>
                CMS
              </Link>
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Participants" value={compact(f.participants)} />
        <Stat label="Events" value={f.events} />
        <Stat label="Check-ins" value={compact(f.checkins ?? 0)} />
        <Stat
          label="Digital income"
          value={php(f.digital ?? 0)}
          hint={f.copartner ? `HQ 30% · ${php(Math.round((f.digital ?? 0) * 0.3))}` : "Self-serve"}
        />
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="text-xs tracking-wide text-muted uppercase">License status</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={f.status === s ? "default" : "outline"}
                onClick={() => statusMut.mutate(s)}
              >
                {s}
              </Button>
            ))}
          </div>
          <div className="mt-4">
            <StatusBadge status={f.status} />
          </div>
        </div>
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="text-xs tracking-wide text-muted uppercase">Co-partner model</p>
          <p className="mt-2 text-sm text-muted">
            {f.copartner
              ? "TukodPH operates the digital festival. 30% of digital sponsor income. Physical sponsors remain with the organizer."
              : "Self-serve license. Activate co-partner to have HQ run the digital festival."}
          </p>
          <div className="mt-4">
            <Button
              size="sm"
              variant={f.copartner ? "secondary" : "default"}
              disabled={cpMut.isPending}
              onClick={() => cpMut.mutate(!f.copartner)}
            >
              {f.copartner ? "Remove co-partner" : "Activate as co-partner"}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="text-xs tracking-wide text-muted uppercase">HQ surfaces</p>
          <ul className="mt-3 space-y-1 text-sm">
            {[
              { t: "Command center", to: "/admin/$festivalId" as const, params: { festivalId: f.id } },
              { t: "Planning desk", to: "/admin/$festivalId/planning" as const, params: { festivalId: f.id } },
              { t: "Event calendar", to: "/admin/$festivalId/events" as const, params: { festivalId: f.id } },
              { t: "Staff & volunteers", to: "/admin/$festivalId/staff" as const, params: { festivalId: f.id } },
              { t: "Gate keys", to: "/admin/$festivalId/gates" as const, params: { festivalId: f.id } },
              { t: "CMS website", to: "/admin/$festivalId/cms" as const, params: { festivalId: f.id } },
              { t: "Income ledger", to: "/admin/$festivalId/income" as const, params: { festivalId: f.id } },
              { t: "Analytics", to: "/admin/$festivalId/analytics" as const, params: { festivalId: f.id } },
              { t: "AI organizer", to: "/admin/$festivalId/ai" as const, params: { festivalId: f.id } },
            ].map((s) => (
              <li key={s.t} className="flex items-center justify-between border-b border-border py-1.5 last:border-0">
                <Link to={s.to} params={s.params} className="hover:text-accent">
                  {s.t}
                </Link>
                <span className="text-xs text-ok">Open</span>
              </li>
            ))}
            <li className="flex items-center justify-between py-1.5">
              <Link to="/festivals/$slug" params={{ slug: f.slug }} className="hover:text-accent">
                Public preview
              </Link>
              <span className="text-xs text-ok">Open</span>
            </li>
          </ul>
        </div>
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="text-xs tracking-wide text-muted uppercase">Identity</p>
          <dl className="mt-3 grid gap-3 text-sm">
            <div>
              <dt className="text-muted">Organizer</dt>
              <dd className="mt-0.5">{f.organizer_name}</dd>
            </div>
            <div>
              <dt className="text-muted">Contact</dt>
              <dd className="mt-0.5">{f.contact_email}</dd>
            </div>
            <div>
              <dt className="text-muted">Slug</dt>
              <dd className="mt-0.5 font-mono">{f.slug}</dd>
            </div>
            <div>
              <dt className="text-muted">Package</dt>
              <dd className="mt-0.5">{f.package_name ?? "Unlicensed"}</dd>
            </div>
            {f.tagline ? (
              <div>
                <dt className="text-muted">Tagline</dt>
                <dd className="mt-0.5">{f.tagline}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>

      {events.length > 0 ? (
        <>
          <h2 className="mt-10 font-display text-2xl">Events on this tenant</h2>
          <div className="mt-3 divide-y divide-border rounded-xl bg-surface shadow-[var(--shadow-border)]">
            {events.map((e: any) => (
              <Link
                key={e.id}
                to="/admin/$festivalId/events/$eventId"
                params={{ festivalId: f.id, eventId: e.id }}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-surface-2"
              >
                <p className="font-medium">{e.name}</p>
                <StatusBadge status={e.status} />
              </Link>
            ))}
          </div>
        </>
      ) : null}

      <EditIdentityDialog festival={f} open={editOpen} onOpenChange={setEditOpen} />
    </Page>
  );
}

function EditIdentityDialog({
  festival,
  open,
  onOpenChange,
}: {
  festival: any;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    name: "",
    slug: "",
    city: "",
    province: "",
    starts_on: "",
    ends_on: "",
    tagline: "",
    organizer_name: "",
    contact_email: "",
  });
  useEffect(() => {
    if (!open) return;
    setForm({
      name: festival.name ?? "",
      slug: festival.slug ?? "",
      city: festival.city ?? "",
      province: festival.province ?? "",
      starts_on: String(festival.starts_on ?? "").slice(0, 10),
      ends_on: String(festival.ends_on ?? "").slice(0, 10),
      tagline: festival.tagline ?? "",
      organizer_name: festival.organizer_name ?? "",
      contact_email: festival.contact_email ?? "",
    });
  }, [open, festival]);
  const mut = useMutation({
    mutationFn: () => updateFestivalIdentity({ data: { id: festival.id, ...form } }),
    onSuccess: () => {
      toast.success("Festival identity updated");
      onOpenChange(false);
      void qc.invalidateQueries({ queryKey: ["ssp"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogTitle>Edit festival identity</DialogTitle>
        <DialogDescription>
          Super Admin can change the public identity of any tenant from Headquarters.
        </DialogDescription>
        <form
          className="mt-4 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            mut.mutate();
          }}
        >
          {(
            [
              ["name", "Festival name"],
              ["slug", "Slug"],
              ["city", "City"],
              ["province", "Province"],
              ["organizer_name", "Organizer"],
              ["contact_email", "Contact email"],
              ["tagline", "Tagline"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="grid gap-1">
              <Label htmlFor={`id-${key}`}>{label}</Label>
              <Input
                id={`id-${key}`}
                required={key !== "tagline"}
                value={form[key]}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label htmlFor="id-starts">Starts</Label>
              <Input
                id="id-starts"
                type="date"
                value={form.starts_on}
                onChange={(e) => setForm((prev) => ({ ...prev, starts_on: e.target.value }))}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="id-ends">Ends</Label>
              <Input
                id="id-ends"
                type="date"
                value={form.ends_on}
                onChange={(e) => setForm((prev) => ({ ...prev, ends_on: e.target.value }))}
              />
            </div>
          </div>
          <Button type="submit" disabled={mut.isPending}>
            {mut.isPending ? "Saving…" : "Save identity"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
