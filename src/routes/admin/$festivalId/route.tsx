import { createFileRoute, Outlet } from "@tanstack/react-router";
import { HqOperatorStrip } from "@/components/hq-chrome";
import { OperatorGate, useOperatorProfile } from "@/components/operator-gate";
import { TopBar } from "@/components/shell";

export const Route = createFileRoute("/admin/$festivalId")({ component: AdminLayout });

function AdminLayout() {
  const { festivalId } = Route.useParams();
  const p = { festivalId };
  return (
    <OperatorGate>
      <AdminChrome festivalId={festivalId} params={p} />
    </OperatorGate>
  );
}

function AdminChrome({
  festivalId,
  params: p,
}: {
  festivalId: string;
  params: { festivalId: string };
}) {
  const profile = useOperatorProfile();
  const hq = profile?.kind === "ssp";
  const items = [
    { to: "/hub", label: "Desk" },
    ...(hq ? [{ to: "/ssp", label: "Back to HQ" }] : []),
    { to: "/admin/$festivalId", params: p, label: "Command" },
    { to: "/admin/$festivalId/planning", params: p, label: "Plan" },
    { to: "/admin/$festivalId/events", params: p, label: "Events" },
    { to: "/admin/$festivalId/cms", params: p, label: "CMS" },
    { to: "/admin/$festivalId/participants", params: p, label: "People" },
    { to: "/admin/$festivalId/staff", params: p, label: "Staff" },
    { to: "/admin/$festivalId/venues", params: p, label: "Venues" },
    { to: "/admin/$festivalId/gates", params: p, label: "Gates" },
    { to: "/admin/$festivalId/publish", params: p, label: "Publish" },
    { to: "/admin/$festivalId/analytics", params: p, label: "Analytics" },
    { to: "/admin/$festivalId/ai", params: p, label: "AI" },
  ];
  void festivalId;
  return (
    <div className="min-h-screen">
      <TopBar
        kicker={hq ? "HQ · Command center" : "Command center"}
        items={items}
        trailing={hq ? <HqOperatorStrip /> : undefined}
      />
      <Outlet />
    </div>
  );
}
