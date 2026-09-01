import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { getHomeData } from "@/lib/server/public";
import { listPackages } from "@/lib/server/erp";
import { compact, php } from "@/lib/format";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { data } = useQuery({ queryKey: ["home"], queryFn: () => getHomeData() });
  const pkgs = useQuery({ queryKey: ["packages"], queryFn: () => listPackages() });
  const stats = data?.stats;

  return (
    <div className="sunburst min-h-screen">
      <SiteNav />

      <section className="mx-auto max-w-6xl px-4 pt-10 pb-16 sm:pt-16">
        <p className="text-xs tracking-[0.28em] text-muted uppercase">TukodPH · eSAULOG DFEMS</p>
        <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[1.05] tracking-tight sm:text-7xl">
          The operating system for Philippine festivals.
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
          A SaaS ERP for LGUs and organizers: apply as a tenant, buy a package, draft the whole
          festival until it is ready, then run physical and digital operations from one command
          center. Built by{" "}
          <a href="https://tukodph.com" className="text-fg underline-offset-4 hover:underline">
            TukodPH
          </a>
          .
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/apply">
            <Button size="lg">
              Apply as tenant
              <ArrowRight />
            </Button>
          </Link>
          <Link to="/festivals">
            <Button size="lg" variant="outline">
              Browse festivals
            </Button>
          </Link>
          <Link to="/packages">
            <Button size="lg" variant="outline">
              View packages
            </Button>
          </Link>
        </div>
      </section>

      <section className="border-y border-border bg-surface/60">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px sm:grid-cols-5">
          {[
            ["Live tenants", stats?.festivals ?? "—"],
            ["Participants", stats ? compact(stats.participants) : "—"],
            ["Events", stats ? compact(stats.events) : "—"],
            ["Vendors", stats ? compact(stats.vendors) : "—"],
            ["Check-ins", stats ? compact(stats.checkins) : "—"],
          ].map(([label, value]) => (
            <div key={label} className="px-4 py-5">
              <p className="text-[11px] tracking-wide text-muted uppercase">{label}</p>
              <p className="mt-1 font-display text-2xl tabular-nums sm:text-3xl">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <p className="text-xs tracking-[0.2em] text-muted uppercase">How tenants work</p>
        <h2 className="mt-2 font-display text-3xl tracking-tight sm:text-4xl">
          From first question to a live festival tenant.
        </h2>
        <div className="mt-8 grid gap-3 md:grid-cols-4">
          {[
            { n: "01", t: "Read the product", d: "eSAULOG DFEMS is the festival ERP. TukodPH is the company that ships it." },
            { n: "02", t: "Apply & choose a package", d: "Self-serve licenses, or ask TukodPH to co-partner the digital festival at 30%." },
            { n: "03", t: "Draft until complete", d: "Calendar, sponsors, CMS website, participant and gate portals — saved as draft." },
            { n: "04", t: "Command & measure", d: "HQ sees turnout, income, and sponsor analytics across every tenant." },
          ].map((c) => (
            <div key={c.n} className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
              <p className="font-mono text-xs text-muted">{c.n}</p>
              <p className="mt-2 font-medium">{c.t}</p>
              <p className="mt-2 text-sm text-muted">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-xs tracking-[0.2em] text-muted uppercase">Packages</p>
            <h2 className="mt-2 font-display text-3xl tracking-tight">Buy the season you need</h2>
          </div>
          <Link to="/packages" className="text-sm text-muted hover:text-fg">
            Compare all
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {(pkgs.data ?? []).map((p) => (
            <Link
              key={p.id}
              to="/packages"
              className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
            >
              <p className="text-xs tracking-wide text-muted uppercase">{p.kind.replace("_", " ")}</p>
              <h3 className="mt-2 font-display text-2xl">{p.name}</h3>
              <p className="mt-2 font-display text-xl tabular-nums">
                {p.price_php > 0 ? php(p.price_php) : "30% digital"}
              </p>
              <p className="mt-1 text-xs text-subtle">{p.billing}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <p className="text-xs tracking-[0.2em] text-muted uppercase">Festival tenants</p>
        <h2 className="mt-2 font-display text-3xl tracking-tight">On the platform</h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.festivals ?? []).map((f) => (
            <Link
              key={f.id}
              to="/f/$slug"
              params={{ slug: f.slug }}
              className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid size-10 place-items-center rounded-md bg-surface-2 font-display text-lg">
                  {f.logo_text}
                </span>
                <StatusBadge status={f.status} />
              </div>
              <h3 className="mt-4 font-display text-2xl tracking-tight">{f.name}</h3>
              <p className="mt-1 text-sm text-muted">
                {f.city}, {f.province}
              </p>
              <p className="mt-3 text-sm text-subtle">{f.tagline}</p>
            </Link>
          ))}
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
