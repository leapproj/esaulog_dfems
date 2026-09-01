import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { php } from "@/lib/format";
import { listPackages } from "@/lib/server/erp";
import { Check, Sparkles, Building2, Handshake, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export const Route = createFileRoute("/packages")({ component: PackagesPage });

function PackagesPage() {
  const { data } = useQuery({ queryKey: ["packages"], queryFn: () => listPackages() });
  const [modelTab, setModelTab] = useState<"all" | "option_a" | "option_b">("all");

  const optionAPackages = (data ?? []).filter((p) => p.kind === "self_serve");
  const optionBPackages = (data ?? []).filter((p) => p.kind === "copartner");

  return (
    <div className="min-h-screen bg-bg text-fg">
      <SiteNav />
      
      <main className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-semibold tracking-[0.28em] text-accent uppercase">
            TukodPH eSAULOG DFEMS Pricing & Monetization
          </p>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl tracking-tight text-balance">
            Designed for Philippine Festival Scale & Realities
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted leading-relaxed">
            Choose between direct SaaS license ownership for independent LGU teams, or strategic digital co-partnership with TukodPH managing the digital festival and sharing revenue.
          </p>

          {/* Model Switcher Tabs */}
          <div className="mt-8 inline-flex items-center rounded-xl bg-surface p-1 shadow-[var(--shadow-border)] border border-border">
            <button
              type="button"
              onClick={() => setModelTab("all")}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                modelTab === "all"
                  ? "bg-accent text-accent-contrast shadow-sm"
                  : "text-muted hover:text-fg"
              }`}
            >
              All Packages
            </button>
            <button
              type="button"
              onClick={() => setModelTab("option_a")}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                modelTab === "option_a"
                  ? "bg-accent text-accent-contrast shadow-sm"
                  : "text-muted hover:text-fg"
              }`}
            >
              Option A: 3-Tier SaaS (Fixed / No RevShare)
            </button>
            <button
              type="button"
              onClick={() => setModelTab("option_b")}
              className={`rounded-lg px-4 py-2 text-xs font-medium transition-all ${
                modelTab === "option_b"
                  ? "bg-accent text-accent-contrast shadow-sm"
                  : "text-muted hover:text-fg"
              }`}
            >
              Option B: 2-Tier Co-Partner (Revenue Share)
            </button>
          </div>
        </div>

        {/* Option A Section */}
        {(modelTab === "all" || modelTab === "option_a") && (
          <section className="mt-14">
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-4 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-accent" />
                  <span className="text-xs font-semibold tracking-wider uppercase text-muted">
                    Option A — Software as a Service (SaaS)
                  </span>
                </div>
                <h2 className="mt-1 font-display text-2xl sm:text-3xl">Self-Serve Season Licenses (No Revenue Share)</h2>
              </div>
              <p className="text-xs text-muted max-w-md">
                Ideal for LGUs, Tourism Councils, and independent organizers with fixed budgets and internal operation staff.
              </p>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {optionAPackages.map((p) => {
                const features = JSON.parse(p.features_json || "[]") as string[];
                const isFeatured = p.slug === "organizer-command-center" || p.slug === "organizer-command";
                const isTopTier = p.slug === "smart-festival" || p.slug === "festival-intelligence";
                return (
                  <article
                    key={p.id}
                    className={`relative flex flex-col justify-between rounded-2xl bg-surface p-6 sm:p-7 shadow-[var(--shadow-border)] transition-all hover:shadow-[var(--shadow-border-hover)] ${
                      isTopTier ? "ring-2 ring-accent/60 bg-surface/90" : ""
                    }`}
                  >
                    {isTopTier && (
                      <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-accent-contrast shadow-sm">
                        <Sparkles className="h-3 w-3" /> Flagship Intelligence
                      </span>
                    )}
                    {isFeatured && (
                      <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-fg px-3 py-1 text-[11px] font-semibold text-bg shadow-sm">
                        Most Popular
                      </span>
                    )}
                    <div>
                      <span className="text-xs font-mono uppercase tracking-wider text-muted">
                        Flat License
                      </span>
                      <h3 className="mt-2 font-display text-2xl tracking-tight">{p.name}</h3>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="font-display text-3xl sm:text-4xl font-semibold tabular-nums text-fg">
                          {php(p.price_php)}
                        </span>
                        <span className="text-xs text-muted">{p.billing}</span>
                      </div>
                      <p className="mt-4 text-sm text-muted leading-relaxed">{p.description}</p>
                      
                      <div className="mt-6 border-t border-border pt-5">
                        <p className="text-xs font-semibold tracking-wider text-fg uppercase">Included Capabilities:</p>
                        <ul className="mt-3 space-y-2.5 text-sm">
                          {features.map((f) => (
                            <li key={f} className="flex items-start gap-2.5 text-muted">
                              <Check className="h-4 w-4 shrink-0 text-accent mt-0.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-border/60">
                      <Link to="/apply" search={{ package: p.slug }} className="w-full block">
                        <Button className="w-full" variant={isTopTier ? "default" : "outline"}>
                          Select {p.name} <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Option B Section */}
        {(modelTab === "all" || modelTab === "option_b") && (
          <section className="mt-16">
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-border pb-4 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <Handshake className="h-5 w-5 text-accent" />
                  <span className="text-xs font-semibold tracking-wider uppercase text-muted">
                    Option B — Strategic Partnership & Co-Organizer
                  </span>
                </div>
                <h2 className="mt-1 font-display text-2xl sm:text-3xl">Digital Partner & Co-Organizer (Revenue Share)</h2>
              </div>
              <p className="text-xs text-muted max-w-md">
                Zero or low upfront barrier. TukodPH acts as your digital festival consultant, provisions devices, builds sponsors, and shares digital festival revenue.
              </p>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {optionBPackages.map((p) => {
                const features = JSON.parse(p.features_json || "[]") as string[];
                const isPro = p.commission_pct >= 40 || p.slug.includes("pro");
                return (
                  <article
                    key={p.id}
                    className={`relative flex flex-col justify-between rounded-2xl bg-surface p-7 shadow-[var(--shadow-border)] border ${
                      isPro ? "border-accent ring-2 ring-accent/40" : "border-border"
                    }`}
                  >
                    {isPro && (
                      <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-accent-contrast shadow-sm">
                        <Zap className="h-3 w-3" /> Full Scale Co-Organizer
                      </span>
                    )}
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-muted">
                          Strategic Co-Partnership
                        </span>
                        <span className="inline-block rounded-full bg-surface-hover px-2.5 py-0.5 text-xs font-medium text-accent">
                          {p.commission_pct}% Revenue Share
                        </span>
                      </div>
                      <h3 className="mt-2 font-display text-2xl sm:text-3xl tracking-tight">{p.name}</h3>
                      <div className="mt-3 flex items-baseline gap-2">
                        <span className="font-display text-3xl sm:text-4xl font-semibold tabular-nums text-accent">
                          {p.commission_pct}%
                        </span>
                        <span className="text-xs text-muted">Commission on digital festival income</span>
                      </div>
                      <p className="mt-4 text-sm text-muted leading-relaxed">{p.description}</p>
                      
                      <div className="mt-6 border-t border-border pt-5">
                        <p className="text-xs font-semibold tracking-wider text-fg uppercase">Deliverables & Support:</p>
                        <ul className="mt-3 space-y-2.5 text-sm">
                          {features.map((f) => (
                            <li key={f} className="flex items-start gap-2.5 text-muted">
                              <Check className="h-4 w-4 shrink-0 text-accent mt-0.5" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-border/60">
                      <Link to="/apply" search={{ package: p.slug }} className="w-full block">
                        <Button className="w-full" variant={isPro ? "default" : "outline"}>
                          Partner as {p.name} <ArrowRight className="ml-1.5 h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Feature Comparison Matrix */}
        <section className="mt-20 rounded-2xl bg-surface p-6 sm:p-10 shadow-[var(--shadow-border)] border border-border">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.28em] text-accent uppercase">
              Capability Matrix
            </p>
            <h2 className="mt-2 font-display text-3xl tracking-tight">Compare All Tiers at a Glance</h2>
            <p className="mt-2 text-sm text-muted">
              Whether you need the digital front door for citizens or high-throughput QR gate terminals and AI dispatching, eSAULOG scales with your festival scope.
            </p>
          </div>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-border text-xs uppercase tracking-wider text-muted">
                  <th className="py-3 px-4">Feature / Deliverable</th>
                  <th className="py-3 px-4">Starter Website</th>
                  <th className="py-3 px-4">Organizer Command</th>
                  <th className="py-3 px-4">Smart Festival</th>
                  <th className="py-3 px-4 text-accent">Digital Partner (25%)</th>
                  <th className="py-3 px-4 text-accent">Smart Pro (40%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {[
                  ["Public Festival Website & CMS", "Yes", "Yes", "Yes", "Yes", "Yes"],
                  ["Event Calendar & Social Auto-Publish", "Yes", "Yes", "Yes", "Yes", "Yes"],
                  ["Participant Portal & ePASS Credentials", "—", "Yes", "Yes", "Yes", "Yes"],
                  ["Gate Staff QR Access Validation Keys", "—", "Yes", "Yes", "Yes", "Yes"],
                  ["Scan QR Devices Exclusive", "—", "Exclusive", "Exclusive", "Exclusive", "Exclusive"],
                  ["Turnout & Income Ledgers Analytics", "—", "—", "Yes", "Yes", "Yes"],
                  ["AI Festival Organizer Engine", "—", "—", "Yes", "Yes", "Yes"],
                  ["Trade Fair Cashless Expo (2 Expos)", "—", "—", "Yes", "Yes", "Yes"],
                  ["MSME Booster Directory", "—", "—", "Yes", "Yes", "Yes"],
                  ["TukodPH On-Ground Team Support", "—", "—", "—", "Start-to-Finish", "Start-to-Finish"],
                  ["Sponsors Outsourcing & Marketing", "—", "—", "—", "Limited", "Full Outsourcing"],
                  ["Post-Event Data Evaluation Report", "—", "—", "—", "—", "Full Comprehensive"],
                ].map(([feature, t1, t2, t3, t4, t5], idx) => (
                  <tr key={idx} className="hover:bg-surface-hover transition-colors">
                    <td className="py-3.5 px-4 font-medium text-fg">{feature}</td>
                    <td className="py-3.5 px-4 text-muted">{t1 === "Yes" ? <Check className="h-4 w-4 text-accent" /> : t1}</td>
                    <td className="py-3.5 px-4 text-muted">{t2 === "Yes" ? <Check className="h-4 w-4 text-accent" /> : t2}</td>
                    <td className="py-3.5 px-4 text-muted">{t3 === "Yes" ? <Check className="h-4 w-4 text-accent" /> : t3}</td>
                    <td className="py-3.5 px-4 font-medium text-accent">{t4 === "Yes" ? <Check className="h-4 w-4 text-accent" /> : t4}</td>
                    <td className="py-3.5 px-4 font-medium text-accent">{t5 === "Yes" ? <Check className="h-4 w-4 text-accent" /> : t5}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            <div className="flex items-center gap-3 text-xs text-muted">
              <ShieldCheck className="h-5 w-5 text-accent shrink-0" />
              <span>
                All tenants backed by TukodPH secure infrastructure, offline-resilient QR scan terminals, and live telemetry.
              </span>
            </div>
            <Link to="/apply">
              <Button>
                Get Started with eSAULOG <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

