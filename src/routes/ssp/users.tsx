import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Shield } from "lucide-react";
import { useState } from "react";
import { HQ_SCOPE, hqDesk, hqTitle } from "@/components/hq-chrome";
import { Page, PageHeader } from "@/components/shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { stampLabel } from "@/lib/format";
import { getSspOverview, issueTenantOperator, rotateSspPasskey } from "@/lib/server/ssp";
import { toast } from "sonner";

export const Route = createFileRoute("/ssp/users")({ component: OperatorsPage });

function OperatorsPage() {
  const { data, isLoading } = useQuery({ queryKey: ["ssp"], queryFn: () => getSspOverview() });
  const hq = (data?.operators ?? []).filter((o: { kind: string }) => o.kind === "ssp");
  const tenants = (data?.operators ?? []).filter((o: { kind: string }) => o.kind === "tenant");
  const [target, setTarget] = useState<{ id: string; username: string; display_name: string } | null>(
    null,
  );
  const [issueOpen, setIssueOpen] = useState(false);

  return (
    <Page>
      <PageHeader
        eyebrow="Super Admin portal"
        title="Access keys"
        description="Three assigned TukodPH operators hold Headquarters. The access key is User ID plus passkey. Passkeys are issued offline and never displayed here or on the login door."
        actions={
          <Button variant="outline" onClick={() => setIssueOpen(true)}>
            Issue tenant key
          </Button>
        }
      />

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="text-xs tracking-wide text-muted uppercase">How HQ signs in</p>
          <p className="mt-2 text-sm text-muted">
            Open the Super Admin door, enter your User ID and passkey. Tenant organizers cannot
            enter this portal. Rotate a passkey if an operator leaves or a key is compromised — the
            new value is typed in, never shown back.
          </p>
        </div>
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="text-xs tracking-wide text-muted uppercase">What the key unlocks</p>
          <p className="mt-2 text-sm text-muted">
            Full SSP: create co-partner festivals, manage every tenant and event, read intelligence,
            operate the network, and open any command center.
          </p>
        </div>
      </div>

      <h2 className="mt-10 font-display text-2xl tracking-tight">Assigned Super Admins</h2>
      <p className="mt-1 text-sm text-muted">
        Van, Lanz, and Marc · TukodPH Headquarters. User ID is the public identifier. Passkey stays
        offline.
      </p>
      {isLoading ? (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {hq.map((o: any) => (
            <div key={o.id} className="flex flex-col rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium">{o.display_name}</p>
                  <p className="text-sm text-muted">{hqTitle(o.username)}</p>
                </div>
                <Badge tone="live" className="inline-flex items-center gap-1">
                  <Shield className="size-3" />
                  HQ
                </Badge>
              </div>
              <p className="mt-4 font-mono text-sm text-accent">{o.username}</p>
              <p className="mt-2 text-sm text-muted">{hqDesk(o.username)}</p>
              <p className="mt-3 text-xs text-subtle">{o.contact_email}</p>
              <p className="text-xs text-subtle">Last seen {stampLabel(o.last_seen_at)}</p>
              <div className="mt-4">
                <Button size="sm" variant="outline" onClick={() => setTarget(o)}>
                  Rotate passkey
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <h2 className="mt-10 font-display text-2xl tracking-tight">Scope of a Super Admin key</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {HQ_SCOPE.map((item) => (
          <div key={item.title} className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
            <div className="flex size-8 items-center justify-center rounded-md bg-surface-2 text-accent">
              <KeyRound className="size-4" />
            </div>
            <p className="mt-3 font-medium">{item.title}</p>
            <p className="mt-1 text-sm text-muted">{item.body}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-2xl tracking-tight">Tenant operators</h2>
      <p className="mt-1 text-sm text-muted">
        Festival desks only. They cannot open Headquarters. HQ can issue a new tenant key and attach
        it to a festival.
      </p>
      <div className="mt-4 divide-y divide-border rounded-xl bg-surface shadow-[var(--shadow-border)]">
        {tenants.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted">No tenant operators yet.</p>
        ) : (
          tenants.map((o: any) => (
            <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-medium">{o.display_name}</p>
                <p className="text-sm text-muted">
                  {o.organization_name} · <span className="font-mono">{o.username}</span>
                </p>
              </div>
              <span className="text-xs tracking-wide text-muted uppercase">Tenant</span>
            </div>
          ))
        )}
      </div>

      <div className="mt-8">
        <Link to="/ssp/organizations" className="text-sm text-muted hover:text-fg">
          Organizations directory
        </Link>
      </div>

      <h2 className="mt-10 font-display text-2xl tracking-tight">Audit log</h2>
      <div className="mt-3 divide-y divide-border rounded-xl bg-surface shadow-[var(--shadow-border)]">
        {(data?.auditLogs ?? []).length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted">No operator actions recorded yet.</p>
        ) : (
          (data?.auditLogs ?? []).map((a: any) => (
            <div key={a.id} className="flex justify-between gap-3 px-5 py-3 text-sm">
              <span>
                {a.action} · {a.entity}
              </span>
              <span className="text-muted tabular-nums">{a.created_at}</span>
            </div>
          ))
        )}
      </div>

      <RotateDialog target={target} onClose={() => setTarget(null)} />
      <IssueTenantDialog
        open={issueOpen}
        onOpenChange={setIssueOpen}
        festivals={data?.festivals ?? []}
      />
    </Page>
  );
}

function RotateDialog({
  target,
  onClose,
}: {
  target: { id: string; username: string; display_name: string } | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const [pass, setPass] = useState("");
  const [confirm, setConfirm] = useState("");
  const mut = useMutation({
    mutationFn: () =>
      rotateSspPasskey({
        data: { operatorId: target!.id, newPasskey: pass, confirm },
      }),
    onSuccess: (res) => {
      toast.success(`Passkey rotated for ${res.username}`);
      setPass("");
      setConfirm("");
      onClose();
      void qc.invalidateQueries({ queryKey: ["ssp"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open={Boolean(target)} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogTitle>Rotate Super Admin passkey</DialogTitle>
        <DialogDescription>
          {target
            ? `Issue a new passkey for ${target.display_name} (${target.username}). The current key is never shown.`
            : ""}
        </DialogDescription>
        <form
          className="mt-4 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            mut.mutate();
          }}
        >
          <div className="grid gap-1">
            <Label htmlFor="new-key">New passkey</Label>
            <Input
              id="new-key"
              type="password"
              autoComplete="new-password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="confirm-key">Confirm passkey</Label>
            <Input
              id="confirm-key"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" disabled={mut.isPending}>
            {mut.isPending ? "Saving…" : "Rotate passkey"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function IssueTenantDialog({
  open,
  onOpenChange,
  festivals,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  festivals: Array<{ id: string; name: string }>;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    username: "",
    passkey: "",
    display_name: "",
    organization_name: "",
    contact_email: "",
    festivalId: "",
  });
  const mut = useMutation({
    mutationFn: () => issueTenantOperator({ data: form }),
    onSuccess: (res) => {
      toast.success(`Tenant key issued for ${res.username}`);
      setForm({
        username: "",
        passkey: "",
        display_name: "",
        organization_name: "",
        contact_email: "",
        festivalId: "",
      });
      onOpenChange(false);
      void qc.invalidateQueries({ queryKey: ["ssp"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogTitle>Issue tenant operator key</DialogTitle>
        <DialogDescription>
          Creates a festival-desk account. They cannot enter Headquarters. The passkey is typed once
          and never shown again.
        </DialogDescription>
        <form
          className="mt-4 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            mut.mutate();
          }}
        >
          <div className="grid gap-1">
            <Label htmlFor="iss-id">User ID</Label>
            <Input
              id="iss-id"
              value={form.username}
              onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))}
              required
              minLength={3}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="iss-key">Passkey</Label>
            <Input
              id="iss-key"
              type="password"
              autoComplete="new-password"
              value={form.passkey}
              onChange={(e) => setForm((f) => ({ ...f, passkey: e.target.value }))}
              required
              minLength={6}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="iss-name">Display name</Label>
            <Input
              id="iss-name"
              value={form.display_name}
              onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="iss-org">Organization</Label>
            <Input
              id="iss-org"
              value={form.organization_name}
              onChange={(e) => setForm((f) => ({ ...f, organization_name: e.target.value }))}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="iss-email">Contact email</Label>
            <Input
              id="iss-email"
              type="email"
              value={form.contact_email}
              onChange={(e) => setForm((f) => ({ ...f, contact_email: e.target.value }))}
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="iss-fest">Attach to tenant</Label>
            <Select
              id="iss-fest"
              value={form.festivalId}
              onChange={(e) => setForm((f) => ({ ...f, festivalId: e.target.value }))}
            >
              <option value="">None yet</option>
              {festivals.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </Select>
          </div>
          <Button type="submit" disabled={mut.isPending}>
            {mut.isPending ? "Issuing…" : "Issue key"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
