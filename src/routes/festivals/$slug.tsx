import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { QrCode, ScanLine, Store, Globe } from "lucide-react";
import { useState } from "react";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { rangeLabel } from "@/lib/format";
import { getFestivalHub, submitPartnerRequest } from "@/lib/server/public";
import { toast } from "sonner";

export const Route = createFileRoute("/festivals/$slug")({ component: FestivalDetail });

function FestivalDetail() {
  const { slug } = Route.useParams();
  const { data, isPending } = useQuery({
    queryKey: ["hub", slug],
    queryFn: () => getFestivalHub({ data: slug }),
  });
  const [partner, setPartner] = useState({
    kind: "sponsor",
    organization_name: "",
    contact_name: "",
    contact_email: "",
    notes: "",
  });
  const ask = useMutation({
    mutationFn: () => submitPartnerRequest({ data: { slug, ...partner } }),
    onSuccess: () => toast.success("Partnership request sent to the organizer."),
    onError: (e: Error) => toast.error(e.message),
  });
  if (isPending) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <main className="mx-auto max-w-5xl px-4 py-16 text-muted">Loading festival…</main>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="min-h-screen">
        <SiteNav />
        <main className="mx-auto max-w-5xl px-4 py-16">Festival not found.</main>
      </div>
    );
  }
  const { festival: f, events, keys, sponsors } = data;
  const demoKey = keys[0]?.code;
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-4 py-12">
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid size-12 place-items-center rounded-md bg-surface-2 font-display text-xl text-accent">
            {f.logo_text}
          </span>
          <StatusBadge status={f.status} />
        </div>
        <h1 className="mt-6 font-display text-5xl tracking-tight">{f.name}</h1>
        <p className="mt-3 max-w-xl text-lg text-muted">{f.tagline}</p>
        <p className="mt-2 text-sm text-subtle">
          {f.city}, {f.province} · {f.starts_on} – {f.ends_on} · {f.timezone}
        </p>
        <p className="mt-6 max-w-2xl text-sm text-muted">{f.description}</p>

        <div className="mt-10 grid gap-3 sm:grid-cols-2">
          <Link
            to="/p"
            className="flex gap-4 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
          >
            <QrCode className="mt-1 size-5 text-accent" />
            <div>
              <p className="font-medium">Get ePASS</p>
              <p className="mt-1 text-sm text-muted">Register as a participant and receive a digital or printable pass.</p>
            </div>
          </Link>
          <Link
            to="/gate"
            search={{ festival: slug, code: demoKey }}
            className="flex gap-4 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
          >
            <ScanLine className="mt-1 size-5 text-accent" />
            <div>
              <p className="font-medium">Enter gate</p>
              <p className="mt-1 text-sm text-muted">
                Ushers and usherettes use an event access key. Demo: {demoKey ?? "issued in command center"}
              </p>
            </div>
          </Link>
          <a
            href="#partner"
            className="flex gap-4 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
          >
            <Store className="mt-1 size-5 text-accent" />
            <div>
              <p className="font-medium">Become a festival partner</p>
              <p className="mt-1 text-sm text-muted">Sponsors, vendors, and MSMEs — request a listing.</p>
            </div>
          </a>
          <Link
            to="/f/$slug"
            params={{ slug }}
            className="flex gap-4 rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
          >
            <Globe className="mt-1 size-5 text-accent" />
            <div>
              <p className="font-medium">Festival website</p>
              <p className="mt-1 text-sm text-muted">Public CMS site built in the TukodPH command center.</p>
            </div>
          </Link>
        </div>

        <h2 className="mt-14 font-display text-3xl">Programme</h2>
        <div className="mt-4 divide-y divide-border rounded-xl bg-surface shadow-[var(--shadow-border)]">
          {events.map((e) => (
            <div key={e.id} className="px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{e.name}</p>
                <StatusBadge status={e.status} />
              </div>
              <p className="text-sm text-muted">
                {e.venue_name ?? "Venue TBA"} · {rangeLabel(e.starts_at, e.ends_at)} · {e.event_type}
              </p>
            </div>
          ))}
        </div>

        {keys.length > 0 ? (
          <>
            <h2 className="mt-14 font-display text-3xl">Gate access keys</h2>
            <p className="mt-1 text-sm text-muted">Demo keys for ushers and usherettes. Staff do not need an account.</p>
            <div className="mt-4 divide-y divide-border rounded-xl bg-surface shadow-[var(--shadow-border)]">
              {keys.map((k) => (
                <div key={k.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                  <div>
                    <p className="font-mono text-sm">{k.code}</p>
                    <p className="text-sm text-muted">
                      {k.event_name} · {k.staff_role}
                    </p>
                  </div>
                  <Link to="/gate" search={{ festival: slug, code: k.code }}>
                    <Button size="sm" variant="outline">
                      Enter gate
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </>
        ) : null}

        {sponsors.length > 0 ? (
          <>
            <h2 className="mt-14 font-display text-3xl">Sponsors</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {sponsors.map((s) => (
                <span key={s.id} className="rounded-full bg-surface-2 px-3 py-1 text-sm">
                  {s.name}
                </span>
              ))}
            </div>
          </>
        ) : null}

        <section id="partner" className="mt-14 scroll-mt-24">
          <h2 className="font-display text-3xl">Become a partner</h2>
          <p className="mt-1 text-sm text-muted">Sponsor, vendor, or MSME booster listing.</p>
          <form
            className="mt-6 grid max-w-lg gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              ask.mutate();
            }}
          >
            <div className="grid gap-1">
              <Label>Type</Label>
              <select
                className="h-11 rounded-md border border-border bg-surface-2 px-3 text-sm"
                value={partner.kind}
                onChange={(e) => setPartner({ ...partner, kind: e.target.value })}
              >
                <option value="sponsor">Sponsor</option>
                <option value="vendor">Vendor</option>
                <option value="msme">MSME</option>
              </select>
            </div>
            {(
              [
                ["organization_name", "Organization"],
                ["contact_name", "Contact name"],
                ["contact_email", "Email"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="grid gap-1">
                <Label>{label}</Label>
                <Input
                  required
                  type={key.includes("email") ? "email" : "text"}
                  value={partner[key]}
                  onChange={(e) => setPartner({ ...partner, [key]: e.target.value })}
                />
              </div>
            ))}
            <div className="grid gap-1">
              <Label>Notes</Label>
              <Textarea
                value={partner.notes}
                onChange={(e) => setPartner({ ...partner, notes: e.target.value })}
              />
            </div>
            <Button type="submit" disabled={ask.isPending}>
              {ask.isPending ? "Sending…" : "Request partnership"}
            </Button>
          </form>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
