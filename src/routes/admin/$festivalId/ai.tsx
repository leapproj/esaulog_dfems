import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Page, PageHeader } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getAiInbox, runAiReview, setRecommendationStatus } from "@/lib/server/ai";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/$festivalId/ai")({ component: AiPage });

function AiPage() {
  const { festivalId } = Route.useParams();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["ai", festivalId],
    queryFn: () => getAiInbox({ data: festivalId }),
  });
  const run = useMutation({
    mutationFn: () => runAiReview({ data: festivalId }),
    onSuccess: (res) => {
      if (!res.ok) toast.error(res.error);
      else toast.success(`${res.inserted} recommendations written`);
      void qc.invalidateQueries({ queryKey: ["ai", festivalId] });
    },
  });
  const set = useMutation({
    mutationFn: (input: { id: string; status: string }) =>
      setRecommendationStatus({ data: { festivalId, ...input } }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["ai", festivalId] }),
  });
  return (
    <Page>
      <PageHeader
        eyebrow="AI Festival Organizer"
        title="Operational intelligence"
        description="Not a chatbot. An operations agent that reads events, staff, venues, and KPIs — then proposes work."
        actions={
          <Button onClick={() => run.mutate()} disabled={run.isPending}>
            {run.isPending ? "Reviewing…" : "Run operational review"}
          </Button>
        }
      />
      <div className="grid gap-3 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-3">
          {(data?.recs ?? []).map((r) => (
            <article key={r.id} className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs tracking-wide text-muted uppercase">
                  {r.kind} · {r.severity}
                </p>
                <span className="text-xs text-subtle">{r.status}</span>
              </div>
              <h3 className="mt-2 font-display text-xl tracking-tight">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{r.body}</p>
              {r.status === "open" ? (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" onClick={() => set.mutate({ id: r.id, status: "approved" })}>
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => set.mutate({ id: r.id, status: "dismissed" })}
                  >
                    Dismiss
                  </Button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
        <div className="rounded-xl bg-surface p-5 shadow-[var(--shadow-border)]">
          <p className="text-xs tracking-wide text-muted uppercase">Event readiness</p>
          <ul className="mt-4 space-y-4">
            {(data?.readiness ?? []).map((e) => (
              <li key={e.id}>
                <div className="mb-1 flex justify-between text-sm">
                  <span>{e.name}</span>
                  <span className="tabular-nums text-muted">{e.score}%</span>
                </div>
                <Progress value={e.score} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Page>
  );
}
