import Link from "next/link";
import { AccountMenu } from "./AccountMenu";
import { CartButton } from "./CartButton";
import { CartDrawer } from "./CartDrawer";

const links = [
  { href: "/", label: "Home" },
  { href: "/#catalog", label: "Catalog" },
  { href: "/membership", label: "Subscription" },
  { href: "/how-it-works", label: "How It Works" },
] as const;

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M16.5 16.5L20.5 20.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

export function SiteNav() {
  return (
    <>
      <header className="sticky top-0 z-50 bg-paper">
        <nav
          className="flex items-center justify-between px-5 py-4 md:px-8 md:py-5"
          aria-label="Primary"
        >
          <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 md:gap-x-8">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-ink transition-opacity hover:opacity-60"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4 text-ink md:gap-5">
            <button type="button" className="p-0.5 transition-opacity hover:opacity-60" aria-label="Search">
              <SearchIcon />
            </button>
            <AccountMenu />
            <CartButton />
          </div>
        </nav>
        <div className="h-px w-full bg-brass" aria-hidden="true" />
      </header>
      <CartDrawer />
    </>
  );
}
