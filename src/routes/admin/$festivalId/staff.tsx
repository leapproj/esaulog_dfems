import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Page, PageHeader } from "@/components/shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { addStaff, getAdminEvents, getStaff } from "@/lib/server/admin";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/$festivalId/staff")({ component: StaffPage });

function StaffPage() {
  const { festivalId } = Route.useParams();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["staff", festivalId],
    queryFn: () => getStaff({ data: festivalId }),
  });
  const events = useQuery({
    queryKey: ["admin-events", festivalId],
    queryFn: () => getAdminEvents({ data: festivalId }),
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    full_name: "",
    role: "volunteer",
    phone: "",
    email: "",
    status: "active",
    assigned_event_id: "",
    notes: "",
  });
  const mut = useMutation({
    mutationFn: () =>
      addStaff({
        data: { festivalId, ...form, assigned_event_id: form.assigned_event_id || null },
      }),
    onSuccess: () => {
      toast.success("Staff added");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["staff", festivalId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Page>
      <PageHeader
        eyebrow="People operations"
        title="Volunteers & staff"
        description="Ushers, usherettes, volunteers, and coordinators assigned to events."
        actions={<Button onClick={() => setOpen(true)}>Add staff</Button>}
      />
      <div className="overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs tracking-wide text-muted uppercase">
            <tr className="border-b border-border">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Assignment</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((s) => (
              <tr key={s.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{s.full_name}</p>
                  <p className="text-xs text-muted">{s.phone || s.email}</p>
                </td>
                <td className="px-4 py-3 capitalize">{s.role}</td>
                <td className="px-4 py-3 text-muted">{s.event_name ?? "Unassigned"}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={s.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Add staff</DialogTitle>
          <DialogDescription>Volunteers and gate crew for this tenant only.</DialogDescription>
          <form
            className="mt-4 grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              mut.mutate();
            }}
          >
            <div className="grid gap-1">
              <Label>Full name</Label>
              <Input
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div className="grid gap-1">
              <Label>Role</Label>
              <select
                className="h-11 rounded-md border border-border bg-surface-2 px-3 text-sm"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                {["volunteer", "usher", "usherette", "coordinator", "supervisor", "medic"].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <Label>Assigned event</Label>
              <select
                className="h-11 rounded-md border border-border bg-surface-2 px-3 text-sm"
                value={form.assigned_event_id}
                onChange={(e) => setForm({ ...form, assigned_event_id: e.target.value })}
              >
                <option value="">Unassigned</option>
                {(events.data?.events ?? []).map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <Button type="submit" disabled={mut.isPending}>
              Save
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Page>
  );
}
