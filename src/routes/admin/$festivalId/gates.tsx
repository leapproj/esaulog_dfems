import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Page, PageHeader } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { createGateKey, getAdminEvents, getGateCheckins, getGateKeys } from "@/lib/server/admin";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/$festivalId/gates")({ component: GatesPage });

function GatesPage() {
  const { festivalId } = Route.useParams();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["gates", festivalId],
    queryFn: () => getGateKeys({ data: festivalId }),
  });
  const events = useQuery({
    queryKey: ["admin-events", festivalId],
    queryFn: () => getAdminEvents({ data: festivalId }),
  });
  const checkins = useQuery({
    queryKey: ["gate-checkins", festivalId],
    queryFn: () => getGateCheckins({ data: festivalId }),
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ eventId: "", code: "", staff_role: "usher", max_devices: 8 });
  const mut = useMutation({
    mutationFn: () => createGateKey({ data: { festivalId, ...form } }),
    onSuccess: (res) => {
      toast.success(`Key ${res.code} issued`);
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["gates", festivalId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Page>
      <PageHeader
        eyebrow="Physical authentication"
        title="Gate management"
        description="Staff only receive access to the events they are authorized to operate."
        actions={<Button onClick={() => setOpen(true)}>Create access key</Button>}
      />
      <div className="divide-y divide-border rounded-xl bg-surface shadow-[var(--shadow-border)]">
        {(data ?? []).map((k) => (
          <div key={k.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <p className="font-mono text-sm">{k.code}</p>
              <p className="text-sm text-muted">
                {k.event_name} · {k.gate_name ?? "Gate"} · {k.staff_role}
              </p>
            </div>
            <span className="text-xs text-muted">{k.max_devices} devices</span>
          </div>
        ))}
      </div>

      <h2 className="mt-10 font-display text-2xl">Recent check-ins</h2>
      <div className="mt-3 divide-y divide-border rounded-xl bg-surface shadow-[var(--shadow-border)]">
        {(checkins.data ?? []).map((c) => (
          <div key={c.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 text-sm">
            <div>
              <p className="font-medium">{c.participant_name}</p>
              <p className="text-muted">{c.event_name} · {c.credential_id}</p>
            </div>
            <span className="text-xs uppercase text-muted">{c.result}</span>
          </div>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Create access key</DialogTitle>
          <DialogDescription>Event, role, and device cap. The code is what ushers type.</DialogDescription>
          <form
            className="mt-4 grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              mut.mutate();
            }}
          >
            <div className="grid gap-1">
              <Label>Event</Label>
              <select
                required
                className="h-11 rounded-md border border-border bg-surface-2 px-3 text-sm"
                value={form.eventId}
                onChange={(e) => setForm({ ...form, eventId: e.target.value })}
              >
                <option value="">Select</option>
                {(events.data?.events ?? []).map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <Label>Code</Label>
              <Input
                required
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="HIGALAAY-GATE-C"
              />
            </div>
            <div className="grid gap-1">
              <Label>Staff role</Label>
              <Input
                value={form.staff_role}
                onChange={(e) => setForm({ ...form, staff_role: e.target.value })}
              />
            </div>
            <Button type="submit">Issue key</Button>
          </form>
        </DialogContent>
      </Dialog>
    </Page>
  );
}
