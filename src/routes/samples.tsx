import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/samples")({ component: SamplesPage });

const SAMPLES = [
  {
    name: "Higalaay Festival",
    place: "Cagayan de Oro",
    live: "https://higalaayfestival.com",
    slug: "higalaay-2026",
    note: "Visitor-first festival website: programme, place, partners, participation. Case study on TukodPH.",
  },
  {
    name: "Diyandi Festival 2026",
    place: "Iligan",
    live: "https://tukodph.com/diyandi/",
    slug: "diyandi-2026",
    note: "CMS microsite with pathways — schedule, visitor days, story, volunteer. Digital co-partner model.",
  },
];

function SamplesPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-4xl px-4 py-12">
        <p className="text-xs tracking-[0.28em] text-muted uppercase">TukodPH CMS</p>
        <h1 className="mt-3 font-display text-5xl tracking-tight">Festival websites</h1>
        <p className="mt-4 max-w-2xl text-muted">
          Tenants build public sites in the Organizer Command Center with a WordPress-like CMS —
          the same control desk used at cms.tukodph.com. Structure over spectacle: discover,
          understand, plan, participate.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          {SAMPLES.map((s) => (
            <article key={s.name} className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
              <p className="text-xs text-muted">{s.place}</p>
              <h2 className="mt-1 font-display text-2xl">{s.name}</h2>
              <p className="mt-3 text-sm text-muted">{s.note}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to="/f/$slug" params={{ slug: s.slug }}>
                  <Button size="sm">Open tenant site</Button>
                </Link>
                <a href={s.live} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline">
                    Live on the web
                  </Button>
                </a>
              </div>
            </article>
          ))}
        </div>
        <p className="mt-10 text-sm text-muted">
          CMS control desk:{" "}
          <a href="https://cms.tukodph.com" className="underline-offset-4 hover:underline">
            cms.tukodph.com
          </a>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
