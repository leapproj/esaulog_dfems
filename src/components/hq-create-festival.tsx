import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import { Input, Label } from "./ui/input";
import { createFestivalTenant } from "@/lib/server/ssp";
import { toast } from "sonner";
import { Handshake, Zap, Building2, Check } from "lucide-react";

export function CreateCopartnerDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const nav = useNavigate();
  const qc = useQueryClient();
  const [modelType, setModelType] = useState<"lite" | "pro" | "saas">("lite");
  const [form, setForm] = useState({
    name: "",
    slug: "",
    city: "",
    province: "",
    starts_on: "2026-11-01",
    ends_on: "2026-11-07",
    organizer_name: "TukodPH Festival Ops",
    contact_email: "festivals@tukodph.com",
    tagline: "",
  });

  const isCopartner = modelType === "lite" || modelType === "pro";
  const commissionPct = modelType === "pro" ? 40 : modelType === "lite" ? 25 : 0;
  const packageId =
    modelType === "pro"
      ? "pkg_copartner_pro"
      : modelType === "lite"
        ? "pkg_copartner_lite"
        : "pkg_command";

  const mut = useMutation({
    mutationFn: () =>
      createFestivalTenant({
        data: {
          ...form,
          copartner: isCopartner,
          tier: modelType,
          commission_pct: commissionPct,
          package_id: packageId,
        },
      }),
    onSuccess: async (res) => {
      toast.success(
        res.copartner
          ? `Co-partner tenant created (${res.commissionPct || commissionPct}% RevShare)`
          : "Festival tenant created",
      );
      await qc.invalidateQueries({ queryKey: ["ssp"] });
      onOpenChange(false);
      void nav({ to: "/ssp/festivals/$festivalId", params: { festivalId: res.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
        <DialogTitle className="font-display text-2xl">Provision Festival Tenant</DialogTitle>
        <DialogDescription>
          TukodPH Super Admin HQ provisions the tenant with full CMS, event registry, ePASS gate credentials, and intelligence ledgers.
        </DialogDescription>

        <form
          className="mt-4 grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            mut.mutate();
          }}
        >
          {/* Tier Selection */}
          <div className="grid gap-2">
            <Label className="text-xs uppercase tracking-wider text-muted">
              Select Operating Model & Tier
            </Label>
            <div className="grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => setModelType("lite")}
                className={`flex flex-col items-start rounded-xl p-3 text-left transition-all border ${
                  modelType === "lite"
                    ? "border-accent bg-accent/10 ring-2 ring-accent/30"
                    : "border-border bg-surface hover:bg-surface-hover"
                }`}
              >
                <div className="flex items-center gap-1.5 text-accent">
                  <Handshake className="h-4 w-4" />
                  <span className="text-xs font-semibold">Lite (25%)</span>
                </div>
                <p className="mt-1 font-display text-sm font-semibold">Digital Partner</p>
                <p className="mt-1 text-[11px] text-muted leading-tight">
                  25% RevShare. Consulting, CMS, & gate terminals.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setModelType("pro")}
                className={`flex flex-col items-start rounded-xl p-3 text-left transition-all border ${
                  modelType === "pro"
                    ? "border-accent bg-accent/10 ring-2 ring-accent/30"
                    : "border-border bg-surface hover:bg-surface-hover"
                }`}
              >
                <div className="flex items-center gap-1.5 text-accent">
                  <Zap className="h-4 w-4" />
                  <span className="text-xs font-semibold">Pro (40%)</span>
                </div>
                <p className="mt-1 font-display text-sm font-semibold">Smart Co-Organizer</p>
                <p className="mt-1 text-[11px] text-muted leading-tight">
                  40% RevShare. Pre-event sponsors & on-ground ops.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setModelType("saas")}
                className={`flex flex-col items-start rounded-xl p-3 text-left transition-all border ${
                  modelType === "saas"
                    ? "border-accent bg-accent/10 ring-2 ring-accent/30"
                    : "border-border bg-surface hover:bg-surface-hover"
                }`}
              >
                <div className="flex items-center gap-1.5 text-fg">
                  <Building2 className="h-4 w-4" />
                  <span className="text-xs font-semibold">Option A</span>
                </div>
                <p className="mt-1 font-display text-sm font-semibold">Direct SaaS Tenant</p>
                <p className="mt-1 text-[11px] text-muted leading-tight">
                  0% RevShare. Fixed season license.
                </p>
              </button>
            </div>
          </div>

          {(
            [
              ["name", "Festival name", "e.g., Lanzones Festival 2026"],
              ["slug", "URL Slug", "e.g., lanzones2026"],
              ["city", "City / Municipality", "e.g., Mambajao"],
              ["province", "Province / Region", "e.g., Camiguin"],
              ["organizer_name", "Official Organizer / LGU", "e.g., Camiguin Provincial Tourism Council"],
              ["contact_email", "Contact Email", "e.g., tourism@camiguin.gov.ph"],
              ["tagline", "Tagline / Theme", "e.g., Celebrating the Sweetest Harvest"],
            ] as const
          ).map(([key, label, placeholder]) => (
            <div key={key} className="grid gap-1">
              <Label htmlFor={`hq-${key}`}>{label}</Label>
              <Input
                id={`hq-${key}`}
                required={key !== "tagline"}
                placeholder={placeholder}
                value={form[key] as string}
                onChange={(e) => {
                  const v = e.target.value;
                  setForm((f) => ({
                    ...f,
                    [key]: v,
                    ...(key === "name" && !f.slug
                      ? { slug: v.toLowerCase().replace(/[^a-z0-9]+/g, "-") }
                      : {}),
                  }));
                }}
              />
            </div>
          ))}

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label htmlFor="hq-starts">Starts On</Label>
              <Input
                id="hq-starts"
                type="date"
                value={form.starts_on}
                onChange={(e) => setForm((f) => ({ ...f, starts_on: e.target.value }))}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="hq-ends">Ends On</Label>
              <Input
                id="hq-ends"
                type="date"
                value={form.ends_on}
                onChange={(e) => setForm((f) => ({ ...f, ends_on: e.target.value }))}
              />
            </div>
          </div>

          {isCopartner && (
            <div className="rounded-xl border border-accent/30 bg-surface p-3.5 text-xs text-muted">
              <p className="font-semibold text-accent flex items-center gap-1.5">
                <Check className="h-4 w-4" /> TukodPH Deliverables under {modelType === "pro" ? "Smart Festival Pro (40%)" : "Digital Festival Lite (25%)"}:
              </p>
              <p className="mt-1 leading-relaxed">
                {modelType === "pro"
                  ? "Full digital festival co-organization, pre-event sponsors outsourcing, on-ground TukodPH team deployment, QR gate devices, and post-event data evaluation report."
                  : "Digital festival consulting, CMS & public site setup, QR scan devices & terminals, and end-to-end technical support."}
              </p>
            </div>
          )}

          <Button type="submit" disabled={mut.isPending} className="mt-2">
            {mut.isPending
              ? "Provisioning Tenant…"
              : `Generate ${isCopartner ? `Co-Partner Tenant (${commissionPct}%)` : "SaaS Tenant"}`}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
