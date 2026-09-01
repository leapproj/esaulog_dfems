import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { SiteFooter, SiteNav } from "@/components/site-nav";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { setOperatorSession } from "@/lib/operator-session";
import { signUpTenant } from "@/lib/server/operator-auth";

export const Route = createFileRoute("/apply")({ component: ApplyPage });

function ApplyPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    username: "",
    password: "",
    display_name: "",
    organization_name: "",
    contact_email: "",
  });
  const mut = useMutation({
    mutationFn: () => signUpTenant({ data: form }),
    onSuccess: (res) => {
      setOperatorSession(res.token, res.profile);
      void nav({ to: "/hub" });
    },
  });
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-xl px-4 py-12">
        <p className="text-xs tracking-[0.28em] text-muted uppercase">Apply as tenant</p>
        <h1 className="mt-3 font-display text-4xl tracking-tight">Create your organizer account</h1>
        <p className="mt-3 text-sm text-muted">
          Sign up to draft festivals, organize events, and publish when the season is ready. Payment
          happens at publish — not at signup.
        </p>
        <form
          className="mt-8 grid gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            mut.mutate();
          }}
        >
          {(
            [
              ["organization_name", "Organization / LGU"],
              ["display_name", "Your name"],
              ["contact_email", "Contact email"],
              ["username", "User ID"],
              ["password", "Passkey"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="grid gap-1">
              <Label htmlFor={key}>{label}</Label>
              <Input
                id={key}
                required
                type={key === "password" ? "password" : key.includes("email") ? "email" : "text"}
                autoComplete={key === "password" ? "new-password" : key === "username" ? "username" : "on"}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
          {mut.isError ? (
            <p className="text-sm text-danger">{(mut.error as Error).message}</p>
          ) : null}
          <Button type="submit" disabled={mut.isPending}>
            {mut.isPending ? "Creating account…" : "Create tenant account"}
          </Button>
        </form>
        <p className="mt-6 text-sm text-muted">
          Already have an account?{" "}
          <Link to="/login" className="text-fg underline-offset-4 hover:underline">
            Sign in
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
