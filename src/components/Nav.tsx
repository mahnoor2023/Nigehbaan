"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ROLES = [
  { href: "/command", label: "Command Center", match: ["/command", "/households", "/analytics"] },
  { href: "/field", label: "Field App", match: ["/field"] },
  { href: "/shelter", label: "Shelter Desk", match: ["/shelter"] },
];

const LINKS = [
  { href: "/command", label: "Command" },
  { href: "/households", label: "Households" },
  { href: "/analytics", label: "Analytics" },
  { href: "/about", label: "About" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-[1000] border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center justify-between gap-3">
          <Link href="/command" className="text-lg font-bold tracking-tight text-slate-900">
            Nigehbaan <span className="font-normal text-slate-500">نگہبان</span>
          </Link>
        </div>

        <div role="tablist" aria-label="Switch role" className="flex w-full overflow-x-auto rounded-lg bg-slate-100 p-1 sm:w-auto">
          {ROLES.map((r) => {
            const active = r.match.some((m) => pathname.startsWith(m));
            return (
              <Link
                key={r.label}
                href={r.href}
                role="tab"
                aria-selected={active}
                className={`flex-1 whitespace-nowrap rounded-md px-3 py-1.5 text-center text-sm font-medium transition sm:flex-none ${
                  active ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {r.label}
              </Link>
            );
          })}
        </div>
      </div>

      <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 pb-2 text-sm" aria-label="Pages">
        {LINKS.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.href + l.label}
              href={l.href}
              className={`whitespace-nowrap rounded px-2 py-1 ${active ? "font-semibold text-blue-700" : "text-slate-600 hover:text-slate-900"}`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
