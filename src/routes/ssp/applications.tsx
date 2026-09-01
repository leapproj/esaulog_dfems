import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Page, PageHeader } from "@/components/shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { getHqEconomics, setApplicationStatus, setCopartnerStatus } from "@/lib/server/erp";
import { toast } from "sonner";
import { Handshake, Check, Inbox, Building2 } from "lucide-react";
import { stampLabel } from "@/lib/format";

export const Route = createFileRoute("/ssp/applications")({ component: AppsPage });

function AppsPage() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["hq"], queryFn: () => getHqEconomics() });
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "copartners">("all");

  const setApp = useMutation({
    mutationFn: (input: { id: string; status: string }) => setApplicationStatus({ data: input }),
    onSuccess: (res, vars) => {
      toast.success(vars.status === "approved" ? "Application approved & festival provisioned" : "Application status updated");
      void qc.invalidateQueries({ queryKey: ["hq"] });
      void qc.invalidateQueries({ queryKey: ["ssp"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const setCp = useMutation({
    mutationFn: (input: { id: string; status: string }) => setCopartnerStatus({ data: input }),
    onSuccess: () => {
      toast.success("Co-partner agreement activated");
      void qc.invalidateQueries({ queryKey: ["hq"] });
      void qc.invalidateQueries({ queryKey: ["ssp"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const allApps = data?.apps ?? [];
  const pendingApps = allApps.filter((a: any) => a.status === "pending");
  const approvedApps = allApps.filter((a: any) => a.status === "approved" || a.status === "active");
  const agreements = data?.agreements ?? [];

  const displayedApps = allApps.filter((a: any) => {
    if (filter === "pending") return a.status === "pending";
    if (filter === "approved") return a.status === "approved" || a.status === "active";
    return true;
  });

  return (
    <Page>
      <PageHeader
        eyebrow="TukodPH Intake Center"
        title="Festival Tenant Applications"
        description="Review intake submissions from festival organizers across the Philippines. Approve self-serve SaaS licenses or activate Option B Digital Co-Partner agreements (25% Lite vs 40% Smart Pro)."
      />

      {/* Filter Tabs */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex flex-wrap gap-1 rounded-xl bg-surface-2 p-1 text-xs">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
              filter === "all" ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg"
            }`}
          >
            All Submissions ({allApps.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`relative rounded-lg px-3 py-1.5 font-medium transition-all ${
              filter === "pending" ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg"
            }`}
          >
            Pending Intake
            {pendingApps.length > 0 && (
              <span className="ml-1.5 rounded-full bg-accent px-1.5 py-0.2 text-[10px] font-bold text-accent-fg">
                {pendingApps.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
              filter === "approved" ? "bg-surface text-fg shadow-sm" : "text-muted hover:text-fg"
            }`}
          >
            Approved ({approvedApps.length})
          </button>
          <button
            onClick={() => setFilter("copartners")}
            className={`rounded-lg px-3 py-1.5 font-medium transition-all ${
              filter === "copartners" ? "bg-surface text-accent shadow-sm" : "text-muted hover:text-fg"
            }`}
          >
            Co-Partner Agreements ({agreements.length})
          </button>
        </div>

        <span className="text-xs text-muted">
          {pendingApps.length} pending review · {agreements.length} active agreements
        </span>
      </div>

      {/* Applications List */}
      {filter !== "copartners" && (
        <div className="divide-y divide-border rounded-2xl border border-border bg-surface shadow-[var(--shadow-border)]">
          {displayedApps.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <Inbox className="mx-auto h-8 w-8 text-muted" />
              <p className="mt-2 font-display font-medium text-fg">No applications found</p>
              <p className="text-xs text-muted">No organizer submissions match this filter.</p>
            </div>
          ) : (
            displayedApps.map((a: any) => {
              const isCopartner = a.package_kind === "copartner" || a.package_slug?.includes("copartner");
              return (
                <div key={a.id} className="flex flex-wrap items-start justify-between gap-4 p-5">
                  <div className="max-w-xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-base font-semibold text-fg">{a.festival_name}</h3>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          isCopartner ? "bg-accent/15 text-accent" : "bg-surface-2 text-muted"
                        }`}
                      >
                        {isCopartner ? <Handshake className="h-3 w-3" /> : <Building2 className="h-3 w-3" />}
                        {a.package_name || "Self-Serve License"}
                      </span>
                      <StatusBadge status={a.status} />
                    </div>

                    <p className="mt-1 text-xs text-muted">
                      Organizer: <strong className="text-fg">{a.organization_name}</strong> · Location: {a.city}, {a.province}
                    </p>
                    <p className="text-xs text-muted">
                      Contact: {a.contact_name} ({a.contact_email}) · Submitted {stampLabel(a.created_at)}
                    </p>

                    {a.notes && (
                      <div className="mt-2.5 rounded-xl bg-surface-2 p-3 text-xs text-muted italic border border-border">
                        "{a.notes}"
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {a.festival_id && (
                      <Link
                        to="/admin/$festivalId"
                        params={{ festivalId: a.festival_id }}
                        className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted hover:border-accent hover:text-fg"
                      >
                        Command Center
                      </Link>
                    )}

                    {a.status === "pending" && (
                      <>
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
                      </>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Co-Partner Agreements Section */}
      {(filter === "all" || filter === "copartners") && (
        <div className="mt-10">
          <div className="mb-3">
            <h2 className="font-display text-2xl tracking-tight">Option B Co-Partner Agreements</h2>
            <p className="text-sm text-muted">
              Revenue share agreements for digital festival operations. TukodPH operates digital sponsorship and gate software (25% Lite vs 40% Smart Pro).
            </p>
          </div>

          <div className="divide-y divide-border rounded-2xl border border-border bg-surface shadow-[var(--shadow-border)]">
            {agreements.length === 0 ? (
              <p className="px-5 py-6 text-sm text-muted">No co-partner agreements on record.</p>
            ) : (
              agreements.map((a: any) => (
                <div key={a.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4">
                  <div className="max-w-xl">
                    <div className="flex items-center gap-2">
                      <p className="font-display font-semibold text-fg">{a.festival_name}</p>
                      <span className="rounded-full bg-accent/15 px-2 py-0.5 text-xs font-bold text-accent">
                        {a.commission_pct}% Digital RevShare
                      </span>
                      <StatusBadge status={a.status} />
                    </div>
                    <p className="mt-1 text-xs text-muted">{a.notes}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {a.status === "requested" && (
                      <Button
                        size="sm"
                        disabled={setCp.isPending}
                        onClick={() => setCp.mutate({ id: a.id, status: "active" })}
                      >
                        Activate Agreement
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Page>
  );
}
