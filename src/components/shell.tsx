import { Link } from "@tanstack/react-router";
import { OperatorButton } from "./operator-gate";
import { Wordmark } from "./brand";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type NavItem = { to: string; label: string; params?: Record<string, string> };

export function TopBar({
  kicker,
  items,
  trailing,
}: {
  kicker?: string;
  items?: NavItem[];
  trailing?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur">
      <div className="fiesta-ribbon" />
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
        <Link to="/" className="shrink-0">
          <Wordmark />
        </Link>
        {kicker ? (
          <span className="hidden text-xs tracking-[0.18em] text-muted uppercase sm:inline">
            {kicker}
          </span>
        ) : null}
        {items && items.length > 0 ? (
          <nav className="ml-2 hidden min-w-0 flex-1 items-center gap-1 overflow-x-auto md:flex">
            {items.map((item) => (
              <Link
                key={item.to + JSON.stringify(item.params ?? {}) + item.label}
                to={item.to}
                params={item.params}
                className="rounded-md px-2.5 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-fg [&.active]:text-accent"
                activeOptions={{ exact: item.to.split("/").length <= 2 }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : (
          <div className="flex-1" />
        )}
        <div className="ml-auto flex items-center gap-3">
          {trailing}
          <OperatorButton />
        </div>
      </div>
      {items && items.length > 0 ? (
        <nav className="flex gap-1 overflow-x-auto border-t border-border px-3 py-2 md:hidden">
          {items.map((item) => (
            <Link
              key={item.to + item.label}
              to={item.to}
              params={item.params}
              className="shrink-0 rounded-md px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-fg [&.active]:bg-surface-2 [&.active]:text-fg"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      ) : null}
    </header>
  );
}

export function Page({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <main className={cn("mx-auto w-full max-w-6xl px-4 py-8", className)}>{children}</main>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs tracking-[0.2em] text-muted uppercase">{eyebrow}</p>
        ) : null}
        <h1 className="font-display text-3xl tracking-tight text-fg sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl bg-surface p-4 shadow-[var(--shadow-border)]">
      <p className="text-xs tracking-wide text-muted uppercase">{label}</p>
      <p className="mt-2 font-display text-3xl tabular-nums tracking-tight">{value}</p>
      {hint ? <p className="mt-1 text-xs text-subtle">{hint}</p> : null}
    </div>
  );
}
