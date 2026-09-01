import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { StatusBadge } from "@/components/status-badge";
import { listFestivalCatalog } from "@/lib/server/public";
import type { Festival } from "@/lib/types";

export const Route = createFileRoute("/festivals/")({ component: FestivalsPage });

function Card({ f }: { f: Festival }) {
  return (
    <Link
      to="/festivals/$slug"
      params={{ slug: f.slug }}
      className="block rounded-xl bg-surface p-5 shadow-[var(--shadow-border)] hover:shadow-[var(--shadow-border-hover)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid size-11 place-items-center rounded-md bg-surface-2 font-display text-lg text-accent">
          {f.logo_text}
        </span>
        <StatusBadge status={f.status} />
      </div>
      <h3 className="mt-4 font-display text-2xl">{f.name}</h3>
      <p className="mt-1 text-sm text-muted">{f.tagline}</p>
      <p className="mt-2 text-xs text-subtle">
        {f.city}, {f.province} · {f.starts_on} – {f.ends_on}
      </p>
    </Link>
  );
}

function FestivalsPage() {
  const { data } = useQuery({ queryKey: ["catalog"], queryFn: () => listFestivalCatalog() });
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <p className="text-xs tracking-[0.28em] text-muted uppercase">Programme</p>
        <h1 className="mt-3 font-display text-5xl tracking-tight">Festivals</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Live seasons, upcoming tenants, and past editions. Open a festival for ePASS, gate access,
          partnership, or the public website.
        </p>
        <section className="mt-12">
          <h2 className="font-display text-3xl">Now on</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(data?.live ?? []).map((f) => (
              <Card key={f.id} f={f} />
            ))}
          </div>
        </section>
        <section className="mt-12">
          <h2 className="font-display text-3xl">Upcoming</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(data?.upcoming ?? []).map((f) => (
              <Card key={f.id} f={f} />
            ))}
          </div>
        </section>
        <section className="mt-12">
          <h2 className="font-display text-3xl">Past</h2>
          {(data?.past ?? []).length === 0 ? (
            <p className="mt-3 text-sm text-muted">No closed seasons in this catalogue yet.</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data?.past.map((f) => (
                <Card key={f.id} f={f} />
              ))}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
