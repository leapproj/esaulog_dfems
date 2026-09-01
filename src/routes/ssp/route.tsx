import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { HQ_NAV, HqOperatorStrip } from "@/components/hq-chrome";
import { SspGate } from "@/components/operator-gate";
import { TopBar } from "@/components/shell";

export const Route = createFileRoute("/ssp")({ component: SspLayout });

function SspLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/ssp/login") return <Outlet />;
  return (
    <SspGate>
      <div className="min-h-screen">
        <TopBar kicker="TukodPH Super Admin HQ" items={HQ_NAV} trailing={<HqOperatorStrip />} />
        <Outlet />
      </div>
    </SspGate>
  );
}
