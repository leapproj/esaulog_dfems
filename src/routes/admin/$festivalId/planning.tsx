import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Page, PageHeader } from "@/components/shell";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getPlanning, togglePlanning } from "@/lib/server/erp";

export const Route = createFileRoute("/admin/$festivalId/planning")({
  component: PlanningPage,
});

function PlanningPage() {
  const { festivalId } = Route.useParams();
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ["plan", festivalId],
    queryFn: () => getPlanning({ data: festivalId }),
  });
  const mut = useMutation({
    mutationFn: (input: { key: string; done: boolean }) =>
      togglePlanning({ data: { festivalId, ...input } }),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ["plan", festivalId] }),
  });
  const items = data?.items ?? [];
  const done = items.filter((i) => i.done).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;
  const links: Record<string, string> = {
    calendar: `/admin/${festivalId}/events`,
    cms: `/admin/${festivalId}/cms`,
    sponsors: `/sponsor`,
    gate_staff: `/admin/${festivalId}/gates`,
    participant_portal: `/p`,
  };
  return (
    <Page>
      <PageHeader
        eyebrow="Draft until complete"
        title="Festival planning"
        description="Save the draft until identity, calendar, sponsors, CMS website, participant portal, and gate staff are in place. Then publish."
      />
      <div className="mb-6 flex items-center gap-4">
        <Progress value={pct} className="max-w-sm flex-1" />
        <span className="tabular-nums text-sm text-muted">{pct}%</span>
      </div>
      <div className="divide-y divide-border rounded-xl bg-surface shadow-[var(--shadow-border)]">
        {items.map((i) => {
          const auto = (data?.derived as Record<string, boolean> | undefined)?.[String(i.key)];
          return (
            <div key={i.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
              <div>
                <p className="font-medium">{i.label}</p>
                {auto ? (
                  <p className="text-xs text-ok">Detected in the tenant</p>
                ) : (
                  <p className="text-xs text-subtle">Still open</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                {links[i.key] ? (
                  <a href={links[i.key]} className="text-sm text-muted hover:text-fg">
                    Open
                  </a>
                ) : null}
                <Button
                  size="sm"
                  variant={i.done ? "secondary" : "outline"}
                  onClick={() => mut.mutate({ key: i.key, done: !i.done })}
                >
                  {i.done ? "Done" : "Mark done"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </Page>
  );
}
