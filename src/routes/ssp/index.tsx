import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BarChart3,
  Building2,
  CalendarDays,
  Inbox,
  KeyRound,
  Network,
  Shield,
  Handshake,
  Zap,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  Check,
  TrendingUp,
  SlidersHorizontal,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { CreateCopartnerDialog } from "@/components/hq-create-festival";
import { HQ_SCOPE, hqDesk, hqTitle } from "@/components/hq-chrome";
import { Page, PageHeader, Stat } from "@/components/shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { compact, php, shortDay, stampLabel } from "@/lib/format";
import { getSspIntelligence, getSspOverview, hqGoLive } from "@/lib/server/ssp";
import { setApplicationStatus } from "@/lib/server/erp";
import { toast } from "sonner";

export const Route = createFileRoute("/ssp/")({ component: SspHome });

const TOOLTIP = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  color: "var(--color-fg)",
  borderRadius: 8,
  fontSize: 12,
};

type TenantTab = "all" | "applications" | "approved" | "copartners";

function SspHome() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["ssp"], queryFn: () => getSspOverview() });
  const intel = useQuery({ queryKey: ["ssp-intel"], queryFn: () => getSspIntelligence() });
  const [open, setOpen] = useState(false);
  const [tenantTab, setTenantTab] = useState<TenantTab>("all");
  const [filterTier, setFilterTier] = useState<"all" | "copartner_lite" | "copartner_pro" | "saas">("all");

  const s = data?.stats;
  const pendingApps = (data?.apps ?? []).filter((a: { status: string }) => a.status === "pending");
  const approvedApps = (data?.apps ?? []).filter((a: { status: string }) => a.status === "approved" || a.status === "active");
  const copartnerFestivals = (data?.festivals ?? []).filter((f: any) => f.copartner);

  const goLive = useMutation({
    mutationFn: (id: string) => hqGoLive({ data: { id } }),
    onSuccess: () => {
      toast.success("Festival is live on the TukodPH network");
      void qc.invalidateQueries({ queryKey: ["ssp"] });
      void qc.invalidateQueries({ queryKey: ["ssp-intel"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setApp = useMutation({
    mutationFn: (input: { id: string; status: string }) => setApplicationStatus({ data: input }),
    onSuccess: () => {
      toast.success("Application status updated");
      void qc.invalidateQueries({ queryKey: ["ssp"] });
      void qc.invalidateQueries({ queryKey: ["hq"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const chart = (intel.data?.byFestival ?? []).map((f: any) => ({
    name: String(f.name).replace(/ 20\d\d/, ""),
    turnout: f.turnout,
    checkins: f.checkins,
    digital: f.digital,
    commission: f.copartner ? Math.round((f.digital * Number(f.commission_pct || 25)) / 100) : 0,
  }));

  const mix = [
    { name: "Physical", value: intel.data?.totals?.physical ?? 0, fill: "var(--color-muted)" },
    { name: "Digital", value: intel.data?.totals?.digital ?? 0, fill: "var(--color-accent)" },
  ];

  const hqOps = (data?.operators ?? []).filter((o: { kind: string }) => o.kind === "ssp");

  if (isLoading) {
    return (
      <Page>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="mt-3 h-4 w-96" />
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <Skeleton className="mt-8 h-64 rounded-xl" />
      </Page>
    );
  }

  // Filtered festivals
  const filteredFestivals = (data?.festivals ?? []).filter((f: any) => {
    if (filterTier === "all") return true;
    if (filterTier === "copartner_lite") return f.copartner && (f.package_slug?.includes("lite") || f.commission_pct <= 30);
    if (filterTier === "copartner_pro") return f.copartner && (f.package_slug?.includes("pro") || f.commission_pct >= 35);
    if (filterTier === "saas") return !f.copartner;
    return true;
  });

  return (
    <Page>
      <PageHeader
        eyebrow="eSAULOG Solution System Portal (SSP)"
        title="TukodPH Super Admin Headquarters"
        description="Master control center for Philippine festival tenants: provision digital co-partner festivals, review organizer intake applications, monitor revenue ledgers, and manage the eSAULOG fleet."
        actions={
          <div className="flex items-center gap-2">
            <Link to="/ssp/applications">
              <Button variant="outline" className="relative">
                <Inbox className="mr-1.5 h-4 w-4" />
                Intake Queue
                {pendingApps.length > 0 && (
                  <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.2 text-[10px] font-bold text-accent-fg">
                    {pendingApps.length}
                  </span>
                )}
              </Button>
            </Link>
            <Button onClick={() => setOpen(true)} className="shadow-sm">
              <Plus className="mr-1.5 h-4 w-4" />
              Provision Tenant
            </Button>
          </div>
        }
      />

      {/* Super Admin Session & Identity Bar */}
      {data?.me ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-accent/20 bg-surface px-5 py-4 shadow-[var(--shadow-border)]">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent ring-1 ring-accent/30">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display font-semibold text-fg">{data.me.display_name}</p>
                <span className="rounded bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-accent">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-xs text-muted">
                {hqTitle(data.me.username)} · <span className="font-mono text-accent">{data.me.username}</span> · {hqDesk(data.me.username)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-muted">
            <div>
              <span className="block text-[10px] uppercase tracking-wider text-muted">Session Status</span>
              <span className="font-medium text-emerald-500 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Authenticated
              </span>
            </div>
            <div className="hidden sm:block border-l border-border pl-4">
              <span className="block text-[10px] uppercase tracking-wider text-muted">Passkey Vault</span>
              <Link to="/ssp/users" className="text-accent hover:underline flex items-center gap-1 font-medium">
                <KeyRound className="h-3 w-3" /> Rotate Keys
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      {/* Primary eSAULOG Dashboard KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Live Festivals" value={s?.festivals ?? "—"} hint="Published on network" />
        <Stat label="Draft & Setup" value={s?.upcoming ?? "—"} hint="In planning pipeline" />
        <Stat
          label="Option B Co-Partners"
          value={s?.copartner_tenants ?? "—"}
          hint="RevShare partnerships"
        />
        <Stat label="Total Turnout" value={s ? compact(s.participants) : "—"} hint="Registered citizens" />
        <Stat
          label="TukodPH RevShare"
          value={data ? php(data.commission) : "—"}
          hint="Co-partner digital income"
        />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Network Events" value={s ? compact(s.events) : "—"} hint="Across all festivals" />
        <Stat label="Gate Check-ins" value={s ? compact(s.checkins) : "—"} hint="QR verified passes" />
        <Stat label="Physical Sponsors" value={s ? php(s.physical) : "—"} hint="Retained by organizer" />
        <Stat label="Digital Sponsors" value={s ? php(s.digital) : "—"} hint="Shared digital gross" />
        <Stat
          label="Intake Applications"
          value={s?.pending_apps ?? "—"}
          hint={pendingApps.length > 0 ? "Requires review" : "Up to date"}
        />
      </div>

      {/* Interactive Charts Section */}
      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-border)] lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                eSAULOG Citizen Turnout & Gate Validations
              </p>
              <p className="text-xs text-muted">Registered attendees vs gate check-ins by festival</p>
            </div>
            <Link to="/ssp/analytics" className="flex items-center gap-1 text-xs text-accent hover:underline">
              <TrendingUp className="h-3.5 w-3.5" /> Full Ledger
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid stroke="color-mix(in oklab, var(--color-fg) 8%, transparent)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "var(--color-muted)", fontSize: 11 }} />
              <YAxis tick={{ fill: "var(--color-muted)", fontSize: 11 }} />
              <Tooltip contentStyle={TOOLTIP} />
              <Bar dataKey="turnout" name="Registered Pax" fill="var(--color-muted)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="checkins" name="Gate Check-ins" fill="var(--color-accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Festival Revenue Architecture
          </p>
          <p className="text-xs text-muted">Physical (Organizer) vs Digital (Shared)</p>
          <div className="my-2">
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie data={mix} dataKey="value" nameKey="name" innerRadius={40} outerRadius={62} paddingAngle={4}>
                  {mix.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP} formatter={(v: number) => php(v)} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="space-y-1.5 text-xs">
            {mix.map((d) => (
              <li key={d.name} className="flex items-center justify-between">
                <span className="text-muted flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.fill }}></span>
                  {d.name} Sponsors
                </span>
                <span className="font-mono font-medium">{php(d.value)}</span>
              </li>
            ))}
            <li className="flex items-center justify-between border-t border-border pt-1.5">
              <span className="font-medium text-accent">TukodPH RevShare Yield</span>
              <span className="font-mono font-bold text-accent">{php(data?.commission ?? 0)}</span>
            </li>
          </ul>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SSP TENANT ACCOUNTS MANAGEMENT HUB                                        */}
      {/* ========================================================================= */}
      <div className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h2 className="font-display text-2xl tracking-tight">SSP Tenant Accounts</h2>
            <p className="text-sm text-muted">
              Manage live festivals, incoming organizer applications, approved licenses, and Option B co-partner drafts.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-1 rounded-xl bg-surface-2 p-1 text-xs">
            <button
              onClick={() => setTenantTab("all")}
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                tenantTab === "all" ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg"
              }`}
            >
              All Tenants ({data?.festivals?.length ?? 0})
            </button>
            <button
              onClick={() => setTenantTab("applications")}
              className={`relative rounded-lg px-3 py-1.5 font-medium transition-all ${
                tenantTab === "applications" ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg"
              }`}
            >
              New Applications
              {pendingApps.length > 0 && (
                <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.2 text-[10px] font-bold text-accent-fg">
                  {pendingApps.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setTenantTab("approved")}
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                tenantTab === "approved" ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg"
              }`}
            >
              Approved Licenses ({approvedApps.length})
            </button>
            <button
              onClick={() => setTenantTab("copartners")}
              className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
                tenantTab === "copartners" ? "bg-surface text-accent shadow-sm" : "text-muted hover:text-fg"
              }`}
            >
              Option B Co-Partners ({copartnerFestivals.length})
            </button>
          </div>
        </div>

        {/* TAB 1: ALL TENANTS */}
        {tenantTab === "all" && (
          <div className="mt-4">
            {/* Filter pills */}
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs text-muted">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Tier Filter:</span>
                <button
                  onClick={() => setFilterTier("all")}
                  className={`rounded-md px-2 py-1 ${filterTier === "all" ? "bg-surface font-semibold text-fg border border-border" : "hover:text-fg"}`}
                >
                  All Tiers
                </button>
                <button
                  onClick={() => setFilterTier("copartner_lite")}
                  className={`rounded-md px-2 py-1 ${filterTier === "copartner_lite" ? "bg-surface font-semibold text-accent border border-accent/30" : "hover:text-fg"}`}
                >
                  Lite (25%)
                </button>
                <button
                  onClick={() => setFilterTier("copartner_pro")}
                  className={`rounded-md px-2 py-1 ${filterTier === "copartner_pro" ? "bg-surface font-semibold text-accent border border-accent/30" : "hover:text-fg"}`}
                >
                  Pro (40%)
                </button>
                <button
                  onClick={() => setFilterTier("saas")}
                  className={`rounded-md px-2 py-1 ${filterTier === "saas" ? "bg-surface font-semibold text-fg border border-border" : "hover:text-fg"}`}
                >
                  Direct SaaS
                </button>
              </div>

              <span className="text-xs text-muted">
                Showing {filteredFestivals.length} of {data?.festivals?.length ?? 0} tenants
              </span>
            </div>

            <div className="divide-y divide-border rounded-2xl border border-border bg-surface shadow-[var(--shadow-border)]">
              {filteredFestivals.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted">No festival tenants found matching criteria.</p>
              ) : (
                filteredFestivals.map((f: any) => (
                  <div
                    key={f.id}
                    className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-surface-hover/50"
                  >
                    <div className="min-w-0 max-w-md">
                      <div className="flex items-center gap-2">
                        <Link
                          to="/ssp/festivals/$festivalId"
                          params={{ festivalId: f.id }}
                          className="font-display text-base font-semibold text-fg hover:text-accent"
                        >
                          {f.name}
                        </Link>
                        {f.copartner ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent">
                            <Handshake className="h-3 w-3" />
                            Option B ({f.commission_pct || 25}%)
                          </span>
                        ) : (
                          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium text-muted">
                            Option A SaaS
                          </span>
                        )}
                      </div>
                      <p className="mt-0.5 text-xs text-muted">
                        {f.city}, {f.province} · {f.starts_on} to {f.ends_on} · {f.organizer_name}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-right text-xs">
                        <p className="font-mono font-medium text-fg">{compact(f.participants)} pax</p>
                        <p className="text-muted">{compact(f.checkins)} check-ins</p>
                      </div>

                      <div className="text-right text-xs">
                        <p className="font-mono font-medium text-fg">{php(f.digital)} digital</p>
                        {f.copartner ? (
                          <p className="font-mono text-accent">+{php(f.commission)} share</p>
                        ) : (
                          <p className="text-muted">Direct license</p>
                        )}
                      </div>

                      <StatusBadge status={f.status} />

                      <div className="flex items-center gap-1.5">
                        <Link
                          to="/admin/$festivalId"
                          params={{ festivalId: f.id }}
                          className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-muted hover:border-accent/40 hover:text-fg"
                        >
                          Command Center
                        </Link>
                        <Link
                          to="/f/$slug"
                          params={{ slug: f.slug }}
                          target="_blank"
                          className="rounded-lg border border-border bg-surface p-1.5 text-xs text-muted hover:text-fg"
                          title="Open Public Site"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                        {f.status !== "LIVE" && f.status !== "ENDED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-accent/40 text-accent hover:bg-accent/10"
                            disabled={goLive.isPending}
                            onClick={() => goLive.mutate(f.id)}
                          >
                            Go Live
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: NEW APPLICATIONS (INTAKE) */}
        {tenantTab === "applications" && (
          <div className="mt-4">
            <div className="divide-y divide-border rounded-2xl border border-border bg-surface shadow-[var(--shadow-border)]">
              {pendingApps.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                  <p className="mt-2 font-display font-semibold text-fg">Intake Queue is Clear</p>
                  <p className="text-xs text-muted">All incoming festival organizer applications have been reviewed.</p>
                </div>
              ) : (
                pendingApps.map((a: any) => {
                  const isCopartner = a.package_kind === "copartner" || a.package_slug?.includes("copartner");
                  return (
                    <div key={a.id} className="flex flex-wrap items-start justify-between gap-4 p-5">
                      <div className="max-w-lg">
                        <div className="flex items-center gap-2">
                          <p className="font-display text-base font-semibold text-fg">{a.festival_name}</p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              isCopartner ? "bg-accent/15 text-accent" : "bg-surface-2 text-muted"
                            }`}
                          >
                            {a.package_name || "Custom License"}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-muted">
                          <strong className="text-fg">{a.organization_name}</strong> · {a.city}, {a.province}
                        </p>
                        <p className="text-xs text-muted">
                          Contact: {a.contact_name} ({a.contact_email}) · Applied {stampLabel(a.created_at)}
                        </p>
                        {a.notes && (
                          <div className="mt-2.5 rounded-xl bg-surface-2 p-2.5 text-xs text-muted italic">
                            "{a.notes}"
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          disabled={setApp.isPending}
                          onClick={() => setApp.mutate({ id: a.id, status: "approved" })}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <Check className="mr-1 h-3.5 w-3.5" />
                          Approve & Provision
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          disabled={setApp.isPending}
                          onClick={() => setApp.mutate({ id: a.id, status: "rejected" })}
                          className="text-red-500 hover:bg-red-500/10 hover:text-red-600"
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 3: APPROVED LICENSES */}
        {tenantTab === "approved" && (
          <div className="mt-4">
            <div className="divide-y divide-border rounded-2xl border border-border bg-surface shadow-[var(--shadow-border)]">
              {approvedApps.length === 0 ? (
                <p className="px-5 py-8 text-center text-sm text-muted">No approved licenses in record.</p>
              ) : (
                approvedApps.map((a: any) => (
                  <div key={a.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-display font-medium text-fg">{a.festival_name}</p>
                        <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-emerald-500">
                          APPROVED
                        </span>
                      </div>
                      <p className="text-xs text-muted">
                        {a.organization_name} · {a.package_name} · {a.city}, {a.province}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {a.festival_id && (
                        <Link
                          to="/admin/$festivalId"
                          params={{ festivalId: a.festival_id }}
                          className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium text-muted hover:border-accent hover:text-fg"
                        >
                          Open Command Center
                        </Link>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 4: DRAFT SMART FESTIVAL ORGANIZER CO-PARTNERS (OPTION B TIERS) */}
        {tenantTab === "copartners" && (
          <div className="mt-4 grid gap-4">
            {/* Header info banner for Option B */}
            <div className="rounded-2xl border border-accent/30 bg-surface p-4 text-xs text-muted">
              <div className="flex items-center gap-2 text-sm font-semibold text-accent">
                <Handshake className="h-4 w-4" />
                <span>TukodPH Option B Co-Partner Model Architecture</span>
              </div>
              <p className="mt-1 leading-relaxed">
                Under Option B, TukodPH operates as the digital co-partner/co-organizer. Physical sponsorships remain 100% with the organizer. TukodPH earns revenue share on digital sponsor income (25% for <strong>Digital Festival Lite</strong>, 40% for <strong>Smart Festival Pro</strong>).
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {copartnerFestivals.length === 0 ? (
                <div className="col-span-2 rounded-2xl border border-border bg-surface p-8 text-center">
                  <p className="text-sm text-muted">No Option B co-partner festivals yet.</p>
                  <Button onClick={() => setOpen(true)} className="mt-3">
                    <Plus className="mr-1.5 h-4 w-4" /> Provision Co-Partner
                  </Button>
                </div>
              ) : (
                copartnerFestivals.map((f: any) => {
                  const isPro = f.package_slug?.includes("pro") || f.commission_pct >= 35;
                  const isDraft = ["DRAFT", "PLANNING", "SETUP"].includes(f.status);

                  return (
                    <div
                      key={f.id}
                      className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-border)]"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                                  isPro ? "bg-accent text-accent-fg" : "bg-accent/20 text-accent"
                                }`}
                              >
                                {isPro ? <Zap className="h-3 w-3" /> : <Handshake className="h-3 w-3" />}
                                {isPro ? "Smart Festival Pro (40%)" : "Digital Festival Lite (25%)"}
                              </span>
                              <StatusBadge status={f.status} />
                            </div>
                            <h3 className="mt-2 font-display text-lg font-semibold text-fg">{f.name}</h3>
                            <p className="text-xs text-muted">
                              {f.city}, {f.province} · {f.organizer_name}
                            </p>
                          </div>

                          <div className="text-right font-mono text-xs">
                            <span className="block text-[10px] uppercase text-muted">RevShare Yield</span>
                            <span className="font-bold text-accent">{php(f.commission)}</span>
                          </div>
                        </div>

                        {/* Deliverables Checklist based on Tier */}
                        <div className="mt-4 rounded-xl border border-border bg-surface-2 p-3 text-xs">
                          <p className="font-semibold text-fg">TukodPH Co-Partner Deliverables:</p>
                          <ul className="mt-2 space-y-1 text-muted">
                            <li className="flex items-center gap-1.5">
                              <Check className="h-3.5 w-3.5 text-accent" /> Public Website + TukodPH CMS
                            </li>
                            <li className="flex items-center gap-1.5">
                              <Check className="h-3.5 w-3.5 text-accent" /> QR Code Gate Devices & Scanner Fleet
                            </li>
                            <li className="flex items-center gap-1.5">
                              <Check className="h-3.5 w-3.5 text-accent" />
                              {isPro ? "Full Sponsor Outsourcing (Pre-Event)" : "Digital Sponsor Lead Consulting"}
                            </li>
                            <li className="flex items-center gap-1.5">
                              {isPro ? (
                                <Check className="h-3.5 w-3.5 text-accent" />
                              ) : (
                                <Clock className="h-3.5 w-3.5 text-muted" />
                              )}
                              <span className={isPro ? "text-fg font-medium" : "text-muted"}>
                                On-Ground TukodPH Team Deployment {isPro ? "(Included)" : "(Pro Tier only)"}
                              </span>
                            </li>
                            <li className="flex items-center gap-1.5">
                              {isPro ? (
                                <Check className="h-3.5 w-3.5 text-accent" />
                              ) : (
                                <Clock className="h-3.5 w-3.5 text-muted" />
                              )}
                              <span className={isPro ? "text-fg font-medium" : "text-muted"}>
                                Post-Event Evaluation & Intelligence Report {isPro ? "(Included)" : "(Pro Tier only)"}
                              </span>
                            </li>
                          </ul>
                        </div>

                        {f.copartner_notes && (
                          <p className="mt-2.5 text-[11px] text-muted italic line-clamp-2">
                            "{f.copartner_notes}"
                          </p>
                        )}
                      </div>

                      <div className="mt-5 flex items-center justify-between border-t border-border pt-3">
                        <Link
                          to="/admin/$festivalId"
                          params={{ festivalId: f.id }}
                          className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                        >
                          Open Command Center <ArrowRight className="h-3.5 w-3.5" />
                        </Link>

                        <div className="flex items-center gap-2">
                          {isDraft && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs"
                              disabled={goLive.isPending}
                              onClick={() => goLive.mutate(f.id)}
                            >
                              Launch Festival
                            </Button>
                          )}
                          <Link to="/ssp/festivals/$festivalId" params={{ festivalId: f.id }}>
                            <Button size="sm" variant="ghost" className="text-xs">
                              Agreement Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* SUPER ADMIN SCOPE & SHORTCUTS                                             */}
      {/* ========================================================================= */}
      <h2 className="mt-12 font-display text-2xl tracking-tight">Super Admin Operations Desk</h2>
      <p className="mt-1 text-sm text-muted">
        Centralized operations for the three designated TukodPH Super Admins.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {HQ_SCOPE.map((item) => (
          <div key={item.title} className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-border)]">
            <p className="font-display font-medium text-fg">{item.title}</p>
            <p className="mt-1 text-xs text-muted leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <HqAction
          to="/ssp/festivals"
          icon={<Building2 className="size-4" />}
          title="Provision Co-Partner Festival"
          body="Deploy a full digital festival tenant with 25% or 40% revenue share terms."
        />
        <HqAction
          to="/ssp/events"
          icon={<CalendarDays className="size-4" />}
          title="Manage Network Events"
          body="Monitor, publish, and control all event schedules across Philippines festival tenants."
        />
        <HqAction
          to="/ssp/applications"
          icon={<Inbox className="size-4" />}
          title="Review Intake Applications"
          body={`${pendingApps.length} pending requests. Fast-track self-serve or co-partner onboarding.`}
        />
        <HqAction
          to="/ssp/analytics"
          icon={<BarChart3 className="size-4" />}
          title="Financial & Turnout Intelligence"
          body="Real-time income ledgers, sponsor breakdown, and TukodPH commission yields."
        />
        <HqAction
          to="/ssp/users"
          icon={<KeyRound className="size-4" />}
          title="Super Admin Passkeys"
          body="Manage and rotate cryptographic access keys for the 3 TukodPH Super Admin operators."
        />
        <Link
          to="/ssp/network"
          className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-border)] transition-[box-shadow] duration-150 hover:shadow-[var(--shadow-border-hover)]"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-surface-2 text-accent">
            <Network className="size-4" />
          </div>
          <p className="mt-4 font-display font-medium text-fg">Network-Wide Registry</p>
          <p className="mt-1 text-xs text-muted">
            Aggregated directory of participants, sponsors, vendors, and staff across every island.
          </p>
        </Link>
      </div>

      {/* Super Admin Team Roster */}
      <h2 className="mt-10 font-display text-2xl tracking-tight">Designated Super Admin Operators</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-3">
        {hqOps.map((o: any) => (
          <div
            key={o.id}
            className="flex flex-col justify-between rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-border)]"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-accent">{o.username}</span>
                <span className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted font-medium">
                  <Shield className="h-3 w-3 text-accent" /> Super Admin
                </span>
              </div>
              <p className="mt-1 font-display text-base font-semibold text-fg">{o.display_name}</p>
              <p className="text-xs text-muted font-medium">{hqTitle(o.username)}</p>
              <p className="mt-2 text-xs text-muted leading-snug">{hqDesk(o.username)}</p>
            </div>
            <div className="mt-3 border-t border-border pt-2 text-[11px] text-muted">
              {o.contact_email}
            </div>
          </div>
        ))}
      </div>

      {/* Network Events Fleet */}
      <h2 className="mt-10 font-display text-2xl tracking-tight">Network Events Fleet</h2>
      <p className="mt-1 text-sm text-muted">Live and upcoming schedule across all festival tenants.</p>
      <div className="mt-3 divide-y divide-border rounded-2xl border border-border bg-surface shadow-[var(--shadow-border)]">
        {(data?.events ?? []).map((e: any) => (
          <Link
            key={e.id}
            to="/admin/$festivalId/events/$eventId"
            params={{ festivalId: e.festival_id, eventId: e.id }}
            className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-surface-hover/50"
          >
            <div>
              <p className="font-display font-medium text-fg">{e.name}</p>
              <p className="text-xs text-muted">
                <strong className="text-fg">{e.festival_name}</strong> · {shortDay(e.starts_at)}
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted">
              <span className="capitalize rounded bg-surface-2 px-2 py-0.5 font-medium">{e.event_type}</span>
              <span className="font-mono tabular-nums">
                {e.checkin_count}/{e.registered_count} Pax
              </span>
              <StatusBadge status={e.status} />
            </div>
          </Link>
        ))}
      </div>

      <CreateCopartnerDialog open={open} onOpenChange={setOpen} />
    </Page>
  );
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

function HqAction({
  to,
  icon,
  title,
  body,
}: {
  to: "/ssp/festivals" | "/ssp/events" | "/ssp/applications" | "/ssp/analytics" | "/ssp/users";
  icon: ReactNode;
  title: string;
  body: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-border)] transition-[box-shadow,border-color] duration-150 hover:border-accent/40 hover:shadow-[var(--shadow-border-hover)]"
    >
      <div className="flex size-9 items-center justify-center rounded-xl bg-surface-2 text-accent">
        {icon}
      </div>
      <p className="mt-4 font-display font-medium text-fg">{title}</p>
      <p className="mt-1 text-xs text-muted leading-relaxed">{body}</p>
    </Link>
  );
}
