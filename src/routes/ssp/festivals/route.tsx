import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/ssp/festivals")({ component: FestivalsLayout });

function FestivalsLayout() {
  return <Outlet />;
}
