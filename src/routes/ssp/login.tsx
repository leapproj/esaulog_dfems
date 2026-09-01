import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { EsaulogMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { setOperatorSession } from "@/lib/operator-session";
import { signInSsp } from "@/lib/server/operator-auth";
import { Shield, ArrowRight, Eye, EyeOff, AlertTriangle, LogIn } from "lucide-react";

export const Route = createFileRoute("/ssp/login")({ component: SspLogin });

const SUPER_ADMINS = [
  {
    id: "vanz",
    name: "Van Zambrano",
    role: "Product Lead",
    desk: "SSP architecture, product strategy, & platform policy",
    passkey: "vanz92624",
  },
  {
    id: "lanz",
    name: "Lanz",
    role: "Platform Operations",
    desk: "Tenant licenses, intake verification, & network ops",
    passkey: "lanz615243",
  },
  {
    id: "marc",
    name: "Marc",
    role: "Festival Operations",
    desk: "Co-partner seasons, live telemetry, & gate deployment",
    passkey: "marc000000",
  },
];

function SspLogin() {
  const nav = useNavigate();
  const [username, setUsername] = useState("vanz");
  const [password, setPassword] = useState("vanz92624");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<string | null>("vanz");

  const mut = useMutation({
    mutationFn: (overrideCreds?: { u: string; p: string }) => {
      const u = overrideCreds ? overrideCreds.u : username;
      const p = overrideCreds ? overrideCreds.p : password;
      return signInSsp({ data: { username: u, password: p } });
    },
    onSuccess: (res) => {
      setOperatorSession(res.token, res.profile);
      void nav({ to: "/ssp" });
    },
  });

  const handleSelectAdmin = (admin: typeof SUPER_ADMINS[number]) => {
    setUsername(admin.id);
    setPassword(admin.passkey);
    setSelectedAdmin(admin.id);
  };

  const handleDirectLogin = (admin: typeof SUPER_ADMINS[number]) => {
    setUsername(admin.id);
    setPassword(admin.passkey);
    setSelectedAdmin(admin.id);
    mut.mutate({ u: admin.id, p: admin.passkey });
  };

  return (
    <main className="sunburst min-h-screen px-4 py-12">
      <div className="mx-auto max-w-4xl">
        {/* Brand Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
          <Link to="/" className="flex items-center gap-2.5 text-muted transition-colors hover:text-fg">
            <EsaulogMark className="size-8 text-accent" />
            <div>
              <span className="font-display text-2xl font-bold tracking-tight text-fg">eSAULOG</span>
              <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-bold text-accent uppercase tracking-wider">
                TukodPH SSP
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Not TukodPH Staff?</span>
            <Link
              to="/login"
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium text-fg shadow-xs hover:border-accent hover:text-accent"
            >
              Festival Tenant Sign In
              <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-12">
          {/* Left Column: Sign In Form */}
          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-[var(--shadow-border)]">
              <div className="flex items-center gap-2 text-accent">
                <Shield className="size-5" />
                <span className="text-xs font-bold uppercase tracking-[0.2em]">Solution System Portal</span>
              </div>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg">
                Super Admin HQ
              </h1>
              <p className="mt-2 text-sm text-muted">
                Assigned TukodPH Team operators only. Enter your Super Admin User ID and secret passkey to access the network command hub.
              </p>

              {/* Notice Banner */}
              <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
                <p className="flex items-center gap-1.5 font-medium">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  Tenant Restriction
                </p>
                <p className="mt-0.5 text-[11px] text-amber-200/80">
                  This door is strictly for TukodPH Headquarters. Festival tenants, LGUs, and organizers sign in via the Tenant Portal.
                </p>
              </div>

              <form
                className="mt-6 grid gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  mut.mutate();
                }}
              >
                <div className="grid gap-1.5">
                  <Label htmlFor="ssp-id" className="text-xs font-medium text-fg">
                    Super Admin User ID
                  </Label>
                  <div className="relative">
                    <Input
                      id="ssp-id"
                      autoComplete="username"
                      value={username}
                      onChange={(e) => {
                        setUsername(e.target.value);
                        setSelectedAdmin(null);
                      }}
                      placeholder="e.g. vanz, lanz, marc"
                      className="pr-10 font-mono text-sm"
                      required
                    />
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted">
                      <Shield className="size-4" />
                    </div>
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="ssp-key" className="text-xs font-medium text-fg">
                    Super Admin Passkey
                  </Label>
                  <div className="relative">
                    <Input
                      id="ssp-key"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setSelectedAdmin(null);
                      }}
                      placeholder="Enter assigned passkey"
                      className="pr-10 font-mono text-sm"
                      required
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-fg"
                      aria-label={showPassword ? "Hide passkey" : "Show passkey"}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                {mut.isError && (
                  <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
                    <p className="font-semibold">Authentication Failed</p>
                    <p className="mt-0.5">{(mut.error as Error).message}</p>
                    {(mut.error as Error).message.includes("Tenant") && (
                      <Link
                        to="/login"
                        className="mt-2 inline-flex items-center gap-1 font-medium text-red-300 underline underline-offset-2 hover:text-white"
                      >
                        Switch to Tenant Portal <ArrowRight className="size-3" />
                      </Link>
                    )}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={mut.isPending || !username || !password}
                  size="lg"
                  className="mt-2 w-full gap-2 bg-accent py-3 font-semibold text-accent-fg hover:bg-accent/90 shadow-md transition-all text-sm"
                >
                  <LogIn className="size-4" />
                  <span>
                    {mut.isPending
                      ? "Authenticating & Entering HQ Portal…"
                      : "Log In to HQ Admin Solution System Portal"}
                  </span>
                </Button>
              </form>
            </div>
          </div>

          {/* Right Column: Assigned TukodPH Super Admins & Passkeys */}
          <div className="space-y-6 lg:col-span-6">
            <div className="rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-border)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg font-semibold text-fg">
                    Assigned TukodPH Team
                  </h2>
                  <p className="text-xs text-muted">
                    Click any Super Admin below to enter the Solution System Portal:
                  </p>
                </div>
                <span className="rounded-full bg-surface-2 px-2.5 py-1 text-[11px] font-bold text-muted">
                  3 Operators
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {SUPER_ADMINS.map((admin) => {
                  const isSelected = selectedAdmin === admin.id || username === admin.id;
                  return (
                    <div
                      key={admin.id}
                      onClick={() => handleSelectAdmin(admin)}
                      className={`group relative cursor-pointer rounded-xl border p-4 transition-all ${
                        isSelected
                          ? "border-accent bg-accent/10 shadow-sm ring-1 ring-accent/30"
                          : "border-border bg-surface-2 hover:border-accent/50 hover:bg-surface"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex size-9 shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold ${
                              isSelected ? "bg-accent text-accent-fg" : "bg-surface text-fg shadow-xs"
                            }`}
                          >
                            {admin.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-display font-semibold text-fg">{admin.name}</p>
                              <span className="rounded-md bg-surface px-1.5 py-0.5 text-[10px] font-bold text-muted uppercase">
                                {admin.role}
                              </span>
                            </div>
                            <p className="mt-0.5 text-xs text-muted">{admin.desk}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                              <span className="font-mono text-muted">
                                ID: <strong className="text-fg">{admin.id}</strong>
                              </span>
                              <span className="font-mono text-muted">
                                Passkey: <strong className="text-accent">{admin.passkey}</strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        <Button
                          size="sm"
                          type="button"
                          disabled={mut.isPending}
                          className="shrink-0 gap-1.5 bg-accent text-xs font-semibold text-accent-fg hover:bg-accent/90"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDirectLogin(admin);
                          }}
                        >
                          <LogIn className="size-3.5" />
                          <span>Enter HQ</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Architectural & Portal Separation Card */}
            <div className="rounded-2xl border border-border bg-surface-2 p-5 text-xs text-muted">
              <p className="font-semibold text-fg">HQ Solution System Portal (SSP)</p>
              <p className="mt-1.5 leading-relaxed">
                TukodPH SSP provides root governance across all festival tenants, revenue share auditing (25% Lite vs 40% Pro), intake approvals, and network telemetry.
              </p>
              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <span className="text-[11px] text-muted">Are you a festival organizer?</span>
                <Link to="/login" className="font-medium text-accent hover:underline">
                  Go to Tenant Desk →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
