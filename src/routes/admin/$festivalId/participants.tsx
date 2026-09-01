import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Page, PageHeader } from "@/components/shell";
import { StatusBadge } from "@/components/status-badge";
import { getParticipants } from "@/lib/server/admin";

export const Route = createFileRoute("/admin/$festivalId/participants")({
  component: PeoplePage,
});

function PeoplePage() {
  const { festivalId } = Route.useParams();
  const { data } = useQuery({
    queryKey: ["people", festivalId],
    queryFn: () => getParticipants({ data: festivalId }),
  });
  return (
    <Page>
      <PageHeader
        eyebrow="People"
        title="Participants"
        description="Every identity resolves to one ePASS — digital or printed."
      />
      <div className="overflow-x-auto rounded-xl bg-surface shadow-[var(--shadow-border)]">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="text-xs tracking-wide text-muted uppercase">
            <tr className="border-b border-border">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">City</th>
              <th className="px-4 py-3 font-medium">ePASS</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((p) => (
              <tr key={p.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{p.full_name}</p>
                  <p className="text-xs text-muted">{p.age_bracket}</p>
                </td>
                <td className="px-4 py-3 text-muted">{p.city}</td>
                <td className="px-4 py-3 font-mono text-xs tabular-nums">
                  {p.credential_id ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Page>
  );
}
