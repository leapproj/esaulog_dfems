import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Page, PageHeader } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/input";
import { createEvent, getAdminEvents, type EventDraft } from "@/lib/server/admin";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/$festivalId/events/new")({
  component: EventWizard,
});

const STEPS = [
  "Basic information",
  "Schedule",
  "Venue",
  "Registration",
  "Access",
  "Engagement",
  "Sponsor",
  "Publish",
];

function EventWizard() {
  const { festivalId } = Route.useParams();
  const nav = useNavigate();
  const { data } = useQuery({
    queryKey: ["admin-events", festivalId],
    queryFn: () => getAdminEvents({ data: festivalId }),
  });
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<EventDraft>({
    festivalId,
    name: "",
    description: "",
    organizer: "",
    category_id: null,
    event_type: "physical",
    starts_at: "2026-08-23T14:00",
    ends_at: "2026-08-23T17:00",
    venue_id: null,
    capacity: 500,
    registration_mode: "open",
    access_mode: "epass",
    engagement_notes: "",
    sponsor_id: null,
    emergency_contact: "",
    published: true,
  });
  const mut = useMutation({
    mutationFn: () =>
      createEvent({
        data: {
          ...form,
          starts_at: new Date(form.starts_at).toISOString(),
          ends_at: new Date(form.ends_at).toISOString(),
        },
      }),
    onSuccess: (res) => {
      toast.success("Event published to the tenant");
      void nav({
        to: "/admin/$festivalId/events/$eventId",
        params: { festivalId, eventId: res.id },
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <Page className="max-w-2xl">
      <PageHeader
        eyebrow={`Step ${String(step + 1).padStart(2, "0")} of 08`}
        title="Create event"
        description={STEPS[step]}
      />
      <ol className="mb-6 flex flex-wrap gap-1">
        {STEPS.map((s, i) => (
          <li
            key={s}
            className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-accent" : "bg-fg/10"}`}
          />
        ))}
      </ol>
      <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
        {step === 0 && (
          <div className="grid gap-3">
            <Field label="Name">
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="Description">
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>
            <Field label="Organizer">
              <Input
                value={form.organizer}
                onChange={(e) => setForm({ ...form, organizer: e.target.value })}
              />
            </Field>
            <Field label="Category">
              <select
                className="h-11 rounded-md border border-border bg-surface-2 px-3 text-sm"
                value={form.category_id ?? ""}
                onChange={(e) => setForm({ ...form, category_id: e.target.value || null })}
              >
                <option value="">Uncategorized</option>
                {(data?.categories ?? []).map((c: { id: string; name: string }) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Event type">
              <div className="flex gap-2">
                {(["physical", "digital", "hybrid"] as const).map((t) => (
                  <Button
                    key={t}
                    type="button"
                    size="sm"
                    variant={form.event_type === t ? "default" : "outline"}
                    onClick={() => setForm({ ...form, event_type: t })}
                  >
                    {t}
                  </Button>
                ))}
              </div>
            </Field>
          </div>
        )}
        {step === 1 && (
          <div className="grid gap-3">
            <Field label="Starts">
              <Input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
              />
            </Field>
            <Field label="Ends">
              <Input
                type="datetime-local"
                value={form.ends_at}
                onChange={(e) => setForm({ ...form, ends_at: e.target.value })}
              />
            </Field>
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-3">
            <Field label="Venue">
              <select
                className="h-11 rounded-md border border-border bg-surface-2 px-3 text-sm"
                value={form.venue_id ?? ""}
                onChange={(e) => setForm({ ...form, venue_id: e.target.value || null })}
              >
                <option value="">Assign later</option>
                {(data?.venues ?? []).map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Capacity">
              <Input
                type="number"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
              />
            </Field>
          </div>
        )}
        {step === 3 && (
          <Field label="Registration mode">
            <div className="flex flex-wrap gap-2">
              {["open", "invite", "ticketed"].map((m) => (
                <Button
                  key={m}
                  type="button"
                  size="sm"
                  variant={form.registration_mode === m ? "default" : "outline"}
                  onClick={() => setForm({ ...form, registration_mode: m })}
                >
                  {m}
                </Button>
              ))}
            </div>
          </Field>
        )}
        {step === 4 && (
          <div className="grid gap-3">
            <Field label="Access mode">
              <div className="flex flex-wrap gap-2">
                {["epass", "open", "staff"].map((m) => (
                  <Button
                    key={m}
                    type="button"
                    size="sm"
                    variant={form.access_mode === m ? "default" : "outline"}
                    onClick={() => setForm({ ...form, access_mode: m })}
                  >
                    {m}
                  </Button>
                ))}
              </div>
            </Field>
            <Field label="Emergency contact">
              <Input
                value={form.emergency_contact}
                onChange={(e) => setForm({ ...form, emergency_contact: e.target.value })}
              />
            </Field>
          </div>
        )}
        {step === 5 && (
          <Field label="Engagement notes">
            <Textarea
              value={form.engagement_notes}
              onChange={(e) => setForm({ ...form, engagement_notes: e.target.value })}
              placeholder="Votes, missions, surveys attached to this event"
            />
          </Field>
        )}
        {step === 6 && (
          <Field label="Sponsor">
            <select
              className="h-11 rounded-md border border-border bg-surface-2 px-3 text-sm"
              value={form.sponsor_id ?? ""}
              onChange={(e) => setForm({ ...form, sponsor_id: e.target.value || null })}
            >
              <option value="">None</option>
              {(data?.sponsors ?? []).map((s: { id: string; name: string }) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
        )}
        {step === 7 && (
          <div className="space-y-3 text-sm">
            <p>
              <span className="text-muted">Name · </span>
              {form.name || "Untitled"}
            </p>
            <p>
              <span className="text-muted">Type · </span>
              {form.event_type} · {form.access_mode} · {form.registration_mode}
            </p>
            <p className="text-muted">Publishing writes the event into the tenant calendar and ePASS engine.</p>
          </div>
        )}
        <div className="mt-6 flex justify-between">
          <Button
            type="button"
            variant="ghost"
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </Button>
          {step < 7 ? (
            <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={step === 0 && !form.name}>
              Continue
            </Button>
          ) : (
            <Button type="button" onClick={() => mut.mutate()} disabled={mut.isPending}>
              {mut.isPending ? "Publishing…" : "Publish event"}
            </Button>
          )}
        </div>
      </div>
    </Page>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
