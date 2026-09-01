import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Page, PageHeader } from "@/components/shell";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input, Label, Select } from "@/components/ui/input";
import { rangeLabel } from "@/lib/format";
import { hqCreateEvent, listNetworkEvents, setNetworkEventStatus } from "@/lib/server/ssp";
import { toast } from "sonner";

export const Route = createFileRoute("/ssp/events")({ component: NetworkEvents });

function NetworkEvents() {
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["ssp-events"], queryFn: () => listNetworkEvents() });
  const [filter, setFilter] = useState<"all" | "copartner" | "live">("all");
  const [open, setOpen] = useState(false);

  const events = useMemo(() => {
    const rows = data?.events ?? [];
    if (filter === "copartner") return rows.filter((e: { copartner: boolean }) => e.copartner);
    if (filter === "live") return rows.filter((e: { festival_status: string }) => e.festival_status === "LIVE");
    return rows;
  }, [data, filter]);

  const statusMut = useMutation({
    mutationFn: (input: { id: string; status: string }) => setNetworkEventStatus({ data: input }),
    onSuccess: () => {
      toast.success("Event status updated");
      void qc.invalidateQueries({ queryKey: ["ssp-events"] });
      void qc.invalidateQueries({ queryKey: ["ssp"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Page>
      <PageHeader
        eyebrow="Network program"
        title="Events across tenants"
        description="Headquarters creates, publishes, and opens every event. Jump into a command center when you need the full wizard."
        actions={<Button onClick={() => setOpen(true)}>Create event</Button>}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {(
          [
            ["all", "All"],
            ["live", "Live tenants"],
            ["copartner", "Co-partner"],
          ] as const
        ).map(([key, label]) => (
          <Button
            key={key}
            size="sm"
            variant={filter === key ? "default" : "outline"}
            onClick={() => setFilter(key)}
          >
            {label}
          </Button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="text-xs tracking-wide text-muted uppercase">
            <tr className="border-b border-border">
              <th className="px-4 py-3 font-medium">Event</th>
              <th className="px-4 py-3 font-medium">Tenant</th>
              <th className="px-4 py-3 font-medium">When</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Pax</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">HQ</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e: any) => (
              <tr key={e.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <Link
                    to="/admin/$festivalId/events/$eventId"
                    params={{ festivalId: e.festival_id, eventId: e.id }}
                    className="font-medium hover:underline"
                  >
                    {e.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link
                    to="/ssp/festivals/$festivalId"
                    params={{ festivalId: e.festival_id }}
                    className="text-muted hover:text-fg"
                  >
                    {e.festival_name}
                  </Link>
                  {e.copartner ? <span className="ml-2 text-xs text-accent">30%</span> : null}
                </td>
                <td className="px-4 py-3 text-muted">{rangeLabel(e.starts_at, e.ends_at)}</td>
                <td className="px-4 py-3 capitalize">{e.event_type}</td>
                <td className="px-4 py-3 tabular-nums">
                  {e.checkin_count}/{e.registered_count}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={e.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {(["draft", "published", "live"] as const).map((st) => (
                      <Button
                        key={st}
                        size="sm"
                        variant={e.status === st ? "default" : "outline"}
                        disabled={statusMut.isPending}
                        onClick={() => statusMut.mutate({ id: e.id, status: st })}
                      >
                        {st}
                      </Button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateEventDialog
        open={open}
        onOpenChange={setOpen}
        festivals={data?.festivals ?? []}
      />
    </Page>
  );
}

function CreateEventDialog({
  open,
  onOpenChange,
  festivals,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  festivals: Array<{ id: string; name: string; city: string; status: string }>;
}) {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    festivalId: festivals[0]?.id ?? "",
    name: "",
    description: "",
    event_type: "physical",
    starts_at: "2026-11-01T16:00",
    ends_at: "2026-11-01T19:00",
    capacity: "1000",
    published: true,
  });
  const mut = useMutation({
    mutationFn: () =>
      hqCreateEvent({
        data: {
          ...form,
          festivalId: form.festivalId || festivals[0]?.id,
          capacity: Number(form.capacity) || 1000,
        },
      }),
    onSuccess: () => {
      toast.success("Event created from Headquarters");
      onOpenChange(false);
      setForm((f) => ({ ...f, name: "", description: "" }));
      void qc.invalidateQueries({ queryKey: ["ssp-events"] });
      void qc.invalidateQueries({ queryKey: ["ssp"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogTitle>Create event as HQ</DialogTitle>
        <DialogDescription>
          Super Admin can add program to any tenant. TukodPH is recorded as organizer when you
          create as co-partner.
        </DialogDescription>
        <form
          className="mt-4 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            mut.mutate();
          }}
        >
          <div className="grid gap-1">
            <Label htmlFor="hq-evt-fest">Tenant</Label>
            <Select
              id="hq-evt-fest"
              value={form.festivalId || festivals[0]?.id || ""}
              onChange={(e) => setForm((f) => ({ ...f, festivalId: e.target.value }))}
              required
            >
              {festivals.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} · {f.city}
                </option>
              ))}
            </Select>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="hq-evt-name">Event name</Label>
            <Input
              id="hq-evt-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </div>
          <div className="grid gap-1">
            <Label htmlFor="hq-evt-type">Type</Label>
            <Select
              id="hq-evt-type"
              value={form.event_type}
              onChange={(e) => setForm((f) => ({ ...f, event_type: e.target.value }))}
            >
              <option value="physical">Physical</option>
              <option value="digital">Digital</option>
              <option value="hybrid">Hybrid</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1">
              <Label htmlFor="hq-evt-start">Starts</Label>
              <Input
                id="hq-evt-start"
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm((f) => ({ ...f, starts_at: e.target.value }))}
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="hq-evt-end">Ends</Label>
              <Input
                id="hq-evt-end"
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => setForm((f) => ({ ...f, ends_at: e.target.value }))}
              />
            </div>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="hq-evt-cap">Capacity</Label>
            <Input
              id="hq-evt-cap"
              type="number"
              min={1}
              value={form.capacity}
              onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
            />
          </div>
          <label className="flex items-start gap-3 rounded-lg bg-surface-2 p-3 text-sm">
            <input
              type="checkbox"
              className="mt-1 size-4 accent-accent"
              checked={form.published}
              onChange={(e) => setForm((f) => ({ ...f, published: e.target.checked }))}
            />
            <span>
              <span className="font-medium">Publish immediately</span>
              <span className="mt-0.5 block text-muted">
                Leave on to put the event on the tenant calendar. Off keeps it as a draft.
              </span>
            </span>
          </label>
          <Button type="submit" disabled={mut.isPending || !form.festivalId}>
            {mut.isPending ? "Creating…" : "Create event"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
