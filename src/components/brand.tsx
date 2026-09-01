import { cn } from "@/lib/utils";

export function EsaulogMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("text-accent", className)}
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="currentColor" opacity="0.16" />
      <path
        d="M16 4 L20.5 11.5 L28 16 L20.5 20.5 L16 28 L11.5 20.5 L4 16 L11.5 11.5 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M16 10 L18.4 13.6 L22 16 L18.4 18.4 L16 22 L13.6 18.4 L10 16 L13.6 13.6 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <EsaulogMark className="size-7" />
      <span className="font-display text-xl tracking-tight text-fg">eSAULOG</span>
    </span>
  );
}
