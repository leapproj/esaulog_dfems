import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/product")({ component: ProductPage });

function ProductPage() {
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-xs tracking-[0.28em] text-muted uppercase">Product</p>
        <h1 className="mt-3 font-display text-5xl tracking-tight">eSAULOG DFEMS</h1>
        <p className="mt-4 text-lg text-muted">
          Digital Festival Event Management System — the SaaS ERP TukodPH built so Philippine
          festivals can plan, operate, authenticate, engage, and measure without a custom rebuild
          every season.
        </p>
        <p className="mt-4 text-sm text-muted">
          TukodPH is a product studio:{" "}
          <span className="text-fg">build the software your business needs next</span>. eSAULOG is
          that software for festivals — from the first decision to a reliable launch. Read the
          company at{" "}
          <a href="https://tukodph.com" className="underline-offset-4 hover:underline">
            tukodph.com
          </a>
          .
        </p>

        <h2 className="mt-12 font-display text-3xl">What a tenant receives</h2>
        <ul className="mt-4 space-y-3 text-sm text-muted">
          {[
            "Organizer Command Center — draft, calendar, sponsors, portals, go-live.",
            "TukodPH CMS — WordPress-like blocks for the public festival website.",
            "Participant portal — discover, join, ePASS, missions, explore.",
            "Gate-staff portal — event access key, scan, valid or invalid.",
            "Vendor desk and sponsor environment — visibility and activations, not a POS.",
            "Festival Intelligence — turnout, income, sponsor analytics, AI organizer.",
          ].map((t) => (
            <li key={t} className="border-b border-border py-2">
              {t}
            </li>
          ))}
        </ul>

        <h2 className="mt-12 font-display text-3xl">How planning stays a draft</h2>
        <p className="mt-3 text-sm text-muted">
          A new tenant is unpublished until the whole plan is complete: identity and dates, event
          calendar, sponsor activation, CMS website, participant portal, and gate-staff keys. Save
          the draft as you go. Super Admin HQ can open any command center and set the tenant live
          when the checklist is done.
        </p>

        <h2 className="mt-12 font-display text-3xl">TukodPH CMS</h2>
        <p className="mt-3 text-sm text-muted">
          The same WordPress-like control desk used at{" "}
          <a href="https://cms.tukodph.com" className="underline-offset-4 hover:underline">
            cms.tukodph.com
          </a>
          : pages, blocks, draft or publish. Structure over spectacle — discover, understand, plan,
          participate. See{" "}
          <Link to="/samples" className="underline-offset-4 hover:underline">
            Higalaay
          </Link>{" "}
          and Diyandi as live references.
        </p>

        <h2 className="mt-12 font-display text-3xl">Two ways to run it</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
            <p className="text-xs tracking-wide text-muted uppercase">Option A · Self-serve SaaS</p>
            <p className="mt-2 font-medium">You operate the tenant (No RevShare)</p>
            <p className="mt-2 text-sm text-muted">
              Choose from <strong>Starter Website (₱90k)</strong>, <strong>Organizer Command Center (₱250k)</strong>, or <strong>Smart Festival (₱490k)</strong>. Complete ownership, gate access keys, ePASS, and AI dispatching.
            </p>
          </div>
          <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
            <p className="text-xs tracking-wide text-muted uppercase">Option B · Strategic Co-partner</p>
            <p className="mt-2 font-medium">TukodPH operates the digital festival</p>
            <p className="mt-2 text-sm text-muted">
              <strong>Digital Festival Lite (25% RevShare)</strong> or <strong>Smart Festival Pro (40% RevShare)</strong>. TukodPH outsources sponsors, provides on-ground support, and delivers comprehensive post-event evaluation reports.
            </p>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/apply">
            <Button>Apply as tenant</Button>
          </Link>
          <Link to="/packages">
            <Button variant="outline">Packages</Button>
          </Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
