import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Page, PageHeader } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input, Label } from "@/components/ui/input";
import { compact } from "@/lib/format";
import { createVenue, getVenues } from "@/lib/server/admin";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/$festivalId/venues")({ component: VenuesPage });

function VenuesPage() {
  const { festivalId } = Route.useParams();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["venues", festivalId],
    queryFn: () => getVenues({ data: festivalId }),
  });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", capacity: 1000, kind: "outdoor" });
  const mut = useMutation({
    mutationFn: () => createVenue({ data: { festivalId, ...form } }),
    onSuccess: () => {
      toast.success("Venue added");
      setOpen(false);
      void qc.invalidateQueries({ queryKey: ["venues", festivalId] });
    },
  });
  return (
    <Page>
      <PageHeader
        eyebrow="Places"
        title="Venues"
        description="Physical grounds and the digital stage share the same venue model."
        actions={<Button onClick={() => setOpen(true)}>Add venue</Button>}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        {(data ?? []).map((v) => (
          <div key={v.id} className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
            <p className="text-xs tracking-wide text-muted uppercase">{v.kind}</p>
            <h3 className="mt-1 font-display text-2xl">{v.name}</h3>
            <p className="mt-1 text-sm text-muted">{v.address}</p>
            <p className="mt-3 text-sm tabular-nums">Capacity {compact(v.capacity)}</p>
          </div>
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>Add venue</DialogTitle>
          <form
            className="mt-4 grid gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              mut.mutate();
            }}
          >
            <div className="grid gap-1">
              <Label>Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="grid gap-1">
              <Label>Address</Label>
              <Input
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </div>
            <div className="grid gap-1">
              <Label>Capacity</Label>
              <Input
                type="number"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
              />
            </div>
            <Button type="submit">Save venue</Button>
          </form>
        </DialogContent>
      </Dialog>
    </Page>
  );
}
