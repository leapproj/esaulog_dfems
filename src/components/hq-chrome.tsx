import { Link } from "@tanstack/react-router";
import { useOperatorProfile } from "./operator-gate";
import { Badge } from "./ui/badge";

export const HQ_NAV = [
  { to: "/ssp", label: "Dashboard" },
  { to: "/ssp/festivals", label: "Tenants" },
  { to: "/ssp/events", label: "Events" },
  { to: "/ssp/applications", label: "Intake" },
  { to: "/ssp/analytics", label: "Intelligence" },
  { to: "/ssp/network", label: "Network" },
  { to: "/ssp/users", label: "Access Keys" },
  { to: "/hub", label: "Desk" },
];

export const HQ_TITLES: Record<string, string> = {
  vanz: "Product Lead",
  lanz: "Platform Operations",
  marc: "Festival Operations",
  tukodph_van: "Product Lead",
  tukodph_lanz: "Platform Operations",
  tukodph_marc: "Festival Operations",
};

export const HQ_OPERATOR_META: Record<
  string,
  { title: string; desk: string }
> = {
  vanz: {
    title: "Product Lead",
    desk: "SSP architecture, product strategy, and Super Admin policy.",
  },
  lanz: {
    title: "Platform Operations",
    desk: "Tenant licenses, intake verification, and network operations.",
  },
  marc: {
    title: "Festival Operations",
    desk: "Co-partner seasons, live event telemetry, gates, and go-live deployment.",
  },
  tukodph_van: {
    title: "Product Lead",
    desk: "SSP architecture, product strategy, and Super Admin policy.",
  },
  tukodph_lanz: {
    title: "Platform Operations",
    desk: "Tenant licenses, intake verification, and network operations.",
  },
  tukodph_marc: {
    title: "Festival Operations",
    desk: "Co-partner seasons, live event telemetry, gates, and go-live deployment.",
  },
};

export const HQ_SCOPE = [
  {
    title: "Create as co-partner",
    body: "Provision a festival tenant. TukodPH operates the digital festival at 30% of digital sponsor income.",
  },
  {
    title: "Manage festivals",
    body: "Identity, status, license, command center, CMS, staff, gates, and publish for every tenant.",
  },
  {
    title: "Manage events",
    body: "Create, publish, and open the program across the whole network.",
  },
  {
    title: "Dashboard",
    body: "Live tenants, turnout, income, pending intake, and Super Admin roster in one Headquarters view.",
  },
  {
    title: "Business intelligence",
    body: "Turnout, conversion, sponsor mix, income ledger, and co-partner commission (digital only).",
  },
  {
    title: "Full SSP access",
    body: "Intake, network, organizations, access keys, and every tenant command center.",
  },
];

export function hqTitle(username?: string | null) {
  if (!username) return "Super Admin";
  return HQ_TITLES[username] ?? "Super Admin";
}

export function hqDesk(username?: string | null) {
  if (!username) return "Full Solution System Portal.";
  return HQ_OPERATOR_META[username]?.desk ?? "Full Solution System Portal.";
}

export function HqOperatorStrip() {
  const profile = useOperatorProfile();
  if (!profile) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <Badge tone="live">Super Admin</Badge>
      <span className="text-fg">{profile.display_name}</span>
      <span className="hidden text-muted sm:inline">{hqTitle(profile.username)}</span>
      <span className="hidden font-mono text-xs text-muted lg:inline">{profile.username}</span>
    </div>
  );
}

export function HqBackLink() {
  return (
    <Link
      to="/ssp"
      className="inline-flex h-9 items-center rounded-md px-3 text-sm text-muted hover:bg-surface-2 hover:text-fg"
    >
      Back to HQ
    </Link>
  );
}
