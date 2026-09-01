import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { EsaulogMark } from "@/components/brand";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { setOperatorSession } from "@/lib/operator-session";
import { signInTenant } from "@/lib/server/operator-auth";
import { Building2, Shield, ArrowRight, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/login")({ component: Login });

const DEMOS = [
  { id: "higalaay", pass: "higalaay2026", name: "Higalaay 2026", org: "Cagayan de Oro City" },
  { id: "diyandi", pass: "diyandi2026", name: "Diyandi 2026", org: "Iligan City" },
  { id: "lanzones", pass: "lanzones2026", name: "Lanzones 2026", org: "Province of Camiguin" },
];

function Login() {
  const nav = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const mut = useMutation({
    mutationFn: () => signInTenant({ data: { username, password } }),
    onSuccess: (res) => {
      setOperatorSession(res.token, res.profile);
      void nav({ to: "/hub" });
    },
  });

  return (
    <main className="sunburst grid min-h-screen place-items-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted">
            <EsaulogMark className="size-8" />
            <span className="font-display text-2xl font-bold tracking-tight text-fg">eSAULOG</span>
          </Link>
          <Link
            to="/ssp/login"
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-semibold text-accent hover:border-accent"
          >
            <Shield className="size-3" />
            Super Admin HQ
          </Link>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-[var(--shadow-border)]">
          <div className="flex items-center gap-2 text-muted">
            <Building2 className="size-4 text-accent" />
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Organizer Portal</span>
          </div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-fg">
            Tenant sign in
          </h1>
          <p className="mt-2 text-sm text-muted">
            Enter your festival organizer User ID and passkey to access your festival command center.
          </p>

          <form
            className="mt-6 grid gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              mut.mutate();
            }}
          >
            <div className="grid gap-1.5">
              <Label htmlFor="username" className="text-xs font-medium text-fg">
                Organizer User ID
              </Label>
              <Input
                id="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. higalaay, diyandi"
                className="font-mono text-sm"
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="password" className="text-xs font-medium text-fg">
                Organizer Passkey
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter passkey"
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
                <p className="font-semibold">Sign in failed</p>
                <p className="mt-0.5">{(mut.error as Error).message}</p>
                {(mut.error as Error).message.includes("Super Admin") && (
                  <Link
                    to="/ssp/login"
                    className="mt-2 inline-flex items-center gap-1 font-medium text-accent underline underline-offset-2"
                  >
                    Go to TukodPH SSP Login <ArrowRight className="size-3" />
                  </Link>
                )}
              </div>
            )}

            <Button type="submit" disabled={mut.isPending || !username || !password} className="mt-2">
              {mut.isPending ? "Signing in…" : "Enter Command Center"}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted">
            New festival organizer or LGU?{" "}
            <Link to="/apply" className="font-medium text-fg underline underline-offset-4 hover:text-accent">
              Apply for a license
            </Link>
          </p>

          <div className="mt-6 rounded-xl border border-border bg-surface-2 p-4 text-xs">
            <p className="font-semibold uppercase tracking-wider text-muted">Demo Tenant Desks</p>
            <ul className="mt-3 space-y-2">
              {DEMOS.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2 border-b border-border/50 pb-2 last:border-0 last:pb-0">
                  <div>
                    <span className="font-semibold text-fg">{d.name}</span>
                    <span className="block font-mono text-[11px] text-muted">
                      {d.id} · {d.pass}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    className="text-xs"
                    onClick={() => {
                      setUsername(d.id);
                      setPassword(d.pass);
                    }}
                  >
                    Use
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* TukodPH SSP Callout */}
          <div className="mt-6 rounded-xl border border-accent/20 bg-accent/5 p-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-fg">TukodPH Core Team?</p>
                <p className="text-muted">Super Admin solution portal access.</p>
              </div>
              <Link
                to="/ssp/login"
                className="inline-flex items-center gap-1 rounded-lg bg-accent px-3 py-1.5 font-semibold text-accent-fg hover:bg-accent/90"
              >
                SSP HQ
                <ArrowRight className="size-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
