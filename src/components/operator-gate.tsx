import { Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  clearOperatorSession,
  getOperatorProfile,
  type OperatorProfile,
} from "@/lib/operator-session";
import { Skeleton } from "./ui/skeleton";

export function useOperatorProfile() {
  const [profile, setProfile] = useState<OperatorProfile | null | undefined>(undefined);
  useEffect(() => {
    setProfile(getOperatorProfile());
  }, []);
  return profile;
}

export function OperatorGate({ children }: { children: ReactNode }) {
  const profile = useOperatorProfile();
  const nav = useNavigate();
  useEffect(() => {
    if (profile === null) void nav({ to: "/login" });
  }, [profile, nav]);
  if (profile === undefined) return <GateSkeleton />;
  if (!profile) return <GateSkeleton />;
  return <>{children}</>;
}

export function SspGate({ children }: { children: ReactNode }) {
  const profile = useOperatorProfile();
  const nav = useNavigate();
  useEffect(() => {
    if (profile === null) void nav({ to: "/ssp/login" });
    else if (profile && profile.kind !== "ssp") void nav({ to: "/hub" });
  }, [profile, nav]);
  if (profile === undefined || !profile || profile.kind !== "ssp") return <GateSkeleton />;
  return <>{children}</>;
}

function GateSkeleton() {
  return (
    <div className="min-h-screen bg-bg p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function OperatorButton() {
  const profile = useOperatorProfile();
  const nav = useNavigate();
  if (!profile) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="hidden max-w-[10rem] truncate text-xs text-muted sm:inline">
        {profile.display_name}
      </span>
      <button
        type="button"
        className="rounded-md px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-fg"
        onClick={() => {
          clearOperatorSession();
          void nav({ to: "/" });
        }}
      >
        Sign out
      </button>
    </div>
  );
}

export function OperatorHomeLink() {
  const profile = useOperatorProfile();
  if (!profile) {
    return (
      <Link to="/login">
        <span className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-fg">
          Sign in
        </span>
      </Link>
    );
  }
  if (profile.kind === "ssp") {
    return (
      <Link to="/ssp">
        <span className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-fg">
          Headquarters
        </span>
      </Link>
    );
  }
  return (
    <Link to="/hub">
      <span className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-accent-fg">
        Command center
      </span>
    </Link>
  );
}
