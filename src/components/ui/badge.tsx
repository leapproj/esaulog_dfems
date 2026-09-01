import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium tracking-wide uppercase",
  {
    variants: {
      tone: {
        default: "bg-fg/10 text-fg",
        live: "bg-ok/15 text-ok",
        setup: "bg-warn/15 text-warn",
        draft: "bg-muted/15 text-muted",
        planning: "bg-fg/8 text-muted",
        danger: "bg-danger/15 text-danger",
      },
    },
    defaultVariants: { tone: "default" },
  },
);

export function Badge({
  className,
  tone,
  ...props
}: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}

export function statusTone(status: string) {
  const s = status.toUpperCase();
  if (s === "LIVE" || s === "ACTIVE" || s === "PUBLISHED" || s === "VALID") return "live" as const;
  if (s === "SETUP" || s === "WARN") return "setup" as const;
  if (s === "DRAFT") return "draft" as const;
  if (s === "PLANNING" || s === "COMPLETED") return "planning" as const;
  if (s === "ENDED" || s === "REJECTED") return "danger" as const;
  return "default" as const;
}
