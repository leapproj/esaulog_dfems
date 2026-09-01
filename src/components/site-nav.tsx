import { Link } from "@tanstack/react-router";
import { OperatorHomeLink } from "./operator-gate";
import { Wordmark } from "./brand";

const LINKS = [
  { to: "/product", label: "Product" },
  { to: "/packages", label: "Packages" },
  { to: "/festivals", label: "Festivals" },
  { to: "/samples", label: "Websites" },
  { to: "/apply", label: "Apply" },
] as const;

export function SiteNav() {
  return (
    <>
      <div className="fiesta-ribbon" />
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-5">
        <Link to="/" className="shrink-0">
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-3 py-2 text-sm text-muted hover:text-fg [&.active]:text-fg"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <OperatorHomeLink />
        </div>
      </header>
      <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 md:hidden">
        {LINKS.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="shrink-0 rounded-md px-3 py-2 text-sm text-muted hover:text-fg [&.active]:text-fg"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>eSAULOG DFEMS · a TukodPH product</p>
        <p className="text-subtle">
          From signal to shipped.{" "}
          <a href="https://tukodph.com" className="text-fg underline-offset-4 hover:underline">
            tukodph.com
          </a>
          {" · "}
          <Link to="/ssp/login" className="text-fg underline-offset-4 hover:underline">
            HQ Admin Solution System Portal
          </Link>
        </p>
      </div>
    </footer>
  );
}
