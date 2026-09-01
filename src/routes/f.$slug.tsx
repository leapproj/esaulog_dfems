import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Wordmark } from "@/components/brand";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { rangeLabel } from "@/lib/format";
import { getPublicFestival } from "@/lib/server/public";
import type { CmsBlock } from "@/lib/types";

export const Route = createFileRoute("/f/$slug")({ component: PublicFestival });

function PublicFestival() {
  const { slug } = Route.useParams();
  const { data, isPending } = useQuery({
    queryKey: ["fest", slug],
    queryFn: () => getPublicFestival({ data: slug }),
  });
  if (isPending) {
    return (
      <main className="theme-paper min-h-screen p-8">
        <p>Loading festival…</p>
      </main>
    );
  }
  if (!data) {
    return (
      <main className="theme-paper min-h-screen p-8">
        <p>Festival not found.</p>
      </main>
    );
  }
  const { festival: f, pages, events, vendors, sponsors, blocks } = data;
  const about = pages.find((p) => p.slug === "about");
  const guide = pages.find((p) => p.slug === "guide");
  return (
    <div className="theme-paper min-h-screen">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5">
        <Link to="/" className="text-fg">
          <Wordmark />
        </Link>
        <Link to="/login">
          <Button size="sm">Get ePASS</Button>
        </Link>
      </header>
      {blocks.length > 0 ? (
        <div className="mx-auto max-w-5xl px-4 py-8">
          {blocks.map((b) => (
            <CmsBlockView key={b.id} block={b} />
          ))}
        </div>
      ) : (
        <section className="mx-auto max-w-5xl px-4 py-12">
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid size-12 place-items-center rounded-md bg-surface-2 font-display text-xl">
              {f.logo_text}
            </span>
            <StatusBadge status={f.status} />
          </div>
          <h1 className="mt-6 font-display text-5xl tracking-tight sm:text-6xl">{f.name}</h1>
          <p className="mt-3 max-w-xl text-lg text-muted">{f.tagline}</p>
          <p className="mt-2 text-sm text-subtle">
            {f.city}, {f.province} · {f.starts_on} – {f.ends_on}
          </p>
        </section>
      )}
      {events.length > 0 ? (
        <section className="mx-auto max-w-5xl px-4 pb-12">
          <h2 className="font-display text-3xl">Program</h2>
          <p className="mt-1 text-sm text-muted">Mark the moments you cannot miss.</p>
          <div className="mt-4 divide-y divide-border rounded-xl bg-surface shadow-[var(--shadow-border)]">
            {events.map((e) => (
              <div key={e.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{e.name}</p>
                  <StatusBadge status={e.status} />
                </div>
                <p className="text-sm text-muted">
                  {e.venue_name} · {rangeLabel(e.starts_at, e.ends_at)} · {e.event_type}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {about ? (
        <section className="mx-auto max-w-5xl px-4 pb-12">
          <h2 className="font-display text-3xl">{about.title}</h2>
          <p className="mt-3 max-w-2xl text-muted">{about.body}</p>
        </section>
      ) : null}
      {vendors.length > 0 ? (
        <section className="mx-auto max-w-5xl px-4 pb-12">
          <h2 className="font-display text-3xl">Beyond the parade</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {vendors.map((v) => (
              <div key={v.id} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
                <p className="font-medium">{v.name}</p>
                <p className="text-sm text-muted">{v.description}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}
      {sponsors.length > 0 ? (
        <section className="mx-auto max-w-5xl px-4 pb-16">
          <h2 className="font-display text-3xl">Festival partners</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {sponsors.map((s) => (
              <span
                key={s.id}
                className="rounded-full bg-surface-2 px-4 py-2 text-sm shadow-[var(--shadow-border)]"
              >
                {s.name}
              </span>
            ))}
          </div>
          {guide ? <p className="mt-8 max-w-2xl text-sm text-muted">{guide.body}</p> : null}
        </section>
      ) : null}
    </div>
  );
}

function CmsBlockView({ block }: { block: CmsBlock }) {
  if (block.kind === "hero") {
    let kicker = "";
    try {
      kicker = JSON.parse(block.meta_json || "{}").kicker ?? "";
    } catch {
      kicker = "";
    }
    return (
      <section className="pb-10">
        {kicker ? (
          <p className="text-xs tracking-[0.22em] text-muted uppercase">{kicker}</p>
        ) : null}
        <h1 className="mt-3 font-display text-5xl tracking-tight sm:text-6xl">{block.heading}</h1>
        <p className="mt-4 max-w-2xl text-lg text-muted">{block.body}</p>
      </section>
    );
  }
  if (block.kind === "pathways") {
    let items: { n: string; title: string; body: string }[] = [];
    try {
      items = JSON.parse(block.meta_json || "[]");
    } catch {
      items = [];
    }
    return (
      <section className="pb-12">
        <h2 className="font-display text-3xl">{block.heading}</h2>
        <p className="mt-2 text-muted">{block.body}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.map((it) => (
            <div key={it.n} className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
              <p className="font-mono text-xs text-muted">{it.n}</p>
              <p className="mt-1 font-medium">{it.title}</p>
              <p className="mt-1 text-sm text-muted">{it.body}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }
  if (block.kind === "stats") {
    let stats: { n: string; label: string }[] = [];
    try {
      stats = JSON.parse(block.meta_json || "[]");
    } catch {
      stats = [];
    }
    return (
      <section className="pb-12">
        <h2 className="font-display text-3xl">{block.heading}</h2>
        <p className="mt-2 text-muted">{block.body}</p>
        <div className="mt-6 grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label}>
              <p className="font-display text-4xl tabular-nums">{s.n}</p>
              <p className="text-xs text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }
  return (
    <section className="pb-10">
      <h2 className="font-display text-3xl">{block.heading}</h2>
      <p className="mt-3 max-w-2xl text-muted">{block.body}</p>
    </section>
  );
}
